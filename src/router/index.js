import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import UserManagement from '../views/UserManagement.vue';
import Order from '../views/Order.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }, // 需要认证
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true }, // 需要认证
  },
  {
    path: '/order',
    name: 'Order',
    component: Order,
    meta: { requiresAuth: true }, // 需要认证
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
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

export default router;