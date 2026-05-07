<template>
  <div class="finance-root">
    <!-- 顶部标题卡片 -->
    <div class="header-card">
      <div class="header-content">
        <h2>💰 个人财务看板</h2>
        <p>记录每一笔收入支出，掌握财务状况</p>
      </div>
      <div class="header-decoration">
        <div class="coin coin-1">💵</div>
        <div class="coin coin-2">💴</div>
        <div class="coin coin-3">💳</div>
      </div>
    </div>

    <!-- 统计卡片行 -->
    <div class="stats-row">
      <div class="stat-card income">
        <div class="stat-icon">
          <el-icon><ArrowUp /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">本月收入</span>
          <span class="stat-value">¥ 12,850</span>
        </div>
      </div>

      <div class="stat-card expense">
        <div class="stat-icon">
          <el-icon><ArrowDown /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">本月支出</span>
          <span class="stat-value">¥ 6,320</span>
        </div>
      </div>

      <div class="stat-card balance">
        <div class="stat-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">本月结余</span>
          <span class="stat-value">¥ 6,530</span>
        </div>
      </div>

      <div class="stat-card total">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">总资产</span>
          <span class="stat-value">¥ 286,500</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 支出占比图 -->
      <div class="glass-card chart-card">
        <div class="card-header">
          <span>📊 支出占比分布</span>
        </div>
        <div class="chart-container" ref="expenseChartRef"></div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="dot" style="background: #e74c3c"></span>
            <span>餐饮 🍔 35%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #3498db"></span>
            <span>交通 🚗 20%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #2ecc71"></span>
            <span>购物 🛒 18%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #f39c12"></span>
            <span>娱乐 🎮 12%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #9b59b6"></span>
            <span>其他 📦 15%</span>
          </div>
        </div>
      </div>

      <!-- 资产构成图 -->
      <div class="glass-card chart-card">
        <div class="card-header">
          <span>🏦 资产构成分布</span>
        </div>
        <div class="chart-container" ref="assetChartRef"></div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="dot" style="background: #3498db"></span>
            <span>银行储蓄 45%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #2ecc71"></span>
            <span>理财产品 25%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #f39c12"></span>
            <span>基金 15%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #e74c3c"></span>
            <span>现金 10%</span>
          </div>
          <div class="legend-item">
            <span class="dot" style="background: #9b59b6"></span>
            <span>其他 5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预算执行进度 + 最近交易 -->
    <div class="bottom-row">
      <!-- 预算执行进度 -->
      <div class="glass-card budget-card">
        <div class="card-header">
          <span>📈 预算执行进度</span>
        </div>
        <div class="budget-list">
          <div class="budget-item">
            <div class="budget-header">
              <span class="budget-name">餐饮 🍔</span>
              <span class="budget-value">¥ 1,800 / ¥ 2,000</span>
            </div>
            <el-progress
              :percentage="90"
              :stroke-width="10"
              :color="['#e74c3c', '#f39c12']"
              :show-text="false"
            />
          </div>
          <div class="budget-item">
            <div class="budget-header">
              <span class="budget-name">交通 🚗</span>
              <span class="budget-value">¥ 480 / ¥ 600</span>
            </div>
            <el-progress
              :percentage="80"
              :stroke-width="10"
              :color="['#3498db', '#2ecc71']"
              :show-text="false"
            />
          </div>
          <div class="budget-item">
            <div class="budget-header">
              <span class="budget-name">购物 🛒</span>
              <span class="budget-value">¥ 720 / ¥ 1,000</span>
            </div>
            <el-progress
              :percentage="72"
              :stroke-width="10"
              :color="['#9b59b6', '#3498db']"
              :show-text="false"
            />
          </div>
          <div class="budget-item">
            <div class="budget-header">
              <span class="budget-name">娱乐 🎮</span>
              <span class="budget-value">¥ 240 / ¥ 500</span>
            </div>
            <el-progress
              :percentage="48"
              :stroke-width="10"
              :color="['#2ecc71', '#3498db']"
              :show-text="false"
            />
          </div>
        </div>
      </div>

      <!-- 最近交易记录 -->
      <div class="glass-card transaction-card">
        <div class="card-header">
          <span>📝 最近交易</span>
          <el-button text type="primary" size="small">查看全部</el-button>
        </div>
        <div class="transaction-list">
          <div class="transaction-item">
            <div class="trans-icon expense">
              <el-icon><ShoppingBag /></el-icon>
            </div>
            <div class="trans-info">
              <span class="trans-desc">午餐 - 兰州拉面</span>
              <span class="trans-date">今天 12:30</span>
            </div>
            <span class="trans-amount expense">-¥ 25</span>
          </div>
          <div class="transaction-item">
            <div class="trans-icon income">
              <el-icon><Money /></el-icon>
            </div>
            <div class="trans-info">
              <span class="trans-desc">工资发放</span>
              <span class="trans-date">今天 09:00</span>
            </div>
            <span class="trans-amount income">+¥ 12,000</span>
          </div>
          <div class="transaction-item">
            <div class="trans-icon expense">
              <el-icon><Van /></el-icon>
            </div>
            <div class="trans-info">
              <span class="trans-desc">地铁出行</span>
              <span class="trans-date">昨天 18:20</span>
            </div>
            <span class="trans-amount expense">-¥ 6</span>
          </div>
          <div class="transaction-item">
            <div class="trans-icon expense">
              <el-icon><ShoppingBag /></el-icon>
            </div>
            <div class="trans-info">
              <span class="trans-desc">网购 - 生活用品</span>
              <span class="trans-date">昨天 14:50</span>
            </div>
            <span class="trans-amount expense">-¥ 89</span>
          </div>
          <div class="transaction-item">
            <div class="trans-icon expense">
              <el-icon><Dish /></el-icon>
            </div>
            <div class="trans-info">
              <span class="trans-desc">晚餐 - 外卖</span>
              <span class="trans-date">昨天 19:30</span>
            </div>
            <span class="trans-amount expense">-¥ 35</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-button type="primary" round class="action-btn">
        <el-icon><Plus /></el-icon>
        <span>记一笔</span>
      </el-button>
      <el-button round class="action-btn">
        <el-icon><TrendCharts /></el-icon>
        <span>收支报表</span>
      </el-button>
      <el-button round class="action-btn">
        <el-icon><Wallet /></el-icon>
        <span>预算管理</span>
      </el-button>
      <el-button round class="action-btn">
        <el-icon><Calendar /></el-icon>
        <span>账日历</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowUp, ArrowDown, Wallet, Money, ShoppingBag, Van, Dish, Plus, TrendCharts, Calendar } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const expenseChartRef = ref<HTMLElement>()
