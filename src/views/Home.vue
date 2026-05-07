<template>
  <div class="home-root">
    <!-- 顶部标题 -->
    <div class="header-card">
      <h2>{{ titleMessage }}</h2>
    </div>

    <!-- 第一排：天气 / 留言 / 日历 -->
    <div class="card-row">
      <!-- 天气卡片 - 全新设计 -->
      <div class="glass-card weather-card">
        <div v-if="isLoadingWeather" class="weather-skeleton">
          <div class="skeleton-temp"></div>
          <div class="skeleton-info"></div>
          <div class="skeleton-suggest"></div>
        </div>
        <div v-else-if="weatherError" class="weather-error">
          <el-icon :size="40"><WarningFilled /></el-icon>
          <p>天气加载失败</p>
        </div>
        <div v-else class="weather-body">
          <!-- 顶部：城市和天气 -->
          <div class="weather-header">
            <div class="weather-main">
              <img v-if="weatherImg" :src="weatherImg" alt="天气" class="weather-icon-lg" />
              <div class="temp-box">
                <span class="temp-value">{{ weatherAll.temperature }}°</span>
                <span class="weather-text">{{ weatherAll.weatherText }}</span>
              </div>
            </div>
            <div class="location-box">
              <el-icon><Location /></el-icon>
              <span>{{ weatherAll.location }}</span>
              <span class="update-time">更新于 {{ weatherAll.lastUpdate?.slice(-8) || '' }}</span>
            </div>
          </div>

          <!-- 生活建议网格 -->
          <div class="suggestion-grid">
            <div
              v-for="item in displaySuggestions"
              :key="item.key"
              class="suggestion-item"
              :class="item.colorClass"
            >
              <div class="suggestion-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="suggestion-content">
                <span class="suggestion-label">{{ item.label }}</span>
                <span class="suggestion-brief">{{ item.brief }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言 -->
      <div class="glass-card message">
        <div class="card-header">
          <span>💬 留言板</span>
        </div>

        <el-input
          v-model="input"
          type="textarea"
          :rows="3"
          placeholder="有什么想说的？留下你的足迹吧..."
          class="msg-input"
          maxlength="200"
          show-word-limit
        />

        <div class="msg-footer">
          <el-radio-group v-model="radio" size="small" class="msg-type">
            <el-radio value="1">🔒 私密</el-radio>
            <el-radio value="2">🌍 公开</el-radio>
          </el-radio-group>

          <el-button
            type="primary"
            size="small"
            :loading="isSavingMessage"
            :disabled="!input.trim()"
            class="msg-btn"
            @click="saveMessageBoard"
          >
            {{ isSavingMessage ? '提交中...' : '🚀 提交' }}
          </el-button>
        </div>

        <Transition name="fade">
          <div v-if="messageSubmitted" class="msg-success">
            <el-icon><CircleCheckFilled /></el-icon>
            提交成功！感谢您的留言 💖
          </div>
        </Transition>
      </div>

      <!-- 日历 -->
      <div class="glass-card calendar">
        <div class="card-header">日历</div>
        <el-calendar v-model="calendarValue" :first-day-of-week="1" class="compact-cal">
          <template #date-cell="{ data }">
            <div class="cal-cell">
              {{ data.day.split('-')[2] }}
              <div v-for="item in getDateEvents(data.day)" :key="item.date" class="event">
                <div class="dot" :style="{ background: item.color || '#27ae60' }" />
                <span class="txt">￥{{ item.content }}</span>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </div>

    <!-- 第二排：占位 -->
    <div class="card-row">
      <div v-for="i in 3" :key="i" class="glass-card placeholder">
        <el-icon :size="40"><component :is="elIconPlacehoder" /></el-icon>
        <p>功能开发中</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import http from '@/utils/http'

// 图标映射
const iconMap: Record<string, string> = {
  dressing: 'Coin',
  sport: 'Trophy',
  flu: 'FirstAidKit',
  comfort: 'Sunny',
  air_pollution: 'Cloudy',
  uv: 'Sunrise',
  car_washing: 'Car',
  travel: 'Coordinate',
  umbrella: 'Umbrella',
  mood: 'MagicStick',
  shopping: 'ShoppingBag',
  chill: 'ColdDrink'
}

const labelMap: Record<string, string> = {
  dressing: '穿衣',
  sport: '运动',
  flu: '感冒',
  comfort: '舒适度',
  air_pollution: '空气污染',
  uv: '紫外线',
  car_washing: '洗车',
  travel: '出行',
  umbrella: '伞',
  mood: '心情',
  shopping: '购物',
  chill: '寒冷'
}

const colorMap: Record<string, string> = {
  dressing: 'orange',
  sport: 'green',
  flu: 'red',
  comfort: 'blue',
  air_pollution: 'purple',
  uv: 'yellow',
  car_washing: 'cyan',
  travel: 'teal',
  umbrella: 'indigo',
  mood: 'pink',
  shopping: 'gold',
  chill: 'ice-blue'
}

const calendarValue = ref(new Date())
const calendarEvents = ref<{ date: string; content: string; color: string }[]>([])
const titleMessage = ref('')
const input = ref('')
const radio = ref('1')
const isLoadingWeather = ref(false)
const isSavingMessage = ref(false)
const messageSubmitted = ref(false)
const weatherError = ref(false)

// 新的天气数据结构
const weatherAll = reactive({
  location: '',
  weatherText: '',
  temperature: '',
  weatherCode: '',
  lastUpdate: '',
  suggestion: {} as Record<string, { brief: string; details: string }>
})

const weatherImg = ref('')
const elIconPlacehoder = 'el-icon-placehoder'

// 动态计算显示的建议项目
const displaySuggestions = computed(() => {
  const items = weatherAll.suggestion
  const result = []
  const priorityKeys = ['dressing', 'sport', 'comfort', 'uv', 'flu', 'air_pollution']

  // 按优先级排序
  for (const key of priorityKeys) {
    if (items[key] && items[key].brief) {
      result.push({
        key,
        icon: iconMap[key] || 'InfoFilled',
        label: labelMap[key] || key,
        brief: items[key].brief,
        colorClass: colorMap[key] || 'blue'
      })
    }
  }

  // 最多显示6个
  return result.slice(0, 6)
})

const getWeatherAll = async (city: string) => {
  try {
    isLoadingWeather.value = true
    weatherError.value = false
    const res = await http.get(`/getWeatherAll?city=${city}`)
    const data = res.data

    weatherAll.location = data.location || ''
    weatherAll.weatherText = data.weatherText || ''
    weatherAll.temperature = data.temperature || ''
    weatherAll.weatherCode = data.weatherCode || ''
    weatherAll.lastUpdate = data.lastUpdate || ''
    weatherAll.suggestion = data.suggestion || {}

    // 加载天气图标
    if (weatherAll.weatherCode) {
      try {
        const mod = await import(`/src/assets/weatherIco/${weatherAll.weatherCode}-1x.png`)
        weatherImg.value = mod.default
      } catch (e) {
        console.log('天气图标加载失败')
      }
    }
  } catch (e) {
    console.error('获取天气失败:', e)
    weatherError.value = true
    ElMessage.error('获取天气信息失败')
  } finally {
    isLoadingWeather.value = false
  }
}

const fetchCalendarData = async () => {
  try {
    const res = await http.get('/getExpend')
    calendarEvents.value = res.data || []
  } catch (e) {
    console.error('获取日历数据失败:', e)
    ElMessage.error('加载日历数据失败')
  }
}

const saveMessageBoard = async () => {
  if (!input.value.trim()) {
    ElMessage.warning('请输入留言内容')
    return
  }
  isSavingMessage.value = true
  try {
    await http.post('/saveMessage', {
      message: input.value,
      msgType: radio.value
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    messageSubmitted.value = true
    input.value = ''
    setTimeout(() => {
      messageSubmitted.value = false
    }, 3000)
  } catch (e) {
    console.error('保存留言失败:', e)
    ElMessage.error('留言提交失败，请稍后再试')
  } finally {
    isSavingMessage.value = false
  }
}

const getDateEvents = (dateString: string) => {
  return calendarEvents.value.filter(item => item.date === dateString)
}

onMounted(async () => {
  try {
    // 默认城市
    await getWeatherAll('北京')
    await fetchCalendarData()
    titleMessage.value = '每一天都是新的开始，带着希望出发，微笑面对生活。困难只是暂时的，坚持终会迎来光明。相信自己，你比想象中更强大。保持热爱，奔赴山海，未来可期！💪✨(由deepseek生成)'
  } catch (e) {
    console.error('初始化失败:', e)
  }
})
</script>

<style scoped>
/* 主题变量 - 首页模块 */
.home-root {
  --theme-color: #3498db;
  --theme-light: rgba(52, 152, 219, 0.1);
  --theme-gradient: linear-gradient(135deg, #3498db 0%, #5dade2 100%);

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
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.25);
  position: relative;
  overflow: hidden;
}

.header-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-card h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

/* 卡片行 */
.card-row {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 992px) {
  .card-row {
    flex-direction: column;
  }
}

/* 玻璃卡片基础样式 */
.glass-card {
  flex: 1;
  padding: var(--space-lg);
  border-radius: 12px;
  background: var(--bg-secondary, #fff);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color, #ebeef5);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ==================== 天气卡片全新设计 ==================== */
.weather-card {
  min-height: 280px;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid #f0f0f0;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.weather-icon-lg {
  width: 72px;
  height: 72px;
}

.temp-box {
  display: flex;
  flex-direction: column;
}

.temp-value {
  font-size: 42px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.weather-text {
  font-size: 16px;
  color: #606266;
  margin-top: 4px;
}

.location-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  color: #606266;
  font-size: 14px;
}

.location-box .el-icon {
  font-size: 16px;
}

.update-time {
  font-size: 11px;
  color: #909399;
}

/* 生活建议网格 */
.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.suggestion-item:hover {
  transform: scale(1.02);
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-icon .el-icon {
  font-size: 18px;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.suggestion-label {
  font-size: 11px;
  color: #909399;
}

.suggestion-brief {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 建议项颜色主题 */
.suggestion-item.orange .suggestion-icon { background: rgba(230, 126, 34, 0.15); color: #e67e22; }
.suggestion-item.green .suggestion-icon { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.suggestion-item.red .suggestion-icon { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
.suggestion-item.blue .suggestion-icon { background: rgba(52, 152, 219, 0.15); color: #3498db; }
.suggestion-item.purple .suggestion-icon { background: rgba(155, 89, 182, 0.15); color: #9b59b6; }
.suggestion-item.yellow .suggestion-icon { background: rgba(243, 156, 18, 0.15); color: #f39c12; }
.suggestion-item.cyan .suggestion-icon { background: rgba(26, 188, 156, 0.15); color: #1abc9c; }
.suggestion-item.teal .suggestion-icon { background: rgba(0, 206, 201, 0.15); color: #00cec9; }
.suggestion-item.indigo .suggestion-icon { background: rgba(72, 137, 218, 0.15); color: #7289da; }
.suggestion-item.pink .suggestion-icon { background: rgba(255, 118, 117, 0.15); color: #ff7675; }
.suggestion-item.gold .suggestion-icon { background: rgba(253, 203, 110, 0.15); color: #fdcb6e; }
.suggestion-item.ice-blue .suggestion-icon { background: rgba(116, 185, 255, 0.15); color: #74b9ff; }

/* 加载骨架 */
.weather-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.skeleton-temp {
  height: 80px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-info {
  height: 60px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-suggest {
  height: 40px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.weather-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: var(--space-sm);
}

/* ==================== 留言卡片 ==================== */
.card-header {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f5576c;
}

.msg-input {
  margin-bottom: 12px;
}

.msg-input :deep(.el-textarea__inner) {
  resize: none;
  font-size: 14px;
  padding: 14px;
  min-height: 100px !important;
  border-radius: 12px;
  border-color: #f0f0f0;
  transition: all 0.3s;
  background: #fafafa;
}

.msg-input :deep(.el-textarea__inner:focus) {
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.15);
  background: #fff;
}

.msg-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.msg-type {
  display: flex;
  gap: 8px;
}

.msg-type :deep(.el-radio__label) {
  font-size: 12px;
}

.msg-btn {
  border-radius: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  font-weight: 600;
  padding: 8px 20px;
  transition: all 0.3s;
}

.msg-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.msg-btn:disabled {
  opacity: 0.6;
}

.msg-success {
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.msg-success {
  margin-top: var(--space-sm);
}

.msg-success :deep(.el-alert__content) {
  font-size: 13px;
}

/* ==================== 日历卡片 ==================== */
.calendar .card-header {
  color: #27ae60;
}

.calendar .card-header::before {
  background: #27ae60;
}

.compact-cal {
  --el-calendar-cell-width: 36px;
  font-size: 12px;
}

.compact-cal :deep(.el-calendar__header) {
  padding: 8px 0;
}

.compact-cal :deep(.el-calendar-table td) {
  border: none;
}

.compact-cal :deep(.el-calendar-table .el-calendar-day) {
  padding: 2px;
  height: auto;
  min-height: 36px;
}

.cal-cell {
  text-align: center;
  height: 100%;
  padding: 2px 0;
  position: relative;
}

.event {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  margin-right: 2px;
  background: #27ae60;
}

.txt {
  font-size: 9px;
  color: #27ae60;
}

/* ==================== 占位卡片 ==================== */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 24px;
  color: #c0c4cc;
  min-height: 160px;
}

.placeholder :deep(.el-icon) {
  color: #dcdfe6;
  font-size: 48px;
  margin-bottom: 12px;
}

.placeholder p {
  font-size: 14px;
  margin: 0;
  color: #909399;
}

/* Element Plus 组件覆盖 */
:deep(.el-radio-group) {
  --el-radio-button-size: 12px;
}

:deep(.el-radio__label) {
  font-size: 12px;
}

:deep(.el-alert) {
  border-radius: 8px;
}
</style>
