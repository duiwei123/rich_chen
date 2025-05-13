<template>
  <div class="ssssss">
    <el-row>
      <el-col :span="12" class="loginLeft">
        <div class="grid-content ep-bg-purple" />
        <el-form
          :model="loginForm"
          :rules="rules"
          ref="loginForm"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <!-- 监听用户名输入框的 keyup.enter 事件 -->
            <el-input
              v-model="loginForm.username"
              @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <!-- 监听密码输入框的 keyup.enter 事件 -->
            <el-input
              type="password"
              v-model="loginForm.password"
              @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">登录</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12" class="LoginRight" style="background-color: pink;">
        <div class="grid-content ep-bg-purple-light" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import http from "../utils/http";

export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    onSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // 模拟登录请求
          http.post("/login", this.loginForm).then((response) => {
            // 假设登录成功，返回 token
            const token = response.token;
            localStorage.setItem("token", token);
            localStorage.setItem("name", response.name);
            localStorage.setItem("headPhoto", response.headImg);
            this.$router.push("/");
          });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style scoped>
.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
}
.marginNone {
  margin: 0 !important;
}

.ssssss{
  margin: 8%;
  padding: 2%;
  border: 1px solid #409eff;
}
</style>