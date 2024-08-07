import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    strictPort: true,
    port: 8000,
    },
    resolve: {
      alias: {
        '@components': resolve(__dirname, 'src/components'),
      },
    }
})
