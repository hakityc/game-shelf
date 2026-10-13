import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 用相对路径，部署到 GitHub Pages 的子路径也能正常加载
export default defineConfig({
  plugins: [react()],
  base: './',
});
