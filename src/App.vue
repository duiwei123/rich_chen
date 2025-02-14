<template>
  <el-container>
    <el-header v-if="!isLoginPage">
      <el-menu mode="horizontal" router>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/user-management">用户管理</el-menu-item>

        <el-menu-item @click="logOut" style="margin-left: auto;">退出</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'App',
  computed: {
    // 计算属性，判断当前是否为登录页面
    isLoginPage() {
      return this.$route.path === '/login';
    }
  },
methods: {
   logOut() {
    console.log("清除token")
    localStorage.setItem('token', null);
    this.$router.push("/login")
  }
}
};
</script>

<style>
.el-header {
  padding: 0;
}
</style>