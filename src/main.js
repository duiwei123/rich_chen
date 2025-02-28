import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'; // 引入中文语言包
import 'element-plus/dist/index.css';
import router from './router';
import * as echarts from 'echarts';

const app = createApp(App);

// 使用 Element Plus 并设置语言为中文
app.use(ElementPlus, {
  locale: zhCn, // 配置中文语言包
});

app.use(router);
app.config.globalProperties.$echarts = echarts;

app.mount('#app');