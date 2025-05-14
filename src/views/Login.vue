<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧登录表单 -->
      <div class="login-left">
        <div class="login-logo">
          <h1>PhotoShare</h1>
          <p>分享生活中的美好瞬间</p>
        </div>
        
        <el-card class="login-card">
          <h3 class="card-title">欢迎回来</h3>
          
          <el-form
            :model="loginForm"
            :rules="rules"
            ref="loginFormRef"
            label-width="100px"
            class="login-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                @keyup.enter.native="handleLogin"
              >
                <template #prefix>
                  <i class="el-icon-user"></i>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input
                type="password"
                v-model="loginForm.password"
                placeholder="请输入密码"
                @keyup.enter.native="handleLogin"
              >
                <template #prefix>
                  <i class="el-icon-lock"></i>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                @click="handleLogin"
                :loading="loading"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-options">
            <span class="remember-me">
              <!-- <el-checkbox v-model="rememberMe">记住密码</el-checkbox> -->
            </span>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>
          
          <!-- <div class="social-login">
            <p>其他登录方式</p>
            <div class="social-icons">
              <el-button circle icon="el-icon-weixin"></el-button>
              <el-button circle icon="el-icon-qq"></el-button>
              <el-button circle icon="el-icon-weibo"></el-button>
            </div>
          </div> -->
        </el-card>
      </div>
      
      <!-- 右侧图片区域 -->
      <div class="login-right">
        <div class="image-content">
          <h2>探索无限可能</h2>
          <p>加入我们，分享您的精彩瞬间</p>
          <el-button type="primary" plain class="register-btn">立即注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import http from "../utils/http";

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码至少6个字符', trigger: 'blur' }
  ]
});

// 登录状态
const loading = ref(false);
const rememberMe = ref(false);
const loginFormRef = ref(null);

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      try {
        const response = await http.post('/login', loginForm);
        console.log("response.code"+response.code)
        if (response.code === 200) {
          // 登录成功
          localStorage.setItem('token', response.token);
          localStorage.setItem('name', response.name);
          localStorage.setItem('headPhoto', response.headImg);
          
          ElMessage.success('登录成功，正在跳转...');
          
          // 延迟跳转，给用户提示时间
          setTimeout(() => {
            window.location.href = '/';
          }, 700);
        } else {
          // 登录失败
          ElMessage.error(response.message || '用户名或密码错误');
        }
      } catch (error) {
        // 网络错误
        ElMessage.error('网络连接失败，请稍后重试');
        console.error(error);
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请完善登录信息');
      return false;
    }
  });
};

// 页面加载时检查是否记住密码
onMounted(() => {
  if (localStorage.getItem('rememberMe') === 'true') {
    loginForm.username = localStorage.getItem('username') || '';
    loginForm.password = localStorage.getItem('password') || '';
    rememberMe.value = true;
  }
});
</script>

<style scoped>
/* 整体容器 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-wrapper {
  display: flex;
  width: 900px;
  height: 550px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 左侧登录区域 */
.login-left {
  flex: 1;
  padding: 40px;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.login-logo {
  margin-bottom: 30px;
  text-align: center;
}

.login-logo h1 {
  color: #409eff;
  font-size: 28px;
  margin-bottom: 10px;
}

.login-logo p {
  color: #606266;
  font-size: 14px;
}

.login-card {
  flex: 1;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
}

.remember-me {
  color: #606266;
}

.forgot-password {
  color: #409eff;
  cursor: pointer;
}

.social-login {
  margin-top: 30px;
  text-align: center;
}

.social-login p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-icons .el-button {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  background-color: #f5f7fa;
  color: #606266;
  transition: all 0.3s;
}

.social-icons .el-button:hover {
  background-color: #409eff;
  color: white;
}

/* 右侧图片区域 */
.login-right {
  flex: 1;
  background: linear-gradient(135deg, #409eff 0%, #7cb305 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-content {
  text-align: center;
  color: white;
  padding: 40px;
  z-index: 10;
}

.image-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 20px;
}

.image-content p {
  font-size: 16px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.register-btn {
  padding: 10px 30px;
  font-size: 16px;
  color: white;
  border-color: white;
  transition: all 0.3s;
}

.register-btn:hover {
  background-color: white;
  color: #409eff;
}

/* 背景装饰 */
.login-right::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.login-right::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>