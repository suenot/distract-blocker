import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://distract-blocker.app',
  trailingSlash: 'never',
  output: 'static',
  integrations: [tailwind()],
});
