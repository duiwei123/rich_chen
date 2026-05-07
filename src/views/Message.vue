<template>
  <div class="message-page">
    <!-- 顶部标题区 -->
    <div class="header-card">
      <div class="header-content">
        <h1 class="title">💬 路人甲的待回留言本</h1>
        <p class="subtitle">留下你的足迹，我会认真回复每一条留言</p>
      </div>
    </div>

    <!-- 留言表单 -->
    <div class="message-form-card">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item prop="message">
          <el-input
            v-model="form.message"
            type="textarea"
            :rows="4"
            placeholder="有什么想说的？在这里留言吧..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <div class="form-footer">
          <el-radio-group v-model="form.msgType">
            <el-radio value="1">📝 私密留言</el-radio>
            <el-radio value="2">🌍 公开留言</el-radio>
          </el-radio-group>
          <el-button type="primary" @click="submitMessage" :loading="submitting">
            <el-icon><Promotion /></el-icon>
            提交留言
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 留言列表 -->
    <div class="message-list" v-loading="loading">
      <div
        v-for="(msg, index) in messageList"
        :key="msg.id"
        class="message-card"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="message-header">
          <div class="avatar">
            {{ msg.username?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="user-info">
            <span class="username">{{ msg.username || '匿名用户' }}</span>
            <span class="time">{{ formatDate(msg.createdAt) }}</span>
          </div>
          <el-tag v-if="msg.msgType === '1'" type="warning" size="small" effect="dark">
            <el-icon><Lock /></el-icon> 私密
          </el-tag>
          <el-tag v-else type="success" size="small" effect="dark">
            <el-icon><ChatDotRound /></el-icon> 公开
          </el-tag>
        </div>
        <div class="message-content">
          {{ msg.message }}
        </div>
        <div class="message-footer" v-if="msg.reply">
          <div class="reply">
            <span class="reply-label">💬 管理员回复：</span>
            <span class="reply-text">{{ msg.reply }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="messageList.length === 0 && !loading" class="empty-state">
        <el-icon class="empty-icon"><ChatDotRound /></el-icon>
        <p>还没有留言，快来抢先留言吧！</p>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion, Lock, ChatDotRound } from '@element-plus/icons-vue'
import http from '@/utils/http'

interface Message {
  id: number
  message: string
  msgType: string
  username: string
  reply: string
  createdAt: string
}

const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const messageList = ref<Message[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const formRef = ref()

const form = reactive({
  message: '',
  msgType: '2'
})

const rules = {
  message: [{ required: true, message: '请输入留言内容', trigger: 'blur' }]
}

const fetchMessageList = async (reset = false) => {
  if (reset) {
    pageNum.value = 1
    messageList.value = []
    hasMore.value = true
  }

  loading.value = true
  try {
    const res = await http.post('/messageList', {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })

    const newMessages = res.data.data.records || []

    if (reset) {
      messageList.value = newMessages
    } else {
      messageList.value.push(...newMessages)
    }

    hasMore.value = newMessages.length >= pageSize.value
  } catch (e) {
    ElMessage.error('获取留言列表失败')
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  pageNum.value++
  loadingMore.value = true
  await fetchMessageList()
  loadingMore.value = false
}

const submitMessage = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await http.post('/saveMessage', {
      message: form.message,
      msgType: form.msgType
    })

    ElMessage.success('留言成功！')
    form.message = ''
    await fetchMessageList(true)
  } catch (e: any) {
    ElMessage.error(e.message || '留言失败，请重试')
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchMessageList(true)
})
</script>

<style scoped>
.message-page {
  padding: var(--space-lg);
  min-height: 100%;
}

/* 顶部标题区 */
.header-card {
  padding: var(--space-lg) var(--space-xl);
  margin-bottom: var(--space-lg);
  border-radius: 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(245, 87, 108, 0.35);
}

.header-content .title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px 0;
}

.header-content .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* 留言表单 */
.message-form-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: var(--space-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.form-footer .el-button {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  padding: 12px 24px;
  font-weight: 600;
}

.form-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

/* 留言列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.5s ease backwards;
  transition: all 0.3s ease;
}

.message-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.message-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.message-footer {
  margin-top: 12px;
  padding-top: 12px;
}

.reply {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
}

.reply-label {
  color: #f5576c;
  font-weight: 600;
}

.reply-text {
  color: #606266;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #dcdfe6;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more .el-button {
  padding: 12px 32px;
  border-radius: 25px;
}

/* 响应式 */
@media (max-width: 768px) {
  .form-footer {
    flex-direction: column;
    gap: 16px;
  }

  .form-footer .el-button {
    width: 100%;
  }
}
</style>
