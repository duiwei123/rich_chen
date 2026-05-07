<template>
  <div class="record-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <div class="header-content">
        <h2>💰 收支记录</h2>
        <p>快速记录每一笔收支</p>
      </div>
      <div class="quick-add">
        <el-button type="success" round @click="quickAdd('income')">
          <el-icon><Plus /></el-icon>
          记收入
        </el-button>
        <el-button type="danger" round @click="quickAdd('expense')">
          <el-icon><Minus /></el-icon>
          记支出
        </el-button>
      </div>
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
          start-placeholder="开始"
          end-placeholder="结束"
          size="small"
          format="MM-DD"
          value-format="YYYY-MM-DD"
          style="margin-left: 12px"
        />
      </div>
      <div class="filter-right">
        <el-select v-model="filterAccount" placeholder="账户筛选" size="small" style="width: 130px; margin-right: 8px">
          <el-option label="全部账户" value="" />
          <el-option v-for="acc in accounts" :key="acc.id" :label="acc.name" :value="acc.name" />
        </el-select>
        <el-select v-model="filterCategory" placeholder="类别筛选" size="small" style="width: 130px">
          <el-option label="全部分类" value="" />
          <el-option-group v-for="group in categoryOptions" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-option-group>
        </el-select>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-label">收入合计</span>
        <span class="summary-value income">+¥ {{ totalIncome.toLocaleString() }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">支出合计</span>
        <span class="summary-value expense">-¥ {{ totalExpense.toLocaleString() }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">结余</span>
        <span class="summary-value" :class="totalIncome - totalExpense >= 0 ? 'income' : 'expense'">
          ¥ {{ (totalIncome - totalExpense).toLocaleString() }}
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">记录笔数</span>
        <span class="summary-value">{{ filteredRecords.length }} 笔</span>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="record-list glass-card">
      <el-table :data="filteredRecords" style="width: 100%" stripe>
        <el-table-column prop="date" label="日期时间" width="160" fixed>
          <template #default="{ row }">
            <span class="date-cell">{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" fixed>
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small" effect="dark">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="90">
          <template #default="{ row }">
            <span class="category-cell">{{ row.category }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="110" align="right">
          <template #default="{ row }">
            <span class="amount-cell" :class="row.type">
              {{ row.type === 'income' ? '+' : '-'}}¥ {{ row.amount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账户" width="110">
          <template #default="{ row }">
            <span class="account-cell">{{ row.account }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180">
          <template #default="{ row }">
            <span class="remark-cell">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-popconfirm title="确定删除?" @confirm="handleDelete(row)">
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

    <!-- 快速记录弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="income" :disabled="dialogMode === 'edit'">收入</el-radio>
            <el-radio value="expense" :disabled="dialogMode === 'edit'">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :controls="false" style="width: 100%">
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
            <el-option-group v-for="group in categoryOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="账户" prop="account">
          <el-select v-model="form.account" placeholder="选择账户" style="width: 100%">
            <el-option v-for="acc in accounts" :key="acc.id" :label="acc.name" :value="acc.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingRecord = ref<any>(null)
const formRef = ref<FormInstance>()

const filterType = ref('all')
const dateRange = ref<[string, string] | null>(null)
const filterAccount = ref('')
const filterCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(48)

const form = ref({
  type: 'expense',
  amount: 0,
  category: '',
  account: '',
  date: '',
  remark: ''
})

const rules: FormRules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  account: [{ required: true, message: '请选择账户', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

// 账户选项
const accounts = ref([
  { id: 1, name: '招商银行储蓄卡' },
  { id: 2, name: '支付宝' },
  { id: 3, name: '微信钱包' },
  { id: 4, name: '建设银行储蓄卡' },
  { id: 5, name: '现金' }
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

// 记录数据
const records = ref([
  { id: 1, date: '2024-04-07 12:30', type: 'expense', amount: 25, category: '餐饮', account: '支付宝', remark: '午餐 - 兰州拉面' },
  { id: 2, date: '2024-04-07 09:00', type: 'income', amount: 12000, category: '工资', account: '招商银行储蓄卡', remark: '3月工资发放' },
  { id: 3, date: '2024-04-06 18:20', type: 'expense', amount: 6, category: '交通', account: '微信钱包', remark: '地铁出行' },
  { id: 4, date: '2024-04-06 14:50', type: 'expense', amount: 89, category: '购物', account: '支付宝', remark: '网购 - 生活用品' },
  { id: 5, date: '2024-04-06 19:30', type: 'expense', amount: 35, category: '餐饮', account: '微信钱包', remark: '晚餐 - 外卖' },
  { id: 6, date: '2024-04-05 10:15', type: 'income', amount: 2000, category: '奖金', account: '招商银行储蓄卡', remark: '项目奖金' },
  { id: 7, date: '2024-04-05 20:30', type: 'expense', amount: 128, category: '餐饮', account: '银行卡', remark: '朋友聚餐' },
  { id: 8, date: '2024-04-04 08:30', type: 'expense', amount: 15, category: '餐饮', account: '现金', remark: '早餐' },
  { id: 9, date: '2024-04-04 15:20', type: 'expense', amount: 68, category: '购物', account: '支付宝', remark: '水果零食' },
  { id: 10, date: '2024-04-03 19:00', type: 'expense', amount: 30, category: '娱乐', account: '微信钱包', remark: '电影票' }
])

const dialogTitle = computed(() => {
  if (dialogMode.value === 'edit') return '编辑记录'
  return form.value.type === 'income' ? '记收入' : '记支出'
})

const totalIncome = computed(() => records.value.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0))
const totalExpense = computed(() => records.value.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0))

const filteredRecords = computed(() => {
  let result = records.value

  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value)
  }

  if (filterAccount.value) {
    result = result.filter(r => r.account === filterAccount.value)
  }

  if (filterCategory.value) {
    result = result.filter(r => r.category === filterCategory.value)
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const quickAdd = (type: string) => {
  dialogMode.value = 'add'
  editingRecord.value = null
  form.value = {
    type,
    amount: 0,
    category: '',
    account: '',
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogMode.value = 'edit'
  editingRecord.value = row
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  const idx = records.value.findIndex(r => r.id === row.id)
  if (idx > -1) {
    records.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  if (dialogMode.value === 'edit') {
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

  dialogVisible.value = false
}
</script>

<style scoped>
.record-root {
  --theme-color: #27ae60;
  --theme-light: rgba(39, 174, 96, 0.1);
  --theme-gradient: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);

  padding: var(--space-lg);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
  border-radius: 12px;
  background: var(--theme-gradient);
  box-shadow: 0 4px 16px rgba(39, 174, 96, 0.25);
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

.quick-add {
  display: flex;
  gap: var(--space-sm);
}

/* 筛选栏 */
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

/* 列表 */
.glass-card {
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

.category-cell {
  font-size: 12px;
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

.account-cell {
  font-size: 12px;
  color: #606266;
}

.remark-cell {
  color: #606266;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>