<template>
  <div class="md-root">
    <!-- 顶部标题 + 计数 -->
    <header class="header-glass">
      <h1 class="page-title">Markdown 笔记</h1>
      <div>
        <span class="count" style="margin: 0 10px;">共 {{ total }} 篇</span>
        <el-button @click="goEdit">去写一篇</el-button>
      </div>
    </header>

    <!-- 内容区（隐藏滚动条） -->
    <main class="content-glass">
      <el-scrollbar>
        <!-- 空状态 -->
        <el-empty
          v-if="!loading && list.length === 0"
          description="暂无笔记"
          class="empty-glass"
        />

        <!-- 瀑布流卡片（点击跳转） -->
        <transition-group name="drop" tag="div" class="waterfall">
          <div
            v-for="(item, index) in list"
            :key="item.Id"
            class="item-glass"
            :style="{ '--delay': (index % 10) * 50 + 'ms' }"
            @click="goDetail(item)"
          >
            <!-- 封面图（可选） -->
            <img v-if="item.image" :src="item.image" class="cover-img" />
            <!-- 内容 -->
            <div class="body height210">
              <h3 class="title">{{ item.title }}</h3>
              <p class="desc" v-html="item.HtmlContent"></p>
              <div class="footer">
                <span class="date">{{ formatDate(item.CreatedAt) }}</span>
                <span class="category">分类 {{ item.CategoryId }}</span>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- 分页 -->
        <div class="pagination-glass">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            @current-change="changePage"
          />
        </div>
      </el-scrollbar>
    </main>
  </div>
</template>

<script>
import http from "../../utils/http"; // 你的封装实例

export default {
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    /* -------- 获取列表（使用 http 封装） -------- */
    async fetchList() {
      this.loading = true;
      try {
        const res = await http.get("/notePage", {
          params: { page: this.page, pageSize: this.pageSize },
        });
        this.list = res.data?.data || res.data || [];
        this.total = res.pagination?.total || res.data?.length || 0;
      } catch (e) {
        this.$message.error("获取列表失败");
      } finally {
        this.loading = false;
      }
    },

    goEdit() {
      this.$router.push({
        name: "MarkDownEdit1",
      });
    },

    /* -------- 分页切换 -------- */
    changePage(p) {
      this.page = p;
      this.fetchList();
    },

    goDetail(item) {
      this.$router.push({
        name: "MarkDownDetail", // 你的详情页路由 name
        params: { id: item.Id },
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
.height210 {
  height: 210px;
}
/* **************** 玻璃风统一变量 **************** */
:root {
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-border: rgba(255, 255, 255, 0.35);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  --active: #409eff;
}

/* **************** 整体舞台 **************** */
.md-root {
  /* min-height: 100vh; */
  padding: 0 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* 顶部导航 */
.header-glass {
  justify-content: space-between;
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
}
.count {
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

/* 瀑布流 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}
.item-glass {
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  animation: drop 0.6s ease-out backwards;
  animation-delay: var(--delay);
}
.item-glass:hover {
  transform: translateY(-4px);
}
@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.cover-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.body {
  padding: 16px;
}
.title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.date {
  color: #606266;
}
.category {
  color: var(--active);
}

/* 分页 */
.pagination-glass {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.pagination-glass :deep(.el-pagination) {
  background: transparent;
  border: none;
}
.pagination-glass :deep(.el-pager li) {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}
.pagination-glass :deep(.el-pager li.active) {
  background: var(--active);
  color: #fff;
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