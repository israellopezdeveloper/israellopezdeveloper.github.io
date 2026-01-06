import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltexPreprocessor from './sveltex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.sveltex'],

  preprocess: [vitePreprocess(), sveltexPreprocessor],

  kit: { adapter: adapter() }
};

export default config;
