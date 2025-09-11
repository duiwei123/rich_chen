<template>
  <div class="markdown-editor">
    <!-- 顶部操作栏 -->
    <div class="editor-header">
      <el-input 
        v-model="article.title" 
        placeholder="请输入文章标题" 
        class="title-input"
      ></el-input>
      <div class="header-actions">
        <el-select 
          v-model="article.categoryId" 
          placeholder="选择分类" 
          clearable
          style="width: 150px; margin-right: 10px"
        >
          <el-option 
            v-for="category in categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="saveArticle">保存草稿</el-button>
        <el-button type="success" @click="publishArticle">发布文章</el-button>
        <el-button @click="reBuck">返回列表</el-button>
      </div>
    </div>

    <!-- 编辑区与预览区（响应式布局） -->
    <el-row class="editor-content">
      <!-- 编辑区（左侧） -->
      <el-col :span="24" class="editor-panel">
        <mavon-editor 
          v-model="article.content" 
          :toolbars="toolbars"
          @change="handleContentChange"
          style="height: 100%"
        ></mavon-editor>
      </el-col>

      <!-- 预览区（右侧） -->
      <!-- <el-col :span="12" class="preview-panel">
        <div class="panel-title">预览区</div>
        <div class="preview-content" v-html="article.htmlContent"></div>
      </el-col> -->
    </el-row>
  </div>
</template>

<script>
import http from "../../utils/http";
import "mavon-editor/dist/css/index.css";
import { mavonEditor } from "mavon-editor";

export default {
  components: {
    mavonEditor
  },
  data() {
    return {
      // 文章数据
      article: {
        title: "",
        content: "", // markdown 原始内容
        htmlContent: "", // 转换后的 HTML
        categoryId: "",
        tags: [], // 标签 ID 数组
        status: 0 // 0:草稿, 1:已发布
      },
      // 工具栏配置
       toolbars: {
        bold: true,         // 粗体
        italic: true,       // 斜体
        header: true,       // 标题
        underline: true,    // 下划线
        strikethrough: true,// 删除线
        mark: true,         // 标记
        superscript: true,  // 上标
        subscript: true,    // 下标
        quote: true,        // 引用
        ol: true,           // 有序列表
        ul: true,           // 无序列表
        link: true,         // 链接
        imagelink: true,    // 图片链接
        code: true,         // 代码块
        table: true,        // 表格
        fullscreen: true,   // 全屏
        readmodel: true,    // 阅读模式
        htmlcode: true,     // 展示HTML代码
        help: true,         // 帮助
        undo: true,         // 撤销
        redo: true,         // 重做
        trash: true,        // 清空
        save: false,        // 禁用默认保存（根据需求开启）
        navigation: true,   // 导航目录
        alignleft: true,    // 左对齐
        aligncenter: true,  // 居中对齐
        alignright: true,   // 右对齐
      },
      // 分类和标签（从后端获取）
      categories: [{ id: 1, name: "技术" }, { id: 2, name: "生活" }, { id: 3, name: "其他" }],
      allTags: [{ id: 1, name: "前端" }, { id: 2, name: "Java" }, { id: 3, name: "Go" }]
    };
  },
  methods: {

    async fetchDetail() {
      const id = this.$route.params.id;
      try {
        const res = await http.get(`/noteDetail?id=${id}`);
        console.log(res.data)
        this.article = res.data || res;
      } catch (e) {
        this.$message.error("获取详情失败");
      }
    },


    // 实时转换 markdown 为 HTML
    handleContentChange(value, render) {
      this.article.content = value;
      this.article.htmlContent = render;
    },
    // 保存草稿
    saveArticle() {
      this.article.status = 0;
      this.submitArticle();
    },
    // 发布文章
    publishArticle() {
      if (!this.article.title) {
        this.$message.warning("请输入文章标题");
        return;
      }
      if (!this.article.content) {
        this.$message.warning("请输入文章内容");
        return;
      }
      this.article.status = 1;
      this.submitArticle();
      this.$router.push({
        name: "MarkDownPage", // 你的详情页路由 name
      });
    },
    reBuck() {
      this.$router.push({
        name: "MarkDownPage", // 你的详情页路由 name
      });  
    },
    // 提交到后端
    async submitArticle() {
      try {
        const res = await http.post("/saveNote", this.article);
        this.$message.success(res.data.message || (this.article.status === 1 ? "发布成功" : "保存成功"));
      } catch (err) {
        this.$message.error("操作失败：" + (err.response?.data?.message || err.message));
      }
    }
  },
  // 初始化：获取分类和标签列表
  async mounted() {
    this.fetchDetail()
    // 实际项目中打开下面的注释，从后端获取分类和标签
    /*
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        this.$axios.get('/api/categories'),
        this.$axios.get('/api/tags')
      ])
      this.categories = categoriesRes.data.data
      this.allTags = tagsRes.data.data
    } catch (err) {
      this.$message.error("获取分类和标签失败");
      console.error(err);
    }
    */
  }
};
</script>

<style scoped>
.markdown-editor {
  padding: 0 20px;
  height: 88vh; /* 占满整个视口高度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.title-input {
  flex: 1;
  font-size: 20px;
  font-weight: bold;
  border: 1px solid #e5e7eb;
}

.title-input ::v-deep .el-input__inner {
  padding: 12px 15px;
  border-radius: 4px;
  border-color: #e5e7eb;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.editor-content {
  flex: 1; /* 占据剩余空间 */
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.editor-panel,
.preview-panel {
  height: 100%; /* 继承父容器高度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  font-size: 14px;
}

/* 编辑区样式 */
::v-deep .mavon-editor {
  flex: 1; /* 占满剩余空间 */
  border: none !important;
  margin: 0 !important;
}

/* 预览区样式 */
.preview-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #fff;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .editor-content {
    flex-direction: column;
  }
  
  .editor-panel,
  .preview-panel {
    width: 100% !important;
    height: 50% !important;
  }
  
  .editor-panel {
    border-right: none !important;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 768px) {
  .markdown-editor {
    padding: 10px;
  }
  
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .title-input {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .editor-panel,
  .preview-panel {
    height: auto;
    min-height: 400px;
  }
}
</style>