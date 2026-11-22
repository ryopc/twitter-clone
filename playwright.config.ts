import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // データ層が JSON ファイルの逐次 I/O であるため、並列実行で
  // 読み書き競合（ファイル破損・更新喪失）が発生するのを避けて
  // 1 ワーカーで逐次実行する
  workers: 1,
  reporter: 'html',

  // テスト前にサーバーを起動
  webServer: {
    command: 'node .output/server/index.mjs',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
