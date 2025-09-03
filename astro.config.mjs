import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind()],
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
