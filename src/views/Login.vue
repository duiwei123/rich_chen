<template>
  <div class="login-root">
    <div class="login-glass">
      <!-- 左侧表单 -->
      <div class="form-side">
        <div class="logo">
          <h1>PhotoShare</h1>
          <p>分享生活中的美好瞬间</p>
        </div>

        <el-form
          :model="loginForm"
          :rules="rules"
          ref="loginFormRef"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              @keyup.enter="handleLogin"
            >
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><el-icon><Lock /></el-icon></template>
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

        <div class="options">
          <a href="#" class="link">忘记密码？</a>
        </div>
      </div>

      <!-- 右侧欢迎 -->
      <div class="welcome-side">
        <div class="welcome-content">
          <h2>探索无限可能</h2>
          <p>加入我们，分享您的精彩瞬间</p>
          <el-button plain class="reg-btn">立即注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* =============== 以下逻辑完全不变 =============== */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const loginForm = reactive({ username: '', password: '' })
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码至少6个字符', trigger: 'blur' }
  ]
})
const loading = ref(false)
const loginFormRef = ref(null)

const handleLogin = () => {
  loginFormRef.value.validate(async valid => {
    if (!valid) return ElMessage.warning('请完善登录信息')
    loading.value = true
    try {
      const res = await http.post('/login', loginForm)
      if (res.code === 200) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('name', res.name)
        localStorage.setItem('headPhoto', res.headImg)
        ElMessage.success('登录成功，正在跳转...')
        setTimeout(() => (window.location.href = '/'), 700)
      } else {
        ElMessage.error(res.message || '用户名或密码错误')
      }
    } catch (e) {
      ElMessage.error('网络连接失败，请稍后重试')
      console.error(e)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  if (localStorage.getItem('rememberMe') === 'true') {
    loginForm.username = localStorage.getItem('username') || ''
    loginForm.password = localStorage.getItem('password') || ''
  }
})
</script>

<style scoped>

/* **************** 玻璃风统一变量 **************** */
:root{
  --glass-bg:rgba(255,255,255,.45);
  --glass-border:rgba(255,255,255,.35);
  --glass-shadow:0 8px 32px rgba(31,38,135,.15);
  --active:#409EFF;
}

/* **************** 整体舞台 **************** */
.login-root{
  min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);
  padding:20px;
}

/* 玻璃面板 */
.login-glass{
  width:900px;max-width:90%;
  display:flex;border-radius:20px;
  background:var(--glass-bg);
  backdrop-filter:blur(12px);
  box-shadow:var(--glass-shadow);
  border:1px solid var(--glass-border);
  overflow:hidden;
}

/* 左侧表单 */
.form-side{
  flex:1;padding:48px 56px;
  display:flex;flex-direction:column;justify-content:center;
}
.logo{margin-bottom:32px;text-align:center}
.logo h1{font-size:28px;color:var(--active);margin:0 0 8px}
.logo p{font-size:14px;color:#606266}

.login-form .el-form-item{margin-bottom:20px}
.login-btn{width:100%;height:44px;font-size:16px;border-radius:8px}
.options{text-align:right;font-size:13px}
.link{color:var(--active);text-decoration:none}
.link:hover{text-decoration:underline}

/* 右侧欢迎 */
.welcome-side{
  flex:1;
  background:linear-gradient(135deg,var(--active) 0%,#7cb305 100%);
  display:flex;align-items:center;justify-content:center;
  position:relative;
}
.welcome-content{color:#fff;text-align:center;padding:40px}
.welcome-content h2{font-size:32px;font-weight:600;margin:0 0 12px}
.welcome-content p{font-size:16px;margin:0 0 32px;opacity:.9}
.reg-btn{padding:10px 32px;font-size:16px;border-color:#fff;color:#fff}
.reg-btn:hover{background:#fff;color:var(--active)}

/* **************** 响应式 **************** */
@media(max-width:768px){
  .login-glass{flex-direction:column}
  .form-side{padding:36px 24px}
  .welcome-side{padding:40px 24px}
}


</style>