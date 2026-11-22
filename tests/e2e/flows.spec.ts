import { test, expect } from '@playwright/test'

let regCount = 0

function uniqueId() {
  return `${Date.now()}_${regCount++}`
}

const baseURL = 'http://localhost:3000'

// UI で新規登録し、Pinia の認証状態を確立する。API 用のトークンも取得して返す。
async function registerAndLogin(page, idOverride = uniqueId()) {
  const displayName = `E2E ユーザー ${idOverride}`
  const username = `e2e_user_${idOverride}`
  const email = `e2e_${idOverride}@example.com`
  const password = 'Password123!'

  await page.goto('/register')
  await page.locator('input[placeholder="藍井 カイ"]').pressSequentially(displayName)
  await page.locator('input[placeholder="kai_dev"]').pressSequentially(username)
  await page.locator('input[placeholder="you@example.com"]').pressSequentially(email)
  await page.locator('input[placeholder="••••••••"]').pressSequentially(password)
  await page.getByRole('button', { name: 'アカウントを作成' }).click()
  await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 })
  await expect(page.locator('textarea[placeholder="いま何が起きていますか？"]')).toBeVisible({ timeout: 10000 })

  const loginRes = await page.request.post(`${baseURL}/api/auth/login`, {
    data: { email, password },
  })
  expect(loginRes.ok()).toBe(true)
  const { token } = await loginRes.json()
  expect(token).toBeTruthy()
  return { email, password, username, token }
}

test.describe('Skybird - Functional E2E flows', () => {
  test('登録・ログインフロー（パスワードはハッシュ化され平文ではない）', async ({ page }) => {
    const { email, password } = await registerAndLogin(page)
    await expect(page.locator('text=Skybird').first()).toBeVisible()
    const res = await page.request.post(`${baseURL}/api/auth/login`, {
      data: { email, password },
    })
    expect(res.ok()).toBe(true)
    const body = await res.json()
    expect(body.token).toBeTruthy()
  })

  test('テキストのみのポスト作成がタイムラインに表示される', async ({ page }) => {
    const { token } = await registerAndLogin(page)
    const content = `E2E テストポスト ${uniqueId()}`
    const res = await page.request.post(`${baseURL}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content, imageUrl: null },
    })
    expect(res.ok()).toBe(true)

    await page.goto('/')
    await expect(page.locator(`text=${content}`)).toBeVisible({ timeout: 10000 })
  })

  test('画像付きポスト作成で imageUrl が data: URL 形式で保存・表示される', async ({ page }) => {
    const { token } = await registerAndLogin(page)
    const content = `画像付きポスト ${uniqueId()}`
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const res = await page.request.post(`${baseURL}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content, imageUrl: dataUrl },
    })
    expect(res.ok()).toBe(true)

    await page.goto('/')
    await expect(page.locator(`text=${content}`)).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('.card-glass').filter({ hasText: content }).locator('img[src^="data:"]')
    ).toBeVisible({ timeout: 10000 })
  })

  test('いいね・リポストのトグルが動作する', async ({ page }) => {
    await registerAndLogin(page)
    const firstPost = page.locator('.card-glass').first()
    const likeButton = firstPost.locator('.post-action').first()
    await likeButton.click()
    await expect(likeButton).toHaveClass(/liked/, { timeout: 10000 })

    const repostButton = firstPost.locator('.post-action').nth(2)
    await repostButton.click()
    await expect(repostButton).toHaveClass(/active/, { timeout: 10000 })
  })

  test('フォロー/アンフォローとプロフィールのフォロー数表示', async ({ page }) => {
    await registerAndLogin(page)
    // 客側ナビゲーションでプロフィールへ（Pinia 認証状態を維持）
    await page.locator('a[href="/@kai_dev"]').first().click()
    await expect(page.locator('h1:has-text("藍井 カイ")')).toBeVisible({ timeout: 10000 })

    const followButton = page.getByRole('button', { name: 'フォロー' })
    await expect(followButton).toBeVisible()

    const beforeRes = await page.request.get(`${baseURL}/api/users/kai_dev`)
    const before = (await beforeRes.json()).followersCount

    await followButton.click()
    await expect(page.getByRole('button', { name: 'フォロー中' })).toBeVisible({ timeout: 10000 })

    const afterRes = await page.request.get(`${baseURL}/api/users/kai_dev`)
    const after = (await afterRes.json()).followersCount
    expect(after).toBe(before + 1)

    await page.getByRole('button', { name: 'フォロー中' }).click()
    await expect(page.getByRole('button', { name: 'フォロー' })).toBeVisible({ timeout: 10000 })
  })
})
