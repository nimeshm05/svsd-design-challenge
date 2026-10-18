import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // While prototyping, never let the browser reuse an old copy of a file, so a refresh always shows the latest
  server: { headers: { 'Cache-Control': 'no-store' } },
})
