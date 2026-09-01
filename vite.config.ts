import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { apiMiddleware } from './server/apiRouter.mjs';

const apiServerPlugin = (): Plugin => ({
  name: 'api-server-plugin',
  configureServer(server) {
    server.middlewares.use(apiMiddleware);
  },
  configurePreviewServer(server) {
    server.middlewares.use(apiMiddleware);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

