import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 假设你的项目源代码在 src 目录下，定义 @ 指向 src 目录
      '@': path.resolve(__dirname, './src'), 
      // 定义 @utils 指向 src/utils 目录
      '@utils': path.resolve(__dirname, './src/utils'), 
    },
  },
});