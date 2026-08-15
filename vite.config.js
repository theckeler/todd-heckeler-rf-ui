import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built dist/index.html works opened directly via
// file:// (RainFocus's "unzip and load the build file" requirement),
// not just when served from a domain root.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
