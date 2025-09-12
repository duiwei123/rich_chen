<template>
  <div class="news-root">
    <!-- 顶部导航 -->
    <header class="header-glass">
      <h1 class="page-title">60 秒热点</h1>
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-glass', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </div>
      </div>
    </header>

    <!-- ****** 关键改动：整屏切换动画 ****** -->
    <transition name="fade-slide" mode="out-in">
      <!-- key 强制 Vue 重新挂载节点，避免旧列表动画 -->
      <main class="content-glass" :key="activeTab">
        <el-scrollbar>
          <el-empty
            v-if="!loading && list.length === 0"
            description="暂无数据"
            class="empty-glass"
          />

          <!-- 瀑布流：去掉 transition-group，普通 div 即可 -->
          <div class="waterfall">
            <div
              v-for="item in list"
              :key="item.id"
              class="item-glass"
            >
              <img
                v-if="item.image"
                :src="item.image"
                class="cover-img"
                @click="showDetail(item)"
              />
              <div class="body">
                <h3 class="title" @click="handleTitle(item)">
                  {{ item.title }}
                </h3>
                <p class="desc">{{ item.description }}</p>
                <div class="footer">
                  <span class="source">{{ item.source }}</span>
                  <span class="time">{{ item.time }}</span>
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
    </transition>

    <!-- 图文弹窗 -->
    <el-dialog
      v-model="visible60s"
      :title="detail.title"
      width="700px"
      top="5vh"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <img v-if="detail.image" :src="detail.image" style="width: 100%;" class="detail-img" />
      <div class="detail-body" v-html="detail.content"></div>
      <template #footer>
        <el-button @click="visible60s = false">关闭</el-button>
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

<script>
/* ============== 本地 60s 项目接口 ============== */
const API_BASE = "http://101.200.216.197:4399";

export default {
  data() {
    return {
      activeTab: "douyin",
      tabs: [
        { key: "douyin", name: "抖音热点" },
        { key: "weibo", name: "微博热搜" },
        { key: "zhihu", name: "知乎热榜" },
        { key: "bili", name: "B 站热榜" },
        { key: "baidu/realtime", name: "百度实时" },
        { key: "ncm-rank", name: "网易云热歌" },
        { key: "hacker-news/news", name: "Hacker News" },
      ],
      list: [],
      loading: false,
      hasMore: true,
      page: 1,
      visible60s: false,
      detail: {},
    };
  },
  mounted() {
    this.fetchNews();
  },
  methods: {
    switchTab(key) {
      this.list = [];
      this.activeTab = key;
      this.page = 1;
      this.hasMore = true;
      this.fetchNews();
    },
    async fetchNews() {
      this.loading = true;
      try {
        const res = await fetch(`${API_BASE}/v2/${this.activeTab}?page=${this.page}&size=20`);
        const json = await res.json();
        const raw = json.data || [];
        const mapped = raw.map((it, idx) => this.mapFields(it, idx));
        this.list.push(...mapped);
        this.hasMore = mapped.length === 20;
      } catch (e) {
        this.$message.error("获取数据失败");
      } finally {
        this.loading = false;
      }
    },
    mapFields(it, idx) {
      return {
        id: it.id || it.tid || idx,
        title: it.title || it.word || it.text || "无标题",
        description: it.description || it.summary || it.content || "",
        image: it.image || it.img || it.cover || "",
        time: it.create_time || it.time || "今日",
        source: it.source || this.activeTab,
        url: it.url || it.link || "",
      };
    },
    loadMore() {
      if (this.loading || !this.hasMore) return;
      this.page += 1;
      this.fetchNews();
    },
    handleTitle(item) {
      if (this.activeTab === "60s") {
        this.showDetail(item);
      } else if (item.url) {
        window.open(item.url, "_blank");
      }
    },
    showDetail(item) {
      this.detail = { ...item, content: item.content || item.description };
      this.visible60s = true;
    },
    openExternal(url) {
      window.open(url, "_blank");
    },
  },
};
</script>

<style scoped>
/* **************** 玻璃风统一变量 **************** */
:root {
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-border: rgba(255, 255, 255, 0.35);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --active: #409eff;
}

/* **************** 整体舞台 **************** */
.news-root {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* 顶部导航 */
.header-glass {
  margin: 0 auto 24px;
  max-width: 1200px;
  padding: 20px 32px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 24px;
}
.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}
.tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.tab-glass {
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid var(--glass-border);
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}
.tab-glass:hover {
  background: rgba(64, 158, 255, 0.15);
  color: var(--active);
}
.tab-glass.active {
  background: var(--active);
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 内容区 */
.content-glass {
  max-width: 1200px;
  margin: 0 auto;
  height: 70vh;
  padding: 24px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}
.content-glass :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
.content-glass :deep(.el-scrollbar__bar) {
  opacity: 0 !important;
}

/* ****** 整屏切换动画 ****** */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.28s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

/* 瀑布流 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.item-glass {
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: hidden;
}
.cover-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}
.cover-img:hover {
  transform: scale(1.02);
}
.body {
  padding: 16px;
}
.title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s;
}
.title:hover {
  color: var(--active);
}
.desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 32px;
}
.load-more .el-button {
  border-radius: 20px;
}
.no-more {
  font-size: 13px;
  color: #909399;
}

/* 图文弹窗 */
.detail-dialog {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
.detail-img {
  width: 100%;
  border-radius: 12px;
}
.detail-body {
  line-height: 1.8;
  color: #303133;
}
.detail-body img {
  max-width: 100%;
  border-radius: 8px;
}

/* 空状态 */
.empty-glass {
  margin-top: 10vh;
  background: transparent;
  border: none;
}
.empty-glass :deep(.el-empty__description) {
  color: #909399;
}

/* 移动端微调 */
@media (max-width: 768px) {
  .header-glass {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  .content-glass {
    padding: 16px;
  }
  .waterfall {
    grid-template-columns: 1fr;
  }
}
</style>