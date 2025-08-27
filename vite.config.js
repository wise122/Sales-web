import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "https://dev.dahliyatrans.com", // alamat backend
        changeOrigin: true,
        secure: false, // kalau pakai self-signed SSL biar gak error
      },
    },
  },
})
