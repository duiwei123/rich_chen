<template>
  <div class="budget-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <div class="header-content">
        <h2>📊 预算管理</h2>
        <p>设置月度预算，控制支出</p>
      </div>
      <el-button type="primary" round @click="openDialog()">
        <el-icon><Plus /></el-icon>
        添加预算
      </el-button>
    </div>

    <!-- 预算概览 -->
    <div class="overview-bar">
      <div class="overview-item">
        <div class="overview-icon income">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="overview-info">
          <span class="overview-label">本月总预算</span>
          <span class="overview-value">¥ {{ totalBudget.toLocaleString() }}</span>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon expense">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="overview-info">
          <span class="overview-label">已使用</span>
          <span class="overview-value expense">¥ {{ totalUsed.toLocaleString() }}</span>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="overview-info">
          <span class="overview-label">剩余</span>
          <span class="overview-value" :class="remaining >= 0 ? 'income' : 'expense'">
            ¥ {{ remaining.toLocaleString() }}
          </span>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon">
          <el-icon><PieChart /></el-icon>
        </div>
        <div class="overview-info">
          <span class="overview-label">执行进度</span>
          <span class="overview-value">{{ executionRate }}%</span>
        </div>
      </div>
    </div>

    <!-- 预算列表 -->
    <div class="budget-list">
      <div v-for="budget in budgets" :key="budget.id" class="budget-card glass-card">
        <div class="budget-header">
          <div class="budget-category">
            <span class="category-icon">{{ budget.icon }}</span>
            <span class="category-name">{{ budget.category }}</span>
          </div>
          <el-dropdown trigger="click">
            <el-button text circle size="small">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openDialog(budget)">编辑</el-dropdown-item>
                <el-dropdown-item @click="handleDelete(budget)" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="budget-progress">
          <el-progress
            :percentage="budget.used / budget.limit * 100"
            :stroke-width="12"
            :color="getProgressColor(budget.used, budget.limit)"
            :show-text="false"
          />
          <div class="progress-labels">
            <span class="used">已使用 ¥{{ budget.used.toLocaleString() }}</span>
            <span class="limit">预算 ¥{{ budget.limit.toLocaleString() }}</span>
          </div>
        </div>

        <div class="budget-status">
          <el-tag v-if="budget.used >= budget.limit" type="danger" size="small">
            ⚠️ 已超支 ¥{{ (budget.used - budget.limit).toLocaleString() }}
          </el-tag>
          <el-tag v-else-if="budget.used / budget.limit >= 0.9" type="warning" size="small">
            ⚠️ 即将超支
          </el-tag>
          <el-tag v-else-if="budget.used / budget.limit >= 0.7" type="info" size="small">
            注意控制
          </el-tag>
          <el-tag v-else type="success" size="small">
            正常
          </el-tag>
          <span class="remaining">剩余 ¥{{ (budget.limit - budget.used).toLocaleString() }}</span>
        </div>
      </div>

      <!-- 添加卡片 -->
      <div class="budget-card add-card glass-card" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        <span>添加预算</span>
      </div>
    </div>

    <!-- 超支提醒 -->
    <div v-if="overBudgetList.length > 0" class="alert-section">
      <el-alert type="error" :closable="false" show-icon>
        <template #title>
          <span>以下类别已超支，请注意控制支出</span>
        </template>
        <div class="alert-tags">
          <el-tag v-for="item in overBudgetList" :key="item.id" type="danger" effect="dark">
            {{ item.category }}: ¥{{ (item.used - item.limit).toLocaleString() }}
          </el-tag>
        </div>
      </el-alert>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingBudget ? '编辑预算' : '添加预算'" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="支出类别" prop="category">
          <el-select v-model="form.category" placeholder="选择类别" style="width: 100%">
            <el-option
              v-for="cat in availableCategories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
              :disabled="cat.disabled"
            >
              {{ cat.icon }} {{ cat.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="月度预算" prop="limit">
          <el-input-number v-model="form.limit" :min="0" :precision="2" :controls="false" style="width: 100%">
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="如: 🍔" style="width: 100px" />
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
import { Plus, Wallet, TrendCharts, DataLine, PieChart, MoreFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialogVisible = ref(false)
const editingBudget = ref<any>(null)
const formRef = ref<FormInstance>()

const form = ref({
  category: '',
  limit: 0,
  icon: ''
})

const rules: FormRules = {
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  limit: [{ required: true, message: '请输入预算金额', trigger: 'blur' }]
}

// 预算数据
const budgets = ref([
  { id: 1, category: '餐饮', icon: '🍔', limit: 2000, used: 1800 },
  { id: 2, category: '交通', icon: '🚗', limit: 600, used: 480 },
  { id: 3, category: '购物', icon: '🛒', limit: 1000, used: 720 },
  { id: 4, category: '娱乐', icon: '🎮', limit: 500, used: 240 },
  { id: 5, category: '居住', icon: '🏠', limit: 3000, used: 2100 },
  { id: 6, category: '医疗', icon: '💊', limit: 500, used: 120 }
])

// 可用类别
const availableCategories = computed(() => {
  const usedCategories = budgets.value.map(b => b.category)
  return [
    { value: '餐饮', label: '餐饮', icon: '🍔', disabled: usedCategories.includes('餐饮') },
    { value: '交通', label: '交通', icon: '🚗', disabled: usedCategories.includes('交通') },
    { value: '购物', label: '购物', icon: '🛒', disabled: usedCategories.includes('购物') },
    { value: '娱乐', label: '娱乐', icon: '🎮', disabled: usedCategories.includes('娱乐') },
    { value: '居住', label: '居住', icon: '🏠', disabled: usedCategories.includes('居住') },
    { value: '医疗', label: '医疗', icon: '💊', disabled: usedCategories.includes('医疗') },
    { value: '教育', label: '教育', icon: '📚', disabled: usedCategories.includes('教育') },
    { value: '其他支出', label: '其他支出', icon: '📦', disabled: usedCategories.includes('其他支出') }
  ]
})

const totalBudget = computed(() => budgets.value.reduce((sum, b) => sum + b.limit, 0))
const totalUsed = computed(() => budgets.value.reduce((sum, b) => sum + b.used, 0))
const remaining = computed(() => totalBudget.value - totalUsed.value)
const executionRate = computed(() => totalBudget.value ? Math.round(totalUsed.value / totalBudget.value * 100) : 0)

const overBudgetList = computed(() => budgets.value.filter(b => b.used > b.limit))

const getProgressColor = (used: number, limit: number) => {
  const rate = used / limit
  if (rate >= 1) return '#e74c3c'
  if (rate >= 0.9) return '#f39c12'
  if (rate >= 0.7) return '#3498db'
  return '#27ae60'
}

const openDialog = (budget?: any) => {
  if (budget) {
    editingBudget.value = budget
    form.value = { category: budget.category, limit: budget.limit, icon: budget.icon }
  } else {
    editingBudget.value = null
    form.value = { category: '', limit: 0, icon: '' }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  if (editingBudget.value) {
    const idx = budgets.value.findIndex(b => b.id === editingBudget.value.id)
    if (idx > -1) {
      budgets.value[idx] = { ...form.value, id: editingBudget.value.id, used: editingBudget.value.used }
    }
    ElMessage.success('修改成功')
  } else {
    budgets.value.push({
      id: Date.now(),
      ...form.value,
      used: 0
    })
    ElMessage.success('添加成功')
  }

  dialogVisible.value = false
}

const handleDelete = (budget: any) => {
  ElMessageBox.confirm(`确定要删除「${budget.category}」的预算吗?`, '提示', { type: 'warning' })
    .then(() => {
      const idx = budgets.value.findIndex(b => b.id === budget.id)
      if (idx > -1) budgets.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style scoped>
.budget-root {
  --theme-color: #9b59b6;
  --theme-light: rgba(155, 89, 182, 0.1);
  --theme-gradient: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);

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
  box-shadow: 0 4px 16px rgba(155, 89, 182, 0.25);
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

/* 概览栏 */
.overview-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

@media (max-width: 768px) {
  .overview-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

.overview-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.overview-icon.income {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.overview-icon.expense {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.overview-info {
  display: flex;
  flex-direction: column;
}

.overview-label {
  font-size: 12px;
  color: #909399;
}

.overview-value {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
}

.overview-value.income {
  color: #27ae60;
}

.overview-value.expense {
  color: #e74c3c;
}

/* 预算列表 */
.budget-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/* 玻璃卡片 */
.glass-card {
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.budget-card {
  transition: all 0.2s;
}

.budget-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.budget-category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 进度条 */
.budget-progress {
  margin-bottom: var(--space-md);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.used {
  color: #e74c3c;
}

.limit {
  color: #909399;
}

/* 状态 */
.budget-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-sm);
  border-top: 1px solid #f0f0f0;
}

.remaining {
  font-size: 14px;
  font-weight: 600;
  color: #27ae60;
}

/* 添加卡片 */
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  border: 2px dashed #dcdfe6;
  background: transparent;
  cursor: pointer;
  color: #909399;
}

.add-card:hover {
  border-color: #9b59b6;
  color: #9b59b6;
}

.add-card .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

/* 提醒 */
.alert-section {
  margin-bottom: var(--space-lg);
}

.alert-tags {
  display: flex;
  gap: var(--space-sm);
  margin-top: 8px;
  flex-wrap: wrap;
}
</style>