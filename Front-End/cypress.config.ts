import { defineConfig } from 'cypress';

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
    videoUploadOnPasses: false,
    video: false,
    defaultCommandTimeout: 50000,
  },
});
