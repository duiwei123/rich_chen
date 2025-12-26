<template>
  <div class="app-root">
    <!-- 侧边栏 -->
    <aside v-if="!isLoginPage" class="side-glass">
      <div class="logo"><img src="/src/assets/logo.png" style="width: 120px;"> </div>
      <nav>
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          :class="{ active: $route.path === route.path }"
        >
          {{ route.name }}
        </router-link>
        <a @click="logOut">退出</a>
      </nav>
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
          <img :src="headPhoto" class="head-img" />
          <span>欢迎 {{ name }}</span>
        </div>
      </header>

      <!-- 内容页 -->
      <main class="content-glass">
        <router-view />
      </main>
    </div>

    <!-- 搜索抽屉（玻璃风 + 回车发送） -->
    <el-drawer
      v-model="drawer"
      direction="ttb"
      size="54%"
      :with-header="false"
      class="search-drawer"
    >
      <!-- 顶部搜索栏 -->
      <div class="search-bar-glass">
        <el-input
          v-model="searchQuery"
          placeholder="输入关键词，回车搜索"
          clearable
          @clear="handleClear"
          @keyup.enter.native="search"
          class="search-input"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
          <template #suffix>
            <el-icon
              v-if="searchQuery"
              class="clear-icon"
              @click="handleClear"
            ><CircleClose /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          round
          :loading="searching"
          @click="search"
          class="search-btn"
        >
          搜索
        </el-button>
      </div>

      <!-- 结果区（隐藏滚动条） -->
      <div class="result-area">
        <el-scrollbar>
          <el-card
            v-if="filteredText || textData"
            class="result-card"
            :body-style="{ padding: '16px 20px' }"
          >
            <div v-html="(filteredText || textData).replace(/\n/g,'<br>')"></div>
          </el-card>

          <!-- 空状态 -->
          <!-- <el-empty
            v-else-if="!searching && searchQuery"
            description="暂无匹配内容"
            class="empty-glass"
          /> -->
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script>
/* ============== 零逻辑改动 ============== */
import http from "@/utils/http";
import { baseHttpUrl } from "@/utils/http";
import { EventSourcePolyfill } from "event-source-polyfill";
const baseUrl = baseHttpUrl;

export default {
  data() {
    return {
      name: localStorage.getItem("name"),
      drawer: false,
      searchQuery: "",
      textData: "",
      headPhoto:
        localStorage.getItem("headPhoto") || "/src/assets/weatherIco/0-1x.png",
      eventSource: null,
      searching: false, // 新增：加载状态
    };
  },
  computed: {
    isLoginPage() {
      return this.$route.path === "/login";
    },
    filteredText() {
      if (!this.searchQuery) return this.textData;
      return this.textData
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
        ? this.textData
        : null;
    },
    navRoutes() {
      return [
        { path: "/", name: this.name + "的兴趣小首页" },
        // { path: "/user-management", name: "用户管理" },
        // { path: "/order", name: "流水管理" },
        { path: "/photo", name: "菜鸟的地球观察日记" },
        { path: "/messageList", name: "路人甲的待回留言本" },
        { path: "/markDownPage", name: "小白的碎片笔记手记" },
        { path: "/news", name:"吃瓜人的日常新闻录"},
        { path: "/house", name:"🐂🐎人的一生之敌"},
      ];
    },
  },
  mounted() {
    const token = "Bearer " + localStorage.getItem("token");
    this.eventSource = new EventSourcePolyfill(baseUrl + "/sse", {
      headers: { Authorization: token },
      heartbeatTimeout: 120000,
    });
    this.eventSource.onmessage = (e) => {
      if (e.data === "heartbeat") return;
      this.$notific({
        title: "新消息",
        message: e.data,
        type: "info",
        position: "bottom-right",
        duration: 3000,
      });
    };
    this.eventSource.onerror = (e) => console.error("SSE error", e);
  },
  beforeDestroy() {
    this.eventSource?.close();
    this.deepSeekEvent?.close();
  },
  methods: {
    logOut() {
      localStorage.setItem("token", null);
      localStorage.setItem("name", null);
      this.$router.push("/login");
    },
    handleSearch() {},
    search() {
      if (!this.searchQuery.trim()) return;
      this.searching = true;
      this.textData = "思考中...";
      const token = "Bearer " + localStorage.getItem("token");
      const es = new EventSourcePolyfill(
        baseUrl + "/streamDeepSeek?word=" + this.searchQuery,
        { headers: { Authorization: token } }
      );
      this.textData = "";
      es.onmessage = (e) => {
        if (e.data === "i_am_finish") {
          es.close();
          this.searching = false;
          return;
        }
        this.textData += e.data;
      };
      es.onerror = () => {
        es.close();
        this.searching = false;
      };
    },
    handleClear() {
      this.searchQuery = "";
      this.textData = "";
    },
  },
};
</script>

<style>
body {
  margin: 0;
}
</style>

<style scoped>
/* **************** 玻璃风统一变量 **************** */
:root {
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-border: rgba(255, 255, 255, 0.35);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --active: #409eff;
  --side-width: 200px;
}

/* **************** 整体舞台 **************** */
.app-root {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* **************** 侧边栏 **************** */
.side-glass {
  width: var(--side-width);
  padding: 24px 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  box-shadow: var(--glass-shadow);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
}
.logo {
  margin: 0 24px 24px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
  color: #303133;
}
nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}
nav a {
  padding: 10px 16px;
  border-radius: 8px;
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}
nav a:hover {
  background: rgba(64, 158, 255, 0.1);
  color: var(--active);
}
nav a.active {
  background: var(--active);
  /* color: #fff; */
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
nav a:last-child {
  margin-top: auto;
  color: #f56c6c;
}

/* **************** 主区域 **************** */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}
.header-glass {
  height: 60px;
  padding: 0 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 14px;
  width: 90%;
  height: 50px;
}
.search-trigger:hover {
  color: var(--active);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.head-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.content-glass {
  flex: 1;
  padding: 0 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: auto;
}

/* **************** 搜索抽屉玻璃风 + 回车发送 **************** */
.search-drawer {
  border-top-left-radius: 24px !important;
  border-top-right-radius: 24px !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 -8px 32px rgba(31, 38, 135, 0.15);
  border-top: 1px solid var(--glass-border);
}

/* 搜索栏 */
.search-bar-glass {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}
.search-input {
  flex: 1;
  border-radius: 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
}
.search-input :deep(.el-input__inner) {
  border: none;
  background: transparent;
  box-shadow: none;
}
.clear-icon {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}
.clear-icon:hover {
  color: var(--active);
}
.search-btn {
  min-width: 88px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
}

/* 结果区（隐藏滚动条） */
.result-area {
  height: calc(100% - 81px);
  padding: 0 24px 24px;
}
.result-area :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
.result-card {
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  line-height: 1.8;
  color: #303133;
}
.empty-glass {
  margin-top: 10vh;
  background: transparent;
  backdrop-filter: none;
  border: none;
}
.empty-glass :deep(.el-empty__description) {
  color: #909399;
}

/* 隐藏滚动条但保留滚动 */
.result-area :deep(.el-scrollbar__bar) {
  opacity: 0 !important;
}
</style>