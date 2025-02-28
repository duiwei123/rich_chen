<template>
  <el-container>
    <el-main>
      <el-row>
        <el-col class="baise" :span="24">
          <el-card>
            <h2>
              欢迎使用 Vue 3 + Element Plus + ECharts + Axios + Vue Router
            </h2>
            <el-button type="primary" @click="goToUserManagement"
              >前往用户管理</el-button
            >
          </el-card>
        </el-col>
        <div class="littleCard"></div>
        <el-col :span="11">
          <el-card>
            <el-button @click="testDate"></el-button>

          </el-card>
        </el-col>
        <el-col :span="2"></el-col>
        <el-col :span="11">
          <el-card>
            <el-calendar v-model="value">
            </el-calendar>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>
  
  <script>
import http from '../utils/http';
export default {
  data() {
    value: new Date();
    loverWord: ""
  },
  methods: {
    goToUserManagement() {
      this.$router.push("/user-management");
    },
    testDate() {
      console.log(this.value)
    },
    getLoverWord() {
      try {
      const response = http.get("/getLoverWord");
      this.users = response.data;
      console.log(this.users);
    } catch (error) {
      console.error("获取用户数据失败", error);
    }
    }
  },
};
</script>
  
  <style scoped>
  .el-calendar{
    --el-calendar-cell-width: 50px;
  }
.baise {
  margin-bottom: 60px;
}
.littleCard {
  margin-top: 25px;
}
.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
}
</style>