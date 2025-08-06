<template>
  <el-container>
    <!-- 侧边栏 -->
    <el-aside class="app-el-aside" v-if="!isLoginPage" width="200px">
      <el-menu
        mode="vertical"
        router
        default-active="/"
        class="el-menu-vertical-demo noRightBorder app-el-menu"
      >
        <el-menu-item class="logo">LOGO</el-menu-item>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/user-management">用户管理</el-menu-item>
        <el-menu-item index="/order">流水管理</el-menu-item>
        <el-menu-item index="/photo">菜鸟的地球观察日记</el-menu-item>
        <el-menu-item index="/messageList">消息列表</el-menu-item>
        <el-menu-item index="/homePage">首页</el-menu-item>
        <el-menu-item @click="logOut">退出</el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="app-container marginNone">
      <el-header class="header" v-if="!isLoginPage">
        <div class="search">
          <div @click="drawer = true" type="primary" style="margin-left: 16px">
            <el-icon><Search /></el-icon> 已接入Deepseek，请输入搜索内容...
          </div>
        </div>
        <div style="height: 60px">
          <span><img class="headPhoto" :src="headPhoto" /></span>
          <span style="font-size: 12px">欢迎{{ name }}</span>
        </div>
      </el-header>
      <el-main class="realMain">
        <!-- 设置 direction 属性为 ttb 实现从上到下弹出 -->
        <el-drawer v-model="drawer" :with-header="false" direction="ttb">
          <!-- 搜索框 -->
          <div style="padding: 20px; display: flex">
            <el-input
              v-model="searchQuery"
              placeholder="Search..."
              clearable
              @input="handleSearch"
              style="flex: 0 0 92%; margin-right: 10px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="search" style="flex: 0 0 8%">搜索</el-button>
          </div>
          <!-- 文本展示框 -->
          <div style="padding: 0 20px; min-height: 200px" ref="loadingTarget">
            <el-card v-if="filteredText" class="text-display-box">
              <p>{{ filteredText }}</p>
            </el-card>
            <el-card v-else class="text-display-box">
              <p>{{ textData }}</p>
            </el-card>
          </div>
        </el-drawer>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import http from "@utils/http";
import {baseHttpUrl} from "@utils/http";
import { EventSourcePolyfill } from "event-source-polyfill";

const baseUrl =  baseHttpUrl;
// const baseUrl =  'http://115.190.91.146:8080';

