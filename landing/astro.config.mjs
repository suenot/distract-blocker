import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://distract-blocker.marketmaker.cc',
  trailingSlash: 'never',
  output: 'static',
  integrations: [tailwind()],
});
