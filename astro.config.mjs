import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import socketIntegration from './socket/socket';

export default defineConfig({
  server: {
    port: 4322,
    host: true,
    allowedHosts: ['clinicalapp.controlstock.online'],
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind(), socketIntegration()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // vite: {
  //   server: {
  //     proxy: {
  //       '/socket.io': {
  //         target: 'http://localhost:5000',
  //         ws: true,
  //       },
  //     },
  //   },
  // },
});
