import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. SERVER CONFIG (Fixes Local "Vite not reloading" issue)
  server: {
    port: 5173,
    strictPort: true,
    host: true,         // Expose to network (helps with docker/hackathon wifi)
    watch: {
      usePolling: true, // <--- FORCE POLLING: The specific fix for your issue
      interval: 100,    // Poll every 100ms
    },
    hmr: {
      clientPort: 5173, // Forces browser to talk to the right port
    },
  },

  // 2. BUILD CONFIG (Fixes Vercel/Deployment Cache issue)
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].${Date.now()}.js`,
        chunkFileNames: `assets/[name].[hash].${Date.now()}.js`,
        assetFileNames: `assets/[name].[hash].${Date.now()}.[ext]`
      }
    }
  }
})