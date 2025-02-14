<template>
    <el-container>
      <el-header>
        <h1>首页</h1>
      </el-header>
      <el-main>
        <el-row>
          <el-col :span="24">
            <el-card>
              <h2>欢迎使用 Vue 3 + Element Plus + ECharts + Axios + Vue Router 示例项目</h2>
              <el-button type="primary" @click="goToUserManagement">前往用户管理</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </template>
  
  <script>
  export default {
    methods: {
      goToUserManagement() {
        this.$router.push('/user-management');
      },
    },
  };
  </script>
  
  <style scoped>
  .el-header {
    background-color: #409EFF;
    color: white;
    text-align: center;
    line-height: 60px;
  }
  </style>