export default {
  data() {
    return {
      name: localStorage.getItem("name"),
      drawer: false, // 控制抽屉的显示
      searchQuery: "", // 搜索框的内容
      textData: "", // 原始文本
      loadingInstance: null, // 加载实例
      headPhoto: localStorage.getItem("headPhoto"),
      messages: "",
      eventSource: null,
    };
  },
  computed: {
    // 计算属性，判断当前是否为登录页面
    isLoginPage() {
      return this.$route.path === "/login";
    },
    // 过滤后的文本
    // filteredText() {
    //   if (!this.searchQuery) return this.textData; // 如果没有输入，显示全部文本
    //   const lowerCaseQuery = this.searchQuery.toLowerCase();
    //   if (this.textData.toLowerCase().includes(lowerCaseQuery)) {
    //     return this.textData; // 如果匹配，显示原始文本
    //   }
    //   return null; // 如果没有匹配，返回 null
    // },
  },
  mounted() {
    const token = "Bearer " + localStorage.getItem("token"); // 替换为实际的token
    const url = "/sse";

    // 创建EventSource对象，连接到服务端的SSE接口，并携带token
    this.eventSource = new EventSourcePolyfill(baseUrl + url, {
      headers: {
        Authorization: token,
      },
      heartbeatTimeout: 120000, // 自定义配置
    });
    // 监听消息事件
    this.eventSource.onmessage = (event) => {
      console.log("eventdata是" + event.data);
      if (event.data == "heartbeat") {
        return;
      }
      this.message = event.data;
      this.$notific({
        title: "新消息", // 标题
        message: this.message, // 消息内容
        type: "info", // 类型：success/warning/info/error
        position: "bottom-right", // 显示位置
        duration: 3000, // 自动关闭时间（毫秒）
      });
    };

    // 监听错误事件
    this.eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
    };
  },
  beforeDestroy() {
    // 组件销毁前关闭EventSource连接
    if (this.eventSource) {
      this.eventSource.close();
    }
    if (this.deepSeekEvent) {
      this.deepSeekEvent.close();
    }
  },
  beforeDestroy() {
    // 组件销毁前关闭EventSource连接
    if (this.eventSource) {
      this.eventSource.close();
    }
    if (this.deepSeekEvent) {
      this.deepSeekEvent.close();
    }
  },
  methods: {
    logOut() {
      console.log("清除token");
      this.name = "";
      localStorage.setItem("token", null);
      localStorage.setItem("name", null);
      this.$router.push("/login");
    },
    handleSearch() {
      // 搜索逻辑
      console.log("搜索内容:", this.searchQuery);
    },
    search() {
      console.log("ttttttt");
      this.textData = "思考中...";
      // 流式deepseek
      const token = "Bearer " + localStorage.getItem("token"); // 替换为实际的token
      // 创建EventSource对象，连接到服务端的SSE接口，并携带token
      var deepSeekEvent = new EventSourcePolyfill(
        baseUrl + "/streamDeepSeek?word=" + this.searchQuery,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      this.textData = "";
      // 监听消息事件
      deepSeekEvent.onmessage = (event) => {
        console.log("ssss", JSON.stringify(event, null, 2));
        if (event.data === "i_am_finish") {
          console.log("ggggggggg");
          // 假设服务端发送结束标记
          deepSeekEvent.close();
          return;
        }
        this.textData = this.textData += event.data;
      };
      deepSeekEvent.close;
    },
  },
  created() {},
};
</script>

<style>
.headPhoto {
  vertical-align: middle;
  height: 25px;
  border-radius: 15px;
  margin-right: 5px;
}
.el-loading-spinner .el-loading-text {
  color: #fff !important;
}
.circular {
  border: 1px solid #fff;
}

.el-loading-spinner {
  top: 37% !important;
}

.text-display-box {
  /* 可以根据需要添加卡片样式 */
  min-height: 200px; /* 增加文本展示框的最小高度 */
}

/* 确保加载文字和图标正常显示 */
.el-loading-mask {
  display: flex;
  justify-content: center;
  align-items: center;
}
.el-drawer {
  height: 50% !important;
}
.text-display-box {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  margin-top: 10px;
}
.search:hover {
  cursor: pointer;
}
.search {
  color: var(--el-text-color-placeholder);
  cursor: default;
  width: 100%;
}

.el-input__wrapper {
  box-shadow: none !important;
}

.logo {
  margin: 20px 0 !important;
}
.app-el-menu {
  background: none !important;
}
.is-active {
  border-radius: 20px 0 0 20px;
}
.app-el-aside {
  margin-left: 15px;
}
.app-container {
  background: #fff;
  margin: 15px 15px 15px 0;
  border-radius: 10px;
}

.header {
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between
}

.noRightBorder {
  border-right: 0 !important;
}
#app {
  background: #20a2a2;
}

.el-header {
  line-height: 60px;
  background: #ffffff;
}

body {
  margin: 0;
}
.el-menu-item {
  color: #ffffff !important;
  background-color: #20a2a2;
}
.el-menu-item:hover {
  color: #263445 !important;
  border-radius: 20px 0 0 20px;
}

.is-active {
  border-radius: 20px 0 0 20px;
  /* background-color: #C4F5FC!important; */
  background-color: #fff !important;
  color: #20a2a2 !important;
}
.el-aside {
  background-color: #20a2a2;
  color: #fff;
  height: 100vh;
}

.el-menu-vertical-demo {
  border-right: none;
}

.el-menu-item {
  color: #fff;
}

.el-menu-item:hover {
  background-color: #263445;
}

.realMain {
  padding: 0px;
  background: #fff;
  margin: 0px 10px 0 10px;
}
.el-main {
  padding: 0 !important;
}
</style>