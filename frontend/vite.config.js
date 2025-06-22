//vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/static': 'http://localhost:8001', // ✅ FastAPI 정적 파일 서버로 프록시
    }
  }
})

