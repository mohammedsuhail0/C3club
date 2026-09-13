import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
// @ts-expect-error Server backend handler without ambient d.ts
import { handleApiRequest } from './server/backendHandler.js';

function c3BackendPlugin(): Plugin {
  return {
    name: 'c3-backend-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequest(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequest(req, res, next);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), c3BackendPlugin()],
});
