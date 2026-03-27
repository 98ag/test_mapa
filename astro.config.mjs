// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react({
    experimentalReactChildren: true, 
    experimentalDisableStreaming: true,
  })],

  vite: {
    plugins: [tailwindcss()]
  },

  site: 'https://98ag.github.io',
  base: '/test_mapa',
  trailingSlash: 'always',
  output: 'static' 
});