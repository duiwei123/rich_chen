<template>
  <div class="login-page">
    <!-- Left Side - Animated Characters -->
    <div class="left-section">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span>RichApp</span>
      </div>

      <div class="characters-container">
        <AnimatedCharacters
          :isTyping="isTyping"
          :showPassword="showPassword"
          :passwordLength="form.password.length"
        />
      </div>

      <div class="footer-links">
        <a href="#">隐私政策</a>
        <a href="#">服务条款</a>
      </div>

      <!-- Decorative elements -->
      <div class="grid-bg"></div>
      <div class="blur-orb blur-1"></div>
      <div class="blur-orb blur-2"></div>
      <div class="blur-orb blur-3"></div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="right-section">
      <div class="form-container">
        <!-- Mobile Logo -->
        <div class="mobile-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span>RichApp</span>
        </div>

        <!-- Header -->
        <div class="form-header">
          <div class="welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1>欢迎回来</h1>
          <p>请输入您的账号信息登录</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                autocomplete="off"
                @focus="handleUsernameFocus"
                @blur="handleUsernameBlur"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper password-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                @focus="handlePasswordFocus"
                @blur="handlePasswordBlur"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkbox-custom"></span>
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <div v-if="error" class="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ error }}</span>
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="loading"
          >
            <span v-if="!loading">登录</span>
            <span v-else class="loading">
              <svg class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
              </svg>
              登录中...
            </span>
          </button>
        </form>

        <!-- Sign Up Link -->
        <div class="signup-section">
          <span>还没有账号？</span>
          <a href="#" @click.prevent="showRegister = true">立即注册</a>
        </div>
      </div>
    </div>

    <!-- Register Dialog -->
    <Transition name="fade">
      <div v-if="showRegister" class="dialog-overlay" @click.self="showRegister = false">
        <Transition name="slide-up">
          <div class="dialog">
            <div class="dialog-header">
              <h2>注册新账号</h2>
              <button class="close-btn" @click="showRegister = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleRegister" class="register-form">
              <div class="form-group">
                <label for="reg-username">用户名</label>
                <div class="input-wrapper">
                  <input
                    id="reg-username"
                    v-model="registerForm.username"
                    type="text"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="reg-name">昵称</label>
                <div class="input-wrapper">
                  <input
                    id="reg-name"
                    v-model="registerForm.name"
                    type="text"
                    placeholder="请输入昵称"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="reg-password">密码</label>
                <div class="input-wrapper">
                  <input
                    id="reg-password"
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入密码"
                  />
                </div>
              </div>
              <div class="dialog-actions">
                <button type="button" class="cancel-btn" @click="showRegister = false">取消</button>
                <button
                  type="submit"
                  class="register-btn"
                  :disabled="registerLoading"
                >
                  <span v-if="!registerLoading">注册</span>
                  <span v-else class="loading">
                    <svg class="spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
                    </svg>
                    注册中...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AnimatedCharacters from '@/components/AnimatedCharacters.vue'
import http from '@/utils/http'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 检查是否是因为登录过期跳转过来的
onMounted(() => {
  if (route.query.expired === '1') {
    ElMessage.warning('登录已过期，请重新登录')
    // 清除 URL 参数，避免刷新时重复提示
    router.replace({ path: '/login' })
  }
})

const loading = ref(false)
const registerLoading = ref(false)
const showRegister = ref(false)
const showPassword = ref(false)
const isTyping = ref(false)
const rememberMe = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  name: '',
  password: ''
})

const handleUsernameFocus = () => {
  isTyping.value = true
}

const handleUsernameBlur = () => {
  isTyping.value = false
}

const handlePasswordFocus = () => {
  isTyping.value = true
}

const handlePasswordBlur = () => {
  isTyping.value = false
}

