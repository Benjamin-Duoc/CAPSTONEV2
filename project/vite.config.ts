import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    server: {
      port: 3000,
      host: true,

      // Proxy only in development mode
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
        '/backendcipress/media': {
          target: env.VITE_MEDIA_URL || 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/backendcipress\/media/, '/media')
        }
      } : {}
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    },

    optimizeDeps: {
      include: ['react', 'react-dom']
    },

    // Define env variables that should be available in the client
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_MEDIA_URL': JSON.stringify(env.VITE_MEDIA_URL),
    }
  }
})
