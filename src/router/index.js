import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
// import UserManagement from '../views/UserManagement.vue';
import Order from '../views/Order.vue';
import Login from '../views/Login.vue';
import Photo from '../views/Photo.vue';
import MessageList from '../views/Message.vue'
import { pa } from 'element-plus/es/locales.mjs';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }, // 需要认证
  },
  // {
  //   path: '/user-management',
  //   name: 'UserManagement',
  //   component: UserManagement,
  //   meta: { requiresAuth: true }, // 需要认证
  // },
  {
    path: '/order',
    name: 'Order',
    component: Order,
    meta: { requiresAuth: true }, // 需要认证
  },
  {
    path: '/photo',
    name: 'Photo',
    component: Photo,
    meta: { requiresAuth: true }, // 需要认证
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/messageList',
    name: 'MessageList',
    component: MessageList
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const appContainer = document.querySelector('.app-container');
  const realMain = document.querySelector('.realMain');
  if (to.name === 'Login') {
    if (appContainer) {
      appContainer.style.margin = '0';
      realMain.style.margin = '0';
      appContainer.style.padding = '0';
    }
  } else {
    if (appContainer) {
      appContainer.style.margin = '15px 15px 15px 0'; // 恢复默认值，这里可以根据实际情况调整
      realMain.style.margin = '0px 10px 0 10px'
    }
  }
  next();
});

export default router;