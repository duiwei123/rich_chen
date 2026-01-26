<template>
  <div class="md-root">
    <!-- 顶部标题 + 计数 -->
    <header class="header-glass">
      <h1 class="page-title">小白的碎片笔记手记</h1>
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
            :style="{ '--delay': (index % 6) * 50 + 'ms' }"
            @click="goDetail(item)"
          >
            <!-- 封面图（可选） -->
            <img v-if="item.image" :src="item.image" class="cover-img" />
            <!-- 内容 -->
            <div class="body">
              <h3 class="title">{{ item.title }}</h3>
              <p class="desc">{{ extractPlainText(item.HtmlContent) }}</p>
              <div class="footer">
                <div class="footer-left">
                  <span class="date">{{ formatDate(item.CreatedAt) }}</span>
                  <span class="category">分类 {{ item.CategoryId }}</span>
                </div>
                <!-- 优化后的删除按钮 -->
                <div class="delete-btn-wrapper" @click.stop="handleDelete(item)">
                  <i class="el-icon-delete delete-icon"></i>
                </div>
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
import http from "../../utils/http";

export default {
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      pageSize: 6, // 改为6条，避免分页掉下去
      total: 0,
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    /* -------- 获取列表 -------- */
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

    changePage(p) {
      this.page = p;
      this.fetchList();
    },

    goDetail(item) {
      this.$router.push({
        name: "MarkDownDetail",
        params: { id: item.Id },
      });
    },

    /* -------- 提取纯文本（去除 Markdown 标记） -------- */
    extractPlainText(htmlContent) {
      if (!htmlContent) return "";
      // 去掉 HTML 标签
      let text = htmlContent.replace(/<[^>]+>/g, "");
      // 去掉 Markdown 标记
      text = text
        .replace(/#{1,6}\s?/g, "") // 标题标记
        .replace(/\*\*|\*|__|_/g, "") // 加粗斜体
        .replace(/`{3}[\s\S]*?`{3}|`{1,2}[^`]*`{1,2}/g, "") // 代码块和行内代码
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接，保留文字
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[图片]") // 图片
        .replace(/>\s?/g, "") // 引用
        .replace(/-\s|\*\s|\+\s/g, "") // 列表标记
        .replace(/\|/g, "") // 表格分隔符
        .replace(/-{3,}|\*{3,}|_{3,}/g, "") // 分隔线
        .replace(/\n/g, " ") // 换行转空格
        .replace(/\s+/g, " ") // 多个空格合并
        .trim();
      return text;
    },

    /* -------- 删除笔记 -------- */
    handleDelete(item) {
      this.$confirm(`确定要删除笔记 "${item.title}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.doDelete(item.Id);
        })
        .catch(() => {});
    },

    async doDelete(id) {
      try {
        await http.get(`/note/del?id=${id}`);
        this.$message.success("删除成功");
        if (this.list.length === 1 && this.page > 1) {
          this.page--;
        }
        this.fetchList();
      } catch (e) {
        this.$message.error("删除失败");
      }
    },

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
  --danger: #f56c6c;
}

/* **************** 整体舞台 **************** */
.md-root {
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
  height: calc(100vh - 140px); /* 动态高度，确保分页可见 */
  min-height: 500px;
  padding: 24px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.content-glass :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
.content-glass :deep(.el-scrollbar__bar) {
  opacity: 0 !important;
}

/* 瀑布流 - 固定高度布局 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  flex: 1; /* 占据剩余空间 */
}

/* 卡片 - 固定高度 */
.item-glass {
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: drop 0.6s ease-out backwards;
  animation-delay: var(--delay);
  height: 280px; /* 固定高度 */
  display: flex;
  flex-direction: column;
  position: relative;
}
.item-glass:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
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
  height: 120px;
  object-fit: cover;
  flex-shrink: 0;
}

/* 内容区域 - 弹性布局 */
.body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}
.desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

/* 底部 - 固定在底部 */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}
.footer-left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.date {
  color: #606266;
}
.category {
  color: var(--active);
  background: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 优化后的删除按钮 */
.delete-btn-wrapper {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}
.item-glass:hover .delete-btn-wrapper {
  opacity: 1;
}
.delete-btn-wrapper:hover {
  background: var(--danger);
  border-color: var(--danger);
  transform: scale(1.1);
}
.delete-btn-wrapper:hover .delete-icon {
  color: #fff;
}
.delete-icon {
  font-size: 14px;
  color: var(--danger);
  transition: color 0.3s ease;
}

/* 分页 - 固定在底部 */
.pagination-glass {
  display: flex;
  justify-content: right;
  padding: 16px 0;
  flex-shrink: 0;
  background: transparent;
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
    height: calc(100vh - 160px);
  }
  .waterfall {
    grid-template-columns: 1fr;
  }
  .item-glass {
    height: 260px;
  }
  .delete-btn-wrapper {
    opacity: 1;
    width: 32px;
    height: 32px;
  }
  .delete-icon {
    font-size: 16px;
  }
}
</style>