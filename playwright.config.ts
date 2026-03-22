import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3020',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && node scripts/smoke-server.mjs',
    url: 'http://127.0.0.1:3020',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
