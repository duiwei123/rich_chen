import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/sse': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/testSSE': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/houseAvgPrice': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/houseMinPrice': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/houseTargets': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/saveHouse': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
