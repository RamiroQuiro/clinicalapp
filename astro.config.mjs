import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind()],
  outDir: './src',
  output: 'server',
  adapter: node({
    mode: 'standalone',

  }),
 
});
