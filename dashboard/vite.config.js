import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/universe-reborn/dashboard/',
  server: { port: 5174 },
})
