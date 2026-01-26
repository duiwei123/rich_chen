// src/utils/http.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// export const baseHttpUrl = 'http://115.190.91.146:8080'
export const baseHttpUrl = 'http://localhost:8080'

// 创建 Axios 实例
const http = axios.create({
  baseURL: baseHttpUrl, // 你的 API 地址
  // baseURL: 'http://huoshan:8080', // 你的 API 地址
  timeout: 60000, // 请求超时时间
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在请求发送之前做一些处理，比如添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 对响应数据做一些处理
    return response.data;
  },
  (error) => {
    // 对响应错误做一些处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未认证，跳转到登录页面
          ElMessage.error('未认证，请先登录');
          router.push('/login');
          break;
        case 403:
          // 无权限
          ElMessage.error('无权限访问');
          break;
        case 404:
          // 资源不存在
          ElMessage.error('资源不存在');
          break;
        case 500:
          // 服务器错误
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error('请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default http;