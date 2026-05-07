import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { connectSSE, disconnectSSE } from '@/utils/sse'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/photo',
    name: 'Photo',
    component: () => import('@/views/Photo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messageList',
    name: 'MessageList',
    component: () => import('@/views/Message.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/markDownPage',
    name: 'MarkDownPage',
    component: () => import('@/views/markDowm/MarkDownPage.vue')
  },
  {
    path: '/markDownDetail/:id',
    name: 'MarkDownDetail',
    component: () => import('@/views/markDowm/MarkDownDetail.vue')
  },
  {
    path: '/markDownEdit',
    name: 'MarkDownEdit',
    component: () => import('@/views/markDowm/MarkDownEdit.vue')
  },
  {
    path: '/markDownEdit/:id',
    name: 'MarkDownEditId',
    component: () => import('@/views/markDowm/MarkDownEdit.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/News.vue')
  },
  {
    path: '/house',
    name: 'House',
    component: () => import('@/views/House.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: () => import('@/views/Accounting.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('@/views/Account.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/Record.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/views/Budget.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
let sseConnected = false

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 登录后连接 SSE
  if (token && !sseConnected) {
    connectSSE()
    sseConnected = true
  }

  // 退出登录时断开 SSE
  if (!token && sseConnected) {
    disconnectSSE()
    sseConnected = false
  }

  // 登录页样式处理
  const appContainer = document.querySelector('.app-root')
  if (appContainer) {
    if (to.name === 'Login') {
      (appContainer as HTMLElement).style.margin = '0'
    } else {
      (appContainer as HTMLElement).style.margin = ''
    }
  }

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
