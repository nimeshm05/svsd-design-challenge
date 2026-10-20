import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // While prototyping, never let the browser reuse an old copy of a file, so a refresh always shows the latest
  // fixed port so the galaxy (port 3000) knows where her page lives
  server: { port: 5174, strictPort: true, headers: { 'Cache-Control': 'no-store' } },
})
