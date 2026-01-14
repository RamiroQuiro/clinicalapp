import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    port: 4322,
    host: true,
    allowedHosts: ['clinicalapp.controlstock.online'],
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    server: {
      watch: {
        ignored: ['**/.wwebjs_auth/**'],
      },
    },
  },
});