const handleLogin = async () => {
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await http.post('/login', {
      username: form.username,
      password: form.password
    })
    const { token, name, headImg } = res.data
    userStore.setUser(token, name, headImg)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (err: any) {
    error.value = err.message || '用户名或密码错误'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.name || !registerForm.password) {
    ElMessage.error('请填写完整信息')
    return
  }

  registerLoading.value = true

  try {
    await http.post('/register', {
      username: registerForm.username,
      name: registerForm.name,
      password: registerForm.password
    })
    ElMessage.success('注册成功，请登录')
    showRegister.value = false
    form.username = registerForm.username
  } catch (err: any) {
    ElMessage.error(err.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
/* CSS Variables */
.login-page {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: rgba(99, 102, 241, 0.1);
  --bg-left-start: #1e1b4b;
  --bg-left-end: #312e81;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: #e5e7eb;
  --border-focus: #6366f1;
  --error: #ef4444;
  --error-bg: #fef2f2;
}

.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  overflow: hidden;
}

/* Left Section */
.left-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  background: linear-gradient(135deg, var(--bg-left-start) 0%, var(--bg-left-end) 100%);
  color: white;
  overflow: hidden;
}

.logo {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 22px;
  font-weight: 700;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.characters-container {
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 480px;
}

.footer-links {
  position: relative;
  z-index: 20;
  display: flex;
  gap: 32px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.footer-links a:hover {
  color: white;
  text-decoration: underline;
}

/* Decorative elements */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 30h60M30 0v60' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}

.blur-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 20s ease-in-out infinite;
}

.blur-1 {
  top: 10%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: rgba(99, 102, 241, 0.4);
  animation-delay: 0s;
}

.blur-2 {
  bottom: 20%;
  left: 10%;
  width: 250px;
  height: 250px;
  background: rgba(168, 85, 247, 0.3);
  animation-delay: -7s;
}

.blur-3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: rgba(236, 72, 153, 0.2);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Right Section */
.right-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fafbfc;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.mobile-logo {
  display: none;
}

/* Form Header */
.form-header {
  text-align: center;
  margin-bottom: 36px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
}

.welcome-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.form-header p {
  color: var(--text-secondary);
  font-size: 15px;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.2s;
}

.input-wrapper input {
  width: 100%;
  height: 52px;
  padding: 0 48px 0 48px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  background: white;
  color: var(--text-primary);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-light);
}

.input-wrapper input:focus + .input-icon,
.password-wrapper:focus-within .input-icon {
  color: var(--primary);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.password-wrapper input {
  padding-right: 52px;
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--text-secondary);
}

.eye-icon {
  width: 20px;
  height: 20px;
}

/* Form Options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}

.remember-me input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border);
  border-radius: 5px;
  transition: all 0.2s;
  position: relative;
}

.remember-me input:checked + .checkbox-custom {
  background: var(--primary);
  border-color: var(--primary);
}

.remember-me input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.remember-me:hover .checkbox-custom {
  border-color: var(--primary);
}

.forgot-password {
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: var(--primary-hover);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--error-bg);
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: var(--error);
  font-size: 14px;
}

.error-message svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Login Button */
.login-btn {
  width: 100%;
  height: 52px;
  margin-top: 8px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Sign Up Link */
.signup-section {
  text-align: center;
  margin-top: 32px;
  font-size: 15px;
  color: var(--text-secondary);
}

.signup-section a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
  transition: color 0.2s;
}

.signup-section a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.dialog-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: flex;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-secondary);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.register-form .input-wrapper input {
  height: 48px;
  padding: 0 16px;
}

.dialog-actions {
  display: flex;
  gap: 14px;
  margin-top: 12px;
}

.cancel-btn {
  flex: 1;
  height: 48px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: white;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: var(--text-muted);
}

.register-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.register-btn:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .left-section {
    display: none;
  }

  .right-section {
    padding: 24px;
  }

  .mobile-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 28px;
  }

  .mobile-logo .logo-icon {
    width: 40px;
    height: 40px;
  }

  .mobile-logo .logo-icon svg {
    width: 20px;
    height: 20px;
  }

  .form-header {
    margin-bottom: 28px;
  }

  .welcome-icon {
    width: 56px;
    height: 56px;
  }

  .welcome-icon svg {
    width: 28px;
    height: 28px;
  }
}
</style>
