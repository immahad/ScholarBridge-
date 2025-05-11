import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Create a file for SPA routing
fs.writeFileSync('./public/_redirects', '/* /index.html 200')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Handle client-side routing
      '/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: () => '/index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), 'src')
    }
  }
})
