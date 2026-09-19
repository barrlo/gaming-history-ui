import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start',
    env: { BROWSER: 'none', VITE_ENABLE_MOCKS: 'false' },
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:5173',
  },
});
