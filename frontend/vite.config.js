import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'; // обязательно импортировать

export default defineConfig({
  plugins: [
    react(),
    svgr(), // <-- подключаем
  ],
  resolve: {
    alias: { '@': '/src' },
  },
});
