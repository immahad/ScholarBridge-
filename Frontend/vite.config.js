import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy /api requests to your backend server on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // secure: false, // Uncomment if your backend is not HTTPS and you encounter issues
        // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if backend routes don't include /api
      }
    }
  }
})
