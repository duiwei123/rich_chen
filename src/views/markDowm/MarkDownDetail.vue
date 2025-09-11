<template>
  <div class="detail-root">
    <!-- 顶部导航 -->
    <header class="header-glass">
      <h1 class="page-title">{{ detail.title }}</h1>
      <span class="date">{{ formatDate(detail.CreatedAt) }}</span>
      <el-button type="primary" round @click="editArticle">编辑文章</el-button>
      <el-button icon="el-icon-arrow-left" round @click="goBack">返回列表</el-button>

    </header>

    <!-- 内容区（隐藏滚动条） -->
    <main class="content-glass">
      <el-scrollbar>
        <div class="detail-body" v-html="detail.HtmlContent"></div>
      </el-scrollbar>
    </main>

    <!-- 底部操作 -->
    <footer class="footer-glass">
      <!-- <el-button round @click="goBack">返回列表</el-button> -->
    </footer>
  </div>
</template>

<script>
import http from "../../utils/http"; // 你的封装实例

export default {
  data() {
    return {
      detail: {},
    };
  },
  mounted() {
    this.fetchDetail();
  },
  methods: {
    /* -------- 获取详情（使用 http 封装） -------- */
    async fetchDetail() {
      const id = this.$route.params.id;
      console.log("ssss"+ id)
      try {
        const res = await http.get(`/noteDetail?id=${id}`);
        this.detail = res.data || res;
      } catch (e) {
        this.$message.error("获取详情失败");
      }
    },

    /* -------- 返回列表 -------- */
    goBack() {
      this.$router.push({ name: "MarkDownPage" });
    },

    /* -------- 编辑文章（可扩展） -------- */
    editArticle() {
      this.$router.push({
        name: "MarkDownEdit",
        params: { id: this.$route.params.id },
      });
    },

    /* -------- 日期格式化 -------- */
    formatDate(str) {
      return new Date(str).toLocaleDateString();
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
.detail-root {
  padding: 0 24px;
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
  gap: 16px;
}
.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
  flex: 1;
}
.date {
  font-size: 14px;
  color: #909399;
}

/* 内容区（隐藏滚动条） */
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

/* 详情内容 */
.detail-body {
  line-height: 1.8;
  color: #303133;
}
.detail-body img {
  max-width: 100%;
  border-radius: 8px;
}

/* 底部操作 */
.footer-glass {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
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
}
</style>