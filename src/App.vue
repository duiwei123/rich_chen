<template>
  <div class="app-root">
    <!-- 侧边栏 -->
    <aside v-if="!isLoginPage" class="sidebar">
      <!-- 背景装饰 -->
      <div class="sidebar-bg">
        <div class="bg-circle circle-1"></div>
        <div class="bg-circle circle-2"></div>
        <div class="bg-circle circle-3"></div>
      </div>

      <!-- 用户信息区 -->
      <div class="user-section">
        <div class="avatar-wrapper">
          <img :src="userStore.headPhoto || defaultAvatar" class="avatar" />
          <div class="avatar-ring"></div>
        </div>
        <div class="user-info">
<!--          <h3 class="username">{{ userStore.name }}</h3>-->
          <p class="user-badge" style="text-align: center">✨ 保持热爱，奔赴山海</p>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div class="nav-group">
          <span class="nav-group-title">功能</span>
          <router-link
            v-for="route in navRoutes"
            :key="route.path"
            :to="route.path"
            :class="{ active: $route.path === route.path }"
            class="nav-item"
          >
            <span class="nav-icon">
              <el-icon><component :is="route.icon" /></el-icon>
            </span>
            <span class="nav-text">{{ route.name }}</span>
            <span class="nav-indicator"></span>
          </router-link>
        </div>
      </nav>

      <!-- 底部 -->
      <div class="sidebar-footer">
        <div class="time-display">
          <span class="time">{{ currentTime }}</span>
          <span class="date">{{ currentDate }}</span>
        </div>
        <div @click="logOut" class="logout-btn">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="main-area">
      <!-- 顶部栏 -->
      <header v-if="!isLoginPage" class="header-glass">
        <div class="search-trigger" @click="drawer = true">
          <el-icon><Search /></el-icon>
          <span>已接入 DeepSeek，请输入搜索内容...</span>
        </div>
        <div class="user-info">
          <img :src="userStore.headPhoto || defaultAvatar" class="head-img" />
          <span>欢迎 {{ userStore.name }}</span>
        </div>
      </header>

      <!-- 内容页 -->
      <main class="content-glass">
        <router-view />
      </main>
    </div>

    <!-- 搜索抽屉 -->
    <el-drawer
      v-model="drawer"
      direction="ttb"
      size="54%"
      :with-header="false"
      class="search-drawer"
    >
      <div class="search-bar-glass">
        <el-input
          v-model="searchQuery"
          placeholder="输入关键词，回车搜索"
          clearable
          @clear="handleClear"
          @keyup.enter="search"
          class="search-input"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button
          type="primary"
          round
          :loading="searching"
          @click="search"
        >
          搜索
        </el-button>
      </div>

      <div class="result-area">
        <el-scrollbar>
          <el-card v-if="textData" class="result-card">
            <div v-html="textData.replace(/\n/g, '<br>')"></div>
          </el-card>
        </el-scrollbar>
      </div>
    </el-drawer>

    <!-- 消息通知弹窗 -->
    <NotificationPopup />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, SwitchButton, HomeFilled, Picture, ChatDotRound, Document, Reading, House, TrendCharts } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import NotificationPopup from '@/components/NotificationPopup.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const drawer = ref(false)
const searchQuery = ref('')
const textData = ref('')
const searching = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const isLoginPage = computed(() => route.path === '/login')

const navRoutes = computed(() => [
  { path: '/', name: `${userStore.name}的兴趣小首页`, icon: 'HomeFilled' },
  { path: '/photo', name: '菜鸟的地球观察日记', icon: 'Picture' },
  { path: '/messageList', name: '路人甲的待回留言本', icon: 'ChatDotRound' },
  { path: '/markDownPage', name: '小白的碎片笔记手记', icon: 'Document' },
  { path: '/news', name: '吃瓜人的日常新闻录', icon: 'Reading' },
  { path: '/house', name: '牛马人的一生之敌', icon: 'TrendCharts' },
])

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
}

const logOut = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('name')
  userStore.clearUser()
  router.push('/login')
}

const handleClear = () => {
  searchQuery.value = ''
  textData.value = ''
}

