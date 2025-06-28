import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/Sky-Journey-for-Two/' : '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 确保资源路径正确
    assetsDir: 'assets'
  }
})
