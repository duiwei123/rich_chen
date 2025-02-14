<template>
  <el-container>
    <el-header>
      <h1>用户管理</h1>
    </el-header>
    <el-main>
      <el-form class="userForm" ref="form" :model="form" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="活动区域" prop="region">
              <el-select v-model="region" placeholder="请选择活动区域">
                <el-option label="区域一" value="shanghai"></el-option>
                <el-option label="区域二" value="beijing"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-table :data="users" style="width: 100%">
        <el-table-column prop="ID" label="ID" width="180"></el-table-column>
        <el-table-column prop="Username" label="姓名1" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import http from "../utils/http";

export default {
  data() {
    return {
      users: [],
      name: '',
      region: ''
    };
  },
  async created() {
    try {
      const response = await http.get("/users");
      this.users = response.data;
      console.log(this.users);
    } catch (error) {
      console.error("获取用户数据失败", error);
    }
  },
};
</script>

<style scoped>
.el-header {
  background-color: #67c23a;
  color: white;
  text-align: center;
  line-height: 60px;
}
</style>