import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 確保編譯後的路徑是相對路徑，方便部署到 GitHub Pages
})
