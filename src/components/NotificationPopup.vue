<template>
  <Teleport to="body">
    <TransitionGroup name="notification" tag="div" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="notification.type"
      >
        <div class="notification-icon">
          <el-icon v-if="notification.type === 'success'"><SuccessFilled /></el-icon>
          <el-icon v-else-if="notification.type === 'error'"><CircleCloseFilled /></el-icon>
          <el-icon v-else-if="notification.type === 'warning'"><WarningFilled /></el-icon>
          <el-icon v-else><InfoFilled /></el-icon>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { SuccessFilled, CircleCloseFilled, WarningFilled, InfoFilled, Close } from '@element-plus/icons-vue'
import { addMessageHandler, removeMessageHandler } from '@/utils/sse'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  time: string
}

const notifications = ref<Notification[]>([])
let notificationId = 0

const addNotification = (type: Notification['type'], title: string, message: string) => {
  const id = ++notificationId
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  notifications.value.push({
    id,
    type,
    title,
    message,
    time
  })

  // 20秒后自动移除
  setTimeout(() => {
    removeNotification(id)
  }, 20000)
}

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 处理 SSE 消息
const handleSSEMessage = (data: any) => {
  if (data.type === 'notification' || data.type === 'message') {
    addNotification('info', data.title || '新消息', data.content || '')
  }
}

onMounted(() => {
  addMessageHandler(handleSSEMessage)
})

onUnmounted(() => {
  removeMessageHandler(handleSSEMessage)
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  color: #fff;
  min-width: 280px;
  max-width: 360px;
}

.notification-item.success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  box-shadow: 0 8px 32px rgba(103, 194, 58, 0.4);
}

.notification-item.error {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  box-shadow: 0 8px 32px rgba(245, 108, 108, 0.4);
}

.notification-item.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  box-shadow: 0 8px 32px rgba(230, 162, 60, 0.4);
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
}

.notification-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  word-break: break-word;
}

.notification-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 6px;
}

.notification-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #fff;
}

/* 动画 */
.notification-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-leave-active {
  animation: slideOutRight 0.4s ease-in forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
