import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mandarin-handout-app/', // 確保部署到 GitHub Pages 的路徑正確
})
