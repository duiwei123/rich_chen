<template>
  <div class="admin-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <div class="header-content">
        <h2>⚙️ 系统管理后台</h2>
        <p>管理员功能面板</p>
      </div>
      <div class="admin-badge">
        <el-icon><UserFilled /></el-icon>
        <span>超级管理员</span>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon users">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">1,286</span>
          <span class="stat-label">总用户数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon accounts">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">3,452</span>
          <span class="stat-label">总账户数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon transactions">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">28,650</span>
          <span class="stat-label">总交易笔数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon deals">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥ 586.2万</span>
          <span class="stat-label">总交易金额</span>
        </div>
      </div>
    </div>

    <!-- 功能模块 -->
    <div class="modules-row">
      <!-- 用户管理 -->
      <div class="glass-card module-card">
        <div class="module-header">
          <span class="module-title">👥 用户管理</span>
          <el-tag type="info" size="small">1,286 人</el-tag>
        </div>
        <div class="module-filter">
          <el-input
            v-model="userSearch"
            placeholder="搜索用户名..."
            clearable
            size="small"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-date-picker
            v-model="userDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="注册时间"
            end-placeholder=""
            size="small"
            format="YYYY-MM-DD"
            style="margin-left: 8px"
          />
        </div>
        <el-table :data="userList" style="width: 100%" size="small" max-height="280">
          <el-table-column prop="username" label="用户名" width="100" />
          <el-table-column prop="realname" label="真实姓名" width="90" />
          <el-table-column prop="registerTime" label="注册时间" width="140" />
          <el-table-column prop="lastLogin" label="最后登录" width="140" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                active-value="正常"
                inactive-value="禁用"
                active-color="#67c23a"
                inactive-color="#e74c3c"
                @change="handleUserStatus(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button text type="primary" size="small">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 账户管理 -->
      <div class="glass-card module-card">
        <div class="module-header">
          <span class="module-title">💳 账户管理</span>
          <el-tag type="info" size="small">3,452 账户</el-tag>
        </div>
        <div class="module-filter">
          <el-input
            v-model="accountSearch"
            placeholder="搜索账户名称..."
            clearable
            size="small"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-table :data="accountList" style="width: 100%" size="small" max-height="280">
          <el-table-column prop="accountName" label="账户名称" width="110" />
          <el-table-column prop="accountType" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.accountType === '储蓄卡' ? 'primary' : row.accountType === '信用卡' ? 'warning' : 'success'" size="small">
                {{ row.accountType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="user" label="关联用户" width="90" />
          <el-table-column prop="balance" label="余额" width="100" align="right">
            <template #default="{ row }">
              <span :class="{ expense: row.balance < 0 }">¥ {{ row.balance.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.status === '正常'" type="success" size="small">{{ row.status }}</el-tag>
              <el-tag v-else-if="row.status === '异常'" type="danger" size="small">{{ row.status }}</el-tag>
              <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button text type="warning" size="small" @click="handleMark(row)">标记</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 系统管理 -->
    <div class="bottom-row">
      <div class="glass-card category-card">
        <div class="module-header">
          <span class="module-title">📁 收支类别管理</span>
          <el-button type="primary" size="small" round @click="showCategoryDialog = true">
            <el-icon><Plus /></el-icon>
            添加类别
          </el-button>
        </div>
        <div class="category-list">
          <el-tag
            v-for="cat in categories"
            :key="cat.id"
            :type="cat.type === '收入' ? 'success' : 'danger'"
            closable
            @close="handleDeleteCategory(cat)"
            class="category-tag"
          >
            {{ cat.name }}
          </el-tag>
        </div>
      </div>

      <div class="glass-card sysinfo-card">
        <div class="module-header">
          <span class="module-title">📊 系统使用统计</span>
        </div>
        <div class="sysinfo-grid">
          <div class="sysinfo-item">
            <span class="sysinfo-value">{{ sysStats.totalUsers }}</span>
            <span class="sysinfo-label">总用户数</span>
          </div>
          <div class="sysinfo-item">
            <span class="sysinfo-value">{{ sysStats.activeUsers }}</span>
            <span class="sysinfo-label">活跃用户</span>
          </div>
          <div class="sysinfo-item">
            <span class="sysinfo-value">{{ sysStats.totalAccounts }}</span>
            <span class="sysinfo-label">总账户</span>
          </div>
          <div class="sysinfo-item">
            <span class="sysinfo-value">{{ sysStats.totalTransactions }}</span>
            <span class="sysinfo-label">交易笔数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加类别弹窗 -->
    <el-dialog v-model="showCategoryDialog" title="添加收支类别" width="400px">
      <el-form label-width="80px">
        <el-form-item label="类别名称">
          <el-input v-model="newCategory.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="类别类型">
          <el-radio-group v-model="newCategory.type">
            <el-radio value="收入">收入</el-radio>
            <el-radio value="支出">支出</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, UserFilled, Wallet, Coin, TrendCharts, Search, Plus } from '@element-plus/icons-vue'

const userSearch = ref('')
const userDateRange = ref<[string, string] | null>(null)
const accountSearch = ref('')
const showCategoryDialog = ref(false)
const newCategory = reactive({ name: '', type: '支出' })

// 用户列表数据
const userList = ref([
  { id: 1, username: 'zhangsan', realname: '张三', registerTime: '2024-01-15 10:30', lastLogin: '2024-04-07 09:15', status: '正常' },
  { id: 2, username: 'lisi', realname: '李四', registerTime: '2024-02-20 14:20', lastLogin: '2024-04-06 18:45', status: '正常' },
  { id: 3, username: 'wangwu', realname: '王五', registerTime: '2024-03-05 09:10', lastLogin: '2024-04-05 20:30', status: '正常' },
  { id: 4, username: 'zhaoliu', realname: '赵六', registerTime: '2024-03-12 16:45', lastLogin: '2024-04-04 11:20', status: '禁用' },
  { id: 5, username: 'qianqi', realname: '钱七', registerTime: '2024-03-25 13:30', lastLogin: '2024-04-07 08:00', status: '正常' },
  { id: 6, username: 'sunba', realname: '孙八', registerTime: '2024-03-28 11:15', lastLogin: '2024-04-03 16:50', status: '正常' }
])

// 账户列表数据
const accountList = ref([
  { id: 1, accountName: '招商银行储蓄卡', accountType: '储蓄卡', user: 'zhangsan', balance: 25680, status: '正常' },
  { id: 2, accountName: '支付宝', accountType: '电子账户', user: 'zhangsan', balance: 8540, status: '正常' },
  { id: 3, accountName: '建设银行储蓄卡', accountType: '储蓄卡', user: 'lisi', balance: 12050, status: '正常' },
  { id: 4, accountName: '信用卡', accountType: '信用卡', user: 'wangwu', balance: -3250, status: '异常' },
  { id: 5, accountName: '微信钱包', accountType: '电子账户', user: 'zhaoliu', balance: 680, status: '正常' },
  { id: 6, accountName: '农业银行储蓄卡', accountType: '储蓄卡', user: 'qianqi', balance: 45200, status: '正常' }
])

// 收支类别
const categories = ref([
  { id: 1, name: '工资', type: '收入' },
  { id: 2, name: '奖金', type: '收入' },
  { id: 3, name: '兼职', type: '收入' },
  { id: 4, name: '投资收益', type: '收入' },
  { id: 5, name: '餐饮', type: '支出' },
  { id: 6, name: '交通', type: '支出' },
  { id: 7, name: '购物', type: '支出' },
  { id: 8, name: '娱乐', type: '支出' },
  { id: 9, name: '居住', type: '支出' },
  { id: 10, name: '医疗', type: '支出' }
])

// 系统统计
const sysStats = reactive({
  totalUsers: '1,286',
  activeUsers: '856',
  totalAccounts: '3,452',
  totalTransactions: '28,650'
})

const handleUserStatus = (row: any) => {
  ElMessage.success(`用户 ${row.username} 已${row.status === '正常' ? '启用' : '禁用'}`)
}

const handleMark = (row: any) => {
  ElMessageBox.confirm(`确定要标记账户「${row.accountName}」为异常?`, '提示', {
    type: 'warning'
  }).then(() => {
    row.status = '异常'
    ElMessage.success('标记成功')
  }).catch(() => {})
}

const handleAddCategory = () => {
  if (!newCategory.name) {
    ElMessage.warning('请输入类别名称')
    return
  }
  categories.value.push({
    id: Date.now(),
    name: newCategory.name,
    type: newCategory.type
  })
  newCategory.name = ''
  newCategory.type = '支出'
  showCategoryDialog.value = false
  ElMessage.success('添加成功')
}

const handleDeleteCategory = (cat: any) => {
  ElMessageBox.confirm(`确定要删除类别「${cat.name}」?`, '提示', {
    type: 'warning'
  }).then(() => {
    const idx = categories.value.findIndex(c => c.id === cat.id)
    if (idx > -1) categories.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
/* 主题变量 - 管理员模块 */
.admin-root {
  --theme-color: #e74c3c;
  --theme-light: rgba(231, 76, 60, 0.1);
  --theme-gradient: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);

  padding: var(--space-lg);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
}

/* 头部标题 */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
  border-radius: 12px;
  background: var(--theme-gradient);
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.25);
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

.admin-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
}

.admin-badge .el-icon {
  font-size: 18px;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

@media (max-width: 992px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.users {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.stat-icon.accounts {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.stat-icon.transactions {
  background: rgba(243, 156, 18, 0.15);
  color: #f39c12;
}

.stat-icon.deals {
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 功能模块 */
.modules-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 992px) {
  .modules-row {
    grid-template-columns: 1fr;
  }
}

/* 玻璃卡片 */
.glass-card {
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.module-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.module-filter {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

/* 底部行 */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 992px) {
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

/* 类别管理 */
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.category-tag {
  padding: 8px 12px;
  font-size: 13px;
}

/* 系统信息 */
.sysinfo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.sysinfo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background: #f8f9fa;
  border-radius: 8px;
}

.sysinfo-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.sysinfo-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.expense {
  color: #e74c3c;
}
</style>