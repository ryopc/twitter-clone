<template>
  <div class="w-full">
    <UCard class="mx-auto mt-10">
      <UCardHeader class="text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-text">
          <UIcon name="heroicons:shield-check" size="24" />
        </div>
        <h1 class="text-2xl font-bold text-text">Skybird へようこそ</h1>
        <p class="mt-2 text-text-muted">アカウントにログインして、会話を始めましょう。</p>
      </UCardHeader>

      <UCardContent class="grid gap-4">
        <form @submit.prevent="handleLogin" class="grid gap-4">
          <UInput
            label="メールアドレス"
            type="email"
            v-model="email"
            placeholder="you@example.com"
            required
          />
          <UInput
            label="パスワード"
            type="password"
            v-model="password"
            placeholder="••••••••"
            required
          />
          <UButton
            type="submit"
            label="ログイン"
            color="brand"
            full-width
            class="!py-3"
            :loading="userStore.isLoading"
          />
        </form>
      </UCardContent>

      <UCardFooter class="text-center">
        <p class="text-sm text-text-muted">
          アカウントをお持ちでないですか？
          <NuxtLink to="/register" class="text-brand hover:underline font-medium">新規登録</NuxtLink>
        </p>
      </UCardFooter>
    </UCard>
  </div>
</template>

<script setup>
const userStore = useUserStore()

const email = useState('login-email', () => '')
const password = useState('login-password', () => '')

const handleLogin = async () => {
  try {
    await userStore.login(email, password)
    await navigateTo('/')
  } catch (e) {
    alert(e?.message || 'ログインに失敗しました')
  }
}
</script>
