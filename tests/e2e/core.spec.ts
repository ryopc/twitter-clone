import { test, expect } from '@playwright/test'

test.describe('Skybird - Core E2E', () => {
  test('ホームページが正しく表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Skybird').first()).toBeVisible()
    await expect(page.locator('text=独自の声を、')).toBeVisible()
    await expect(page.locator('text=アカウント作成')).toBeVisible()
  })

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h2:has-text("ようこそ戻ってきました")')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('新規登録ページが表示される', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h2:has-text("アカウントを作成")')).toBeVisible()
    await expect(page.locator('input[placeholder="藍井 カイ"]')).toBeVisible()
  })

  test('検索ページが表示される', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('input[placeholder="ユーザーや投稿を検索..."]')).toBeVisible()
  })

  test('通知ページが表示される', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('h2:has-text("通知")')).toBeVisible()
  })

  test('メッセージページが表示される', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.locator('h2:has-text("メッセージ")')).toBeVisible()
  })

  test('トレンドページが表示される', async ({ page }) => {
    await page.goto('/trends')
    await expect(page.locator('h2:has-text("トレンド")')).toBeVisible()
  })

  test('プロフィールページが表示される', async ({ page }) => {
    await page.goto('/@kai_dev')
    await expect(page.locator('h1:has-text("藍井 カイ")')).toBeVisible()
    await expect(page.locator('text=@kai_dev').first()).toBeVisible()
  })
})