const search = () => {
  if (!searchQuery.value.trim()) return
  searching.value = true
  textData.value = '思考中...'

  const token = 'Bearer ' + localStorage.getItem('token')
  const es = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL || '/api'}/streamDeepSeek?word=${searchQuery.value}`,
    { withCredentials: true }
  )

  textData.value = ''
  es.onmessage = (e) => {
    if (e.data === 'i_am_finish') {
      es.close()
      searching.value = false
      return
    }
    textData.value += e.data
  }
  es.onerror = () => {
    es.close()
    searching.value = false
  }
}

onMounted(() => {
  userStore.initUser()
  updateTime()
  setInterval(updateTime, 1000)
})

onUnmounted(() => {
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 主题变量 - 与 README 风格指南保持一致 */
:root {
  /* 玻璃效果 */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);

  /* 主题色 */
  --primary: #2c3e50;
  --accent: #3498db;
  --active: #3498db;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* 布局 */
  --side-width: 220px;
  --header-height: 60px;

  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15);

  /* 边框 */
  --border-color: #ebeef5;
  --border-radius: 12px;
  --border-radius-sm: 8px;
}

.app-root {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
  overflow: hidden;
}

/* ==================== 阳光侧边栏 ==================== */
.sidebar {
  width: 260px;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 阳光渐变背景 */
  background: linear-gradient(180deg, #e8f4fc 0%, #d4e9f7 50%, #f5e6ff 100%);
}

/* 背景装饰 */
.sidebar-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
}

.circle-1 {
  width: 180px;
  height: 180px;
  background: rgba(255, 183, 121, 0.4);
  top: -60px;
  right: -40px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 120px;
  height: 120px;
  background: rgba(135, 206, 250, 0.5);
  bottom: 30%;
  left: -40px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 80px;
  height: 80px;
  background: rgba(255, 182, 193, 0.4);
  bottom: 10px;
  right: 30px;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
}

/* 用户信息区 */
.user-section {
  position: relative;
  z-index: 1;
  padding: 32px 20px 24px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.25);
  transition: all 0.3s;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #3498db, #f39c12, #e74c3c) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.avatar:hover {
  transform: scale(1.05);
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.user-badge {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 0 12px;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group-title {
  display: block;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 4px;
  border-radius: 12px;
  color: #5a6c7d;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 导航项背景 */
.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.12), rgba(243, 156, 18, 0.08));
  opacity: 0;
  transition: opacity 0.25s;
}

.nav-item:hover {
  color: #3498db;
  transform: translateX(4px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

/* 激活状态 */
.nav-item.active {
  color: #fff;
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
  box-shadow: 0 4px 20px rgba(52, 152, 219, 0.35);
}

.nav-item.active .nav-icon {
  color: #fff;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #fff;
  border-radius: 4px 0 0 4px;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  font-size: 18px;
  transition: all 0.25s;
}

.nav-text {
  flex: 1;
  position: relative;
  z-index: 1;
}

.nav-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bdc3c7;
  transition: all 0.25s;
}

.nav-item:hover .nav-indicator {
  background: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
}

.nav-item.active .nav-indicator {
  background: #fff;
}

/* 底部区域 */
.sidebar-footer {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  border-top: 1px solid rgba(52, 152, 219, 0.15);
}

.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.time {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'JetBrains Mono', monospace;
}

.date {
  font-size: 12px;
  color: #95a5a6;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.2);
  transform: translateY(-2px);
}

/* 主区域 */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  gap: var(--space-md);
  overflow: hidden;
}

/* 顶部栏 */
.header-glass {
  height: var(--header-height);
  padding: 0 var(--space-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: #909399;
  cursor: pointer;
  font-size: 14px;
  width: 90%;
  height: 44px;
  padding: 0 var(--space-md);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s;
}

.search-trigger:hover {
  background: rgba(52, 152, 219, 0.08);
  color: var(--accent);
}

.user-info {
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--primary);
}

.head-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  border: 2px solid rgba(52, 152, 219, 0.3);
}

/* 内容区 */
.content-glass {
  flex: 1;
  background: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: auto;
}

/* 搜索抽屉 */
.search-drawer {
  border-top-left-radius: 24px !important;
  border-top-right-radius: 24px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
}

.search-bar-glass {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-sm);
}

.result-area {
  height: calc(100% - 81px);
  padding: 0 var(--space-lg) var(--space-lg);
}

.result-card {
  border-radius: var(--border-radius);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  line-height: 1.8;
  border: 1px solid var(--border-color);
}

/* Element Plus 全局覆盖 */
.el-button--primary {
  --el-button-bg-color: #3498db;
  --el-button-border-color: #3498db;
  --el-button-hover-bg-color: #2980b9;
  --el-button-hover-border-color: #2980b9;
}
</style>
