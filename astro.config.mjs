// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { remarkMermaid } from 'astro-mermaid-renderer/remark-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://anthrotech.dev',
  integrations: [mdx(), react()],
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
