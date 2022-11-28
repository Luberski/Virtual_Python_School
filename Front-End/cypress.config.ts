import { defineConfig } from 'cypress';
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
    videoUploadOnPasses: false,
    video: false,
    defaultCommandTimeout: 50000,
    setupNodeEvents(on, config) {
      config.env = {
        ...process.env,
        ...config.env,
      };
      return config;
    },
  },
});
