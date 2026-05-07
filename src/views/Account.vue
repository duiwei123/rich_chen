<template>
  <div class="account-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <div class="header-content">
        <h2>💳 账户管理</h2>
        <p>管理您的各种资产账户</p>
      </div>
      <el-button type="primary" round @click="openDialog()">
        <el-icon><Plus /></el-icon>
        添加账户
      </el-button>
    </div>

    <!-- 账户卡片列表 -->
    <div class="account-grid">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="account-card"
        :class="account.accountType"
      >
        <div class="card-header">
          <div class="account-type-badge">
            <el-icon><Wallet /></el-icon>
            <span>{{ account.accountType }}</span>
          </div>
          <el-dropdown trigger="click">
            <el-button text circle size="small">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openDialog(account)">编辑</el-dropdown-item>
                <el-dropdown-item @click="handleDelete(account)" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="account-name">{{ account.name }}</div>
        <div class="account-balance">
          <span :class="{ negative: account.balance < 0 }">¥ {{ account.balance.toLocaleString() }}</span>
        </div>
        <div class="account-footer">
          <span class="account-user">{{ account.user }}</span>
          <span class="account-date">添加于 {{ account.createTime }}</span>
        </div>
      </div>

      <!-- 添加账户卡片 -->
      <div class="account-card add-card" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        <span>添加新账户</span>
      </div>
    </div>

    <!-- 账户统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">账户总数</span>
        <span class="stat-value">{{ accounts.length }} 个</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总资产</span>
        <span class="stat-value income">¥ {{ totalBalance.toLocaleString() }}</span>
      </div>
    </div>

    <!-- 账户流水明细 -->
    <div class="glass-card detail-card">
      <div class="card-header">
        <span>📋 账户流水明细</span>
        <el-select v-model="selectedAccount" placeholder="选择账户" size="small" style="width: 150px">
          <el-option label="全部账户" value="" />
          <el-option v-for="acc in accounts" :key="acc.id" :label="acc.name" :value="acc.id" />
        </el-select>
      </div>
      <el-table :data="filteredFlows" size="small" max-height="300">
        <el-table-column prop="date" label="日期" width="140" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === '收入' ? 'success' : 'danger'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="80" />
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">
            <span :class="row.type === '收入' ? 'income' : 'expense'">
              {{ row.type === '收入' ? '+' : '-'}}¥ {{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="account" label="账户" width="100" />
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingAccount ? '编辑账户' : '添加账户'" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户类型" prop="accountType">
          <el-select v-model="form.accountType" placeholder="选择账户类型" style="width: 100%">
            <el-option label="银行卡" value="银行卡" />
            <el-option label="信用卡" value="信用卡" />
            <el-option label="支付宝" value="支付宝" />
            <el-option label="微信钱包" value="微信钱包" />
            <el-option label="现金" value="现金" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始余额" prop="balance">
          <el-input-number v-model="form.balance" :precision="2" :controls="false" style="width: 100%">
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选填写备注" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Wallet, MoreFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialogVisible = ref(false)
const editingAccount = ref<any>(null)
const formRef = ref<FormInstance>()
const selectedAccount = ref('')

const form = ref({
  name: '',
  accountType: '',
  balance: 0,
  remark: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  accountType: [{ required: true, message: '请选择账户类型', trigger: 'change' }],
  balance: [{ required: true, message: '请输入初始余额', trigger: 'blur' }]
}

// 账户列表
const accounts = ref([
  { id: 1, name: '招商银行储蓄卡', accountType: '银行卡', balance: 25680, user: '本人', createTime: '2024-01-15' },
  { id: 2, name: '支付宝', accountType: '支付宝', balance: 8540, user: '本人', createTime: '2024-01-10' },
  { id: 3, name: '微信钱包', accountType: '微信钱包', balance: 3280, user: '本人', createTime: '2024-01-12' },
  { id: 4, name: '建设银行储蓄卡', accountType: '银行卡', balance: 12050, user: '本人', createTime: '2024-02-20' },
  { id: 5, name: '现金', accountType: '现金', balance: 2000, user: '本人', createTime: '2024-01-01' },
  { id: 6, name: '信用卡', accountType: '信用卡', balance: -3250, user: '本人', createTime: '2024-03-05' }
])

// 流水明细
const flows = ref([
  { id: 1, date: '2024-04-07 12:30', type: '支出', category: '餐饮', amount: 25, account: '支付宝', remark: '午餐' },
  { id: 2, date: '2024-04-07 09:00', type: '收入', category: '工资', amount: 12000, account: '招商银行储蓄卡', remark: '3月工资' },
  { id: 3, date: '2024-04-06 18:20', type: '支出', category: '交通', amount: 6, account: '微信钱包', remark: '地铁' },
  { id: 4, date: '2024-04-06 14:50', type: '支出', category: '购物', amount: 89, account: '支付宝', remark: '生活用品' },
  { id: 5, date: '2024-04-05 20:30', type: '支出', category: '餐饮', amount: 35, account: '微信钱包', remark: '外卖' },
  { id: 6, date: '2024-04-05 10:15', type: '收入', category: '兼职', amount: 500, account: '支付宝', remark: '佣金' }
])

const totalBalance = computed(() => accounts.value.reduce((sum, acc) => sum + acc.balance, 0))

const filteredFlows = computed(() => {
  if (!selectedAccount.value) return flows.value
  return flows.value.filter(f => f.account === accounts.value.find(a => a.id === selectedAccount.value)?.name)
})

const openDialog = (account?: any) => {
  if (account) {
    editingAccount.value = account
    form.value = { ...account }
  } else {
    editingAccount.value = null
    form.value = { name: '', accountType: '', balance: 0, remark: '' }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  if (editingAccount.value) {
    const idx = accounts.value.findIndex(a => a.id === editingAccount.value.id)
    if (idx > -1) {
      accounts.value[idx] = { ...form.value, id: editingAccount.value.id }
    }
    ElMessage.success('修改成功')
  } else {
    accounts.value.push({
      id: Date.now(),
      ...form.value,
      user: '本人',
      createTime: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

const handleDelete = (account: any) => {
  ElMessageBox.confirm(`确定要删除账户「${account.name}」吗?`, '提示', { type: 'warning' })
    .then(() => {
      const idx = accounts.value.findIndex(a => a.id === account.id)
      if (idx > -1) accounts.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style scoped>
.account-root {
  --theme-color: #3498db;
  --theme-light: rgba(52, 152, 219, 0.1);
  --theme-gradient: linear-gradient(135deg, #3498db 0%, #2980b9 100%);

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
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.25);
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

/* 账户卡片网格 */
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.account-card {
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 账户类型颜色 */
.account-card.银行卡 {
  border-left: 4px solid #3498db;
}

.account-card.支付宝 {
  border-left: 4px solid #3498db;
}

.account-card.微信钱包 {
  border-left: 4px solid #27ae60;
}

.account-card.现金 {
  border-left: 4px solid #f39c12;
}

.account-card.信用卡 {
  border-left: 4px solid #e74c3c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.account-type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: var(--space-sm);
}

.account-balance {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: var(--space-md);
}

.account-balance .negative {
  color: #e74c3c;
}

.account-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c0c4cc;
  padding-top: var(--space-sm);
  border-top: 1px solid #f0f0f0;
}

/* 添加卡片 */
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  border: 2px dashed #dcdfe6;
  background: transparent;
  cursor: pointer;
  color: #909399;
}

.add-card:hover {
  border-color: #3498db;
  color: #3498db;
}

.add-card .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-value.income {
  color: #27ae60;
}

/* 明细卡片 */
.glass-card {
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.income {
  color: #27ae60;
}

.expense {
  color: #e74c3c;
}
</style>