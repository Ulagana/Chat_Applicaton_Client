import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            }
        }
    },
    define: {
        // Fix for simple-peer: polyfill global variable
        global: 'globalThis',
    },
    resolve: {
        alias: {
            // Polyfill Node.js modules for browser compatibility
            events: 'events',
            util: 'util',
        }
    },
    optimizeDeps: {
        include: ['events', 'util']
    }
})
