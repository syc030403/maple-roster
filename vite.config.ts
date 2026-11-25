import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages는 /<저장소 이름>/ 아래에서 서비스되므로 빌드할 때만 base를 바꾼다 (V25)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/maple-roster/' : '/',
  plugins: [react()],
}))