const assetChartRef = ref<HTMLElement>()

// 支出占比饼图
const initExpenseChart = () => {
  if (!expenseChartRef.value) return
  const chart = echarts.init(expenseChartRef.value)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 35, name: '餐饮', itemStyle: { color: '#e74c3c' } },
          { value: 20, name: '交通', itemStyle: { color: '#3498db' } },
          { value: 18, name: '购物', itemStyle: { color: '#2ecc71' } },
          { value: 12, name: '娱乐', itemStyle: { color: '#f39c12' } },
          { value: 15, name: '其他', itemStyle: { color: '#9b59b6' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 资产构成饼图
const initAssetChart = () => {
  if (!assetChartRef.value) return
  const chart = echarts.init(assetChartRef.value)
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        data: [
          { value: 45, name: '银行储蓄', itemStyle: { color: '#3498db' } },
          { value: 25, name: '理财产品', itemStyle: { color: '#2ecc71' } },
          { value: 15, name: '基金', itemStyle: { color: '#f39c12' } },
          { value: 10, name: '现金', itemStyle: { color: '#e74c3c' } },
          { value: 5, name: '其他', itemStyle: { color: '#9b59b6' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  initExpenseChart()
  initAssetChart()
})
</script>

<style scoped>
/* 主题变量 - 财务模块 */
.finance-root {
  --theme-color: #1abc9c;
  --theme-light: rgba(26, 188, 156, 0.1);
  --theme-gradient: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);

  padding: var(--space-lg);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100%;
}

/* 头部标题卡片 */
.header-card {
  margin-bottom: var(--space-lg);
  padding: var(--space-lg) var(--space-xl);
  border-radius: 12px;
  background: var(--theme-gradient);
  box-shadow: 0 4px 16px rgba(26, 188, 156, 0.25);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.header-decoration {
  position: relative;
  width: 120px;
  height: 80px;
}

.coin {
  position: absolute;
  font-size: 28px;
  animation: float-coin 3s ease-in-out infinite;
}

.coin-1 {
  top: 0;
  left: 10px;
}

.coin-2 {
  top: 25px;
  left: 50px;
  animation-delay: 0.5s;
}

.coin-3 {
  top: 50px;
  left: 30px;
  animation-delay: 1s;
}

@keyframes float-coin {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
}

/* 统计卡片行 */
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
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-card.income .stat-icon {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
}

.stat-card.expense .stat-icon {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.stat-card.balance .stat-icon {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.stat-card.total .stat-icon {
  background: rgba(243, 156, 18, 0.15);
  color: #f39c12;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 992px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

/* 玻璃卡片基础样式 */
.glass-card {
  padding: var(--space-lg);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-header {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2c3e50;
}

.chart-container {
  height: 220px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 底部行 */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 992px) {
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

/* 预算卡片 */
.budget-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.budget-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.budget-name {
  color: #2c3e50;
  font-weight: 500;
}

.budget-value {
  color: #909399;
}

/* 交易记录卡片 */
.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.trans-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trans-icon .el-icon {
  font-size: 18px;
}

.trans-icon.expense {
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

.trans-icon.income {
  background: rgba(39, 174, 96, 0.12);
  color: #27ae60;
}

.trans-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trans-desc {
  font-size: 13px;
  color: #2c3e50;
}

.trans-date {
  font-size: 11px;
  color: #c0c4cc;
}

.trans-amount {
  font-size: 14px;
  font-weight: 600;
}

.trans-amount.income {
  color: #27ae60;
}

.trans-amount.expense {
  color: #e74c3c;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 24px;
  font-size: 14px;
}

.action-btn .el-icon {
  margin-right: 6px;
}
</style>