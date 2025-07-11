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
      '/static': 'http://128.134.233.158:8001',
      '/upload': 'http://128.134.233.158:8001',
      'api' : 'http://128.134.233.158:8001',
      'dlp' :'http://128.134.233.158:8001' // ✅ FastAPI 정적 파일 서버로 프록시
    }
  }
})

