<template>
  <div class="news-page">
    <!-- 顶部导航 -->
    <header class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()" :icon="ArrowLeft" circle />
        <h2 class="page-title">60 秒热点</h2>
      </div>
      <div class="tabs-scroll">
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-item', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            {{ tab.name }}
          </div>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="page-content">
      <el-scrollbar>
        <el-empty
          v-if="!loading && list.length === 0"
          description="暂无数据"
          class="empty-state"
        />

        <!-- 列表 -->
        <div class="news-list" v-else>
          <div
            v-for="item in list"
            :key="item.id"
            class="news-item"
            @click="handleClick(item)"
          >
            <img
              v-if="item.image"
              :src="item.image"
              class="item-cover"
              loading="lazy"
            />
            <div class="item-body">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-footer">
                <span class="item-source">{{ item.source }}</span>
                <span class="item-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more">
          <el-button
            v-if="hasMore"
            :loading="loading"
            round
            @click="loadMore"
          >
            加载更多
          </el-button>
          <span v-else class="no-more">已经到底啦 ~</span>
        </div>
      </el-scrollbar>
    </main>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="visibleDetail"
      :title="detail.title"
      width="700px"
      top="5vh"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <img v-if="detail.image" :src="detail.image" class="detail-img" />
      <div class="detail-content" v-html="detail.content"></div>
      <template #footer>
        <el-button @click="visibleDetail = false">关闭</el-button>
        <el-button
          v-if="detail.url"
          type="primary"
          @click="openExternal(detail.url)"
        >
          查看原文
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const API_BASE = 'http://101.200.216.197:4399'

const activeTab = ref('douyin')
const tabs = [
  { key: 'douyin', name: '抖音热点' },
  { key: 'weibo', name: '微博热搜' },
  { key: 'zhihu', name: '知乎热榜' },
  { key: 'bili', name: 'B站热榜' },
  { key: 'baidu/realtime', name: '百度实时' },
  { key: 'ncm-rank', name: '网易云热歌' },
  { key: 'hacker-news/news', name: 'Hacker News' },
]

const list = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const visibleDetail = ref(false)
const detail = ref<any>({})

const fetchNews = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/v2/${activeTab.value}?page=${page.value}&size=20`)
    const json = await res.json()
    const raw = json.data || []
    const mapped = raw.map((it: any, idx: number) => mapFields(it, idx))
    list.value.push(...mapped)
    hasMore.value = mapped.length === 20
  } catch (e) {
    console.error('获取数据失败:', e)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const mapFields = (it: any, idx: number) => {
  return {
    id: it.id || it.tid || idx,
    title: it.title || it.word || it.text || '无标题',
    description: it.description || it.summary || it.content || '',
    image: it.image || it.img || it.cover || '',
    time: it.create_time || it.time || '今日',
    source: it.source || activeTab.value,
    url: it.url || it.link || '',
  }
}

const switchTab = (key: string) => {
  list.value = []
  activeTab.value = key
  page.value = 1
  hasMore.value = true
  fetchNews()
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value += 1
  fetchNews()
}

const handleClick = (item: any) => {
  if (item.url) {
    window.open(item.url, '_blank')
  } else {
    showDetail(item)
  }
}

const showDetail = (item: any) => {
  detail.value = { ...item, content: item.content || item.description }
  visibleDetail.value = true
}

const openExternal = (url: string) => {
  window.open(url, '_blank')
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 顶部导航 */
.page-header {
  background: var(--glass-bg, rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color, #ebeef5);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: var(--primary, #2c3e50);
}

.tabs-scroll {
  flex: 1;
  overflow-x: auto;
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: nowrap;
  min-width: max-content;
}

.tab-item {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 14px;
  color: var(--primary, #606266);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-item:hover {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent, #3498db);
}

.tab-item.active {
  background: var(--accent, #3498db);
  color: #fff;
  border-color: var(--accent, #3498db);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

/* 内容区 */
.page-content {
  padding: 0 var(--space-lg) var(--space-lg);
}

.page-content :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

/* 列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.news-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--glass-bg, rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--border-color, #ebeef5);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.item-cover {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  margin: 0;
  font-size: 16px;
  color: var(--primary, #303133);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-desc {
  margin: var(--space-xs) 0 0;
  font-size: 14px;
  color: var(--primary, #909399);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--primary, #909399);
  margin-top: var(--space-xs);
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: var(--space-lg);
}

.no-more {
  font-size: 13px;
  color: var(--primary, #909399);
}

/* 空状态 */
.empty-state {
  padding: 10vh 0;
}

.empty-state :deep(.el-empty__description) {
  color: var(--primary, #909399);
}

/* 详情弹窗 */
.detail-dialog :deep(.el-dialog) {
  background: #fff;
  border-radius: 12px;
}

.detail-img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: var(--space-md);
}

.detail-content {
  line-height: 1.8;
  color: var(--primary, #303133);
  font-size: 15px;
}

.detail-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

/* 移动端 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .news-item {
    flex-direction: column;
  }

  .item-cover {
    width: 100%;
    height: 160px;
  }
}
</style>