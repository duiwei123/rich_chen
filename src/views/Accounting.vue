<template>
  <div class="record-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <div class="header-content">
        <h2>📝 交易流水记录</h2>
        <p>每一笔收支都有迹可循</p>
      </div>
      <el-button type="primary" round @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        <span>添加记录</span>
      </el-button>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="income">收入</el-radio-button>
          <el-radio-button value="expense">支出</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          format="MM-DD"
          value-format="YYYY-MM-DD"
          style="margin-left: 12px"
        />
      </div>
      <div class="filter-right">
        <el-input
          v-model="keyword"
          placeholder="搜索备注..."
          clearable
          size="small"
          style="width: 180px"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-label">收入合计</span>
        <span class="summary-value income">+¥ 18,650</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">支出合计</span>
        <span class="summary-value expense">-¥ 8,420</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">结余</span>
        <span class="summary-value balance">¥ 10,230</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">笔数</span>
        <span class="summary-value">48 笔</span>
      </div>
    </div>

    <!-- 交易记录列表 -->
    <div class="record-list">
      <el-table :data="filteredRecords" style="width: 100%" stripe>
        <el-table-column prop="date" label="日期" width="100" fixed>
          <template #default="{ row }">
            <span class="date-cell">{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <div class="category-cell">
              <span>{{ row.category }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-cell" :class="row.type">
              {{ row.type === 'income' ? '+' : '-'}}¥ {{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180">
          <template #default="{ row }">
            <span class="remark-cell">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账户" width="100">
          <template #default="{ row }">
            <span class="account-cell">{{ row.account }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-popconfirm title="确定删除这条记录?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button text type="danger" size="small">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        background
      />
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingRecord ? '编辑记录' : '添加记录'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="income">收入</el-radio>
            <el-radio value="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :controls="false" style="width: 100%">
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option-group v-for="group in categoryOptions" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="账户" prop="account">
          <el-select v-model="form.account" placeholder="请选择账户" style="width: 100%">
            <el-option label="银行卡" value="银行卡" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信" value="微信" />
            <el-option label="现金" value="现金" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const filterType = ref('all')
const dateRange = ref<[string, string] | null>(null)
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(48)
const showAddDialog = ref(false)
const editingRecord = ref<any>(null)
const formRef = ref<FormInstance>()

const form = ref({
  type: 'expense',
  amount: 0,
  category: '',
  date: '',
  account: '',
  remark: ''
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  account: [{ required: true, message: '请选择账户', trigger: 'change' }]
}

// 交易记录数据
const records = ref([
  { id: 1, date: '2024-04-07', type: 'expense', amount: 25, category: '餐饮', remark: '午餐 - 兰州拉面', account: '支付宝' },
  { id: 2, date: '2024-04-07', type: 'income', amount: 12000, category: '工资', remark: '3月工资发放', account: '银行卡' },
  { id: 3, date: '2024-04-06', type: 'expense', amount: 6, category: '交通', remark: '地铁出行', account: '微信' },
  { id: 4, date: '2024-04-06', type: 'expense', amount: 89, category: '购物', remark: '网购 - 生活用品', account: '支付宝' },
  { id: 5, date: '2024-04-06', type: 'expense', amount: 35, category: '餐饮', remark: '晚餐 - 外卖', account: '微信' },
  { id: 6, date: '2024-04-05', type: 'income', amount: 2000, category: '奖金', remark: '项目奖金', account: '银行卡' },
  { id: 7, date: '2024-04-05', type: 'expense', amount: 128, category: '餐饮', remark: '朋友聚餐', account: '银行卡' },
  { id: 8, date: '2024-04-04', type: 'expense', amount: 15, category: '餐饮', remark: '早餐', account: '现金' },
  { id: 9, date: '2024-04-04', type: 'expense', amount: 68, category: '购物', remark: '水果零食', account: '支付宝' },
  { id: 10, date: '2024-04-03', type: 'expense', amount: 30, category: '娱乐', remark: '电影票', account: '微信' },
  { id: 11, date: '2024-04-03', type: 'income', amount: 350, category: '兼职', remark: '兼职佣金', account: '支付宝' },
  { id: 12, date: '2024-04-02', type: 'expense', amount: 56, category: '餐饮', remark: '午饭', account: '银行卡' },
  { id: 13, date: '2024-04-02', type: 'expense', amount: 180, category: '购物', remark: '书籍', account: '京东' },
  { id: 14, date: '2024-04-01', type: 'expense', amount: 12, category: '交通', remark: '共享单车', account: '微信' },
  { id: 15, date: '2024-04-01', type: 'income', amount: 3000, category: '退款', remark: '退货退款', account: '银行卡' }
])

// 分类选项
const categoryOptions = ref([
  {
    label: '收入',
    options: [
      { value: '工资', label: '工资' },
      { value: '奖金', label: '奖金' },
      { value: '兼职', label: '兼职' },
      { value: '投资收益', label: '投资收益' },
      { value: '退款', label: '退款' },
      { value: '其他收入', label: '其他收入' }
    ]
  },
  {
    label: '支出',
    options: [
      { value: '餐饮', label: '餐饮' },
      { value: '交通', label: '交通' },
      { value: '购物', label: '购物' },
      { value: '娱乐', label: '娱乐' },
      { value: '居住', label: '居住' },
      { value: '医疗', label: '医疗' },
      { value: '教育', label: '教育' },
      { value: '其他支出', label: '其他支出' }
    ]
  }
])

const filteredRecords = computed(() => {
  let result = records.value
  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value)
  }
  if (keyword.value) {
    result = result.filter(r => r.remark.includes(keyword.value))
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const handleEdit = (row: any) => {
  editingRecord.value = row
  form.value = { ...row }
  showAddDialog.value = true
}

const handleDelete = (row: any) => {
  const idx = records.value.findIndex(r => r.id === row.id)
  if (idx > -1) {
    records.value.splice(idx, 1)
    total.value--
    ElMessage.success('删除成功')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  if (editingRecord.value) {
    const idx = records.value.findIndex(r => r.id === editingRecord.value.id)
    if (idx > -1) {
      records.value[idx] = { ...form.value, id: editingRecord.value.id }
    }
    ElMessage.success('修改成功')
  } else {
    records.value.unshift({
      id: Date.now(),
      ...form.value
    })
    total.value++
    ElMessage.success('添加成功')
  }
  showAddDialog.value = false
  editingRecord.value = null
  form.value = {
    type: 'expense',
    amount: 0,
    category: '',
    date: '',
    account: '',
    remark: ''
  }
}
</script>

<style scoped>
/* 主题变量 - 交易记录模块 */
.record-root {
  --theme-color: #1abc9c;
  --theme-light: rgba(26, 188, 156, 0.1);

  padding: var(--space-lg);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
}

/* 头���标题 */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
  border-radius: 12px;
  background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
  box-shadow: 0 4px 16px rgba(26, 188, 156, 0.25);
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #fff;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

/* 筛选工具栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.filter-left,
.filter-right {
  display: flex;
  align-items: center;
}

/* 统计摘要 */
.summary-bar {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
}

.summary-value.income {
  color: #27ae60;
}

.summary-value.expense {
  color: #e74c3c;
}

.summary-value.balance {
  color: #3498db;
}

/* 记录列表 */
.record-list {
  margin-bottom: var(--space-md);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.date-cell {
  font-size: 12px;
  color: #909399;
}

.amount-cell {
  font-size: 14px;
  font-weight: 600;
}

.amount-cell.income {
  color: #27ae60;
}

.amount-cell.expense {
  color: #e74c3c;
}

.remark-cell {
  color: #606266;
}

.account-cell {
  font-size: 12px;
  color: #909399;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>