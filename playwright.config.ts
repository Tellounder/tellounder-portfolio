import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4187', channel: 'chrome', viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/preview-static.mjs --port 4187', url: 'http://127.0.0.1:4187', reuseExistingServer: false },
})
