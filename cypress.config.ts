import { defineConfig } from 'cypress';
import customViteConfig from './vite.config';

export default defineConfig({
    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
            viteConfig: customViteConfig,
        },
    },

    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
