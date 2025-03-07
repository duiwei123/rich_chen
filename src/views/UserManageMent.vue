<template>
  <el-container>
    <el-main>
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="姓名">
          <el-input
            v-model="formInline.user"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item label="Activity zone">
          <el-select
            v-model="formInline.region"
            placeholder="Activity zone"
            clearable
          >
            <el-option label="Zone one" value="shanghai" />
            <el-option label="Zone two" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="Activity time">
          <el-date-picker
            v-model="formInline.date"
            type="date"
            placeholder="Pick a date"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getUsers">Query</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="users">
        <el-table-column prop="ID" label="ID"></el-table-column>
        <el-table-column prop="Username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
      </el-table>
      
      <el-pagination :page-size="1" :pager-count="5" layout="prev, pager, next" :total="total"  @current-change="handleCurrentChange"/>

    </el-main>
  </el-container>
</template>

<script>
import http from "../utils/http";

export default {
  data() {
    return {
      users: [],
      name: "",
      region: "",
      formInline:{
        pageSize: 1,
        pageNum: 1,

      },
      total: 10
    };
  },
   created() {
     this.getUsers()
  },
  methods: {
      async getUsers(){
      try {
       const response = await http.post("/users", this.formInline);
      this.users = response.data.records;
      this.total = response.data.count;
      console.log(this.users);
    } catch (error) {
      console.error("获取用户数据失败", error);
    }
     },
     handleCurrentChange(newPage) {
          this.formInline.pageNum = newPage
          this.getUsers()
        }
  },


};
</script>

<style scoped>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
.el-header {
  background-color: #67c23a;
  color: white;
  text-align: center;
  line-height: 60px;
}
</style>