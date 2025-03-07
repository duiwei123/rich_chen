<template>
    <el-container>

<el-main>
  <el-form class="userForm" ref="form" :model="form" label-width="80px">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-form-item label="账单名称" prop="name">
          <el-input v-model="name"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="账单平台" prop="region">
          <el-select v-model="region" placeholder="请选择账单平台">
            <el-option label="微信" value="shanghai"></el-option>
            <el-option label="支付宝" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>

  <el-table :data="users" style="width: 100%">
    <el-table-column prop="ID" label="ID" width="180"></el-table-column>
    <el-table-column prop="Username" label="姓名" width="180"></el-table-column>
    <el-table-column prop="email" label="邮箱"></el-table-column>
  </el-table>
</el-main>
</el-container>
</template>

<script>
export default  {
    data() {
        return {
            form:{},  
        }
    }
}

</script>