import { defineConfig } from 'cypress';
import { createRequire } from 'module';
import viteConfig from './vite.config';

const require = createRequire(import.meta.url);

// Use this to handle React 19 compatibility with Cypress React 18
export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        ...viteConfig,
        // Force Cypress to use React 18 compatible aliases
        resolve: {
          alias: {
            'react': require.resolve('react'),
            'react-dom': require.resolve('react-dom'),
            '@types/react': require.resolve('@types/react'),
            '@types/react-dom': require.resolve('@types/react-dom'),
          },
        },
      },
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});