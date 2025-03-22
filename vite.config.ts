import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // Fix para carregamento de ícones no modo dev
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    host: 'localhost', // Alterado para localhost
    port: 3000,        // Porta padrão para desenvolvimento
    proxy: {
      '/api': {
        target: 'http://localhost:2901', // Alterado para localhost
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
