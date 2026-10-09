import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "http://localhost:5000/",
        changeOrigin: true,
      },
      '/socket.io': {
        target: "http://localhost:5000/",
        ws: true,
        changeOrigin: true,
      },
      '/MoviePosters': { target: "http://localhost:5000/", changeOrigin: true },
      '/MovieBanners': { target: "http://localhost:5000/", changeOrigin: true },
      '/MovieImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/CastsImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/CastImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/UserProfileImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/TheaterProfileImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/TheatersImages': { target: "http://localhost:5000/", changeOrigin: true },
      '/UploadsCertificates': { target: "http://localhost:5000/", changeOrigin: true },
      '/MessageFiles': { target: "http://localhost:5000/", changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['slick-carousel', 'react-datepicker', 'jspdf', 'jspdf-autotable'],
  },
  resolve: {
    alias: {
      'jspdf-autotable': 'jspdf-autotable'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "slick-carousel/slick/slick.css";
          @import "react-datepicker/dist/react-datepicker.css";
        `,
      },
    },
  },
})

