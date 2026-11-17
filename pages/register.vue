<template>
  <div class="w-full">
    <UCard class="mx-auto mt-10">
      <UCardHeader class="text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-text">
          <UIcon name="heroicons:user-plus" size="24" />
        </div>
        <h1 class="text-2xl font-bold text-text">アカウントを作成</h1>
        <p class="mt-2 text-text-muted">新しい Birdie アカウントを登録します。</p>
      </UCardHeader>

      <UCardContent class="grid gap-4">
        <form @submit.prevent="handleRegister" class="grid gap-4">
          <UInput label="表示名" v-model="displayName" placeholder="藍井 カイ" required />
          <UInput
            label="ユーザー名"
            v-model="username"
            placeholder="kai_dev"
            required
          />
          <UInput label="メールアドレス" type="email" v-model="email" placeholder="you@example.com" required />
          <UInput label="パスワード" type="password" v-model="password" placeholder="••••••••" required />
          <UButton type="submit" label="登録する" color="brand" full-width class="!py-3" :loading="userStore.isLoading" />
        </form>
      </UCardContent>

      <UCardFooter class="text-center">
        <p class="text-sm text-text-muted">
          すでにアカウントをお持ちですか？
          <NuxtLink to="/login" class="text-brand hover:underline font-medium">ログイン</NuxtLink>
        </p>
      </UCardFooter>
    </UCard>
  </div>
</template>

<script setup>
const userStore = useUserStore()

const displayName = useState('reg-displayName', () => '')
const username = useState('reg-username', () => '')
const email = useState('reg-email', () => '')
const password = useState('reg-password', () => '')

const handleRegister = async () => {
  try {
    await userStore.register({ displayName, username, email, password })
    await navigateTo('/')
  } catch (e) {
    alert(e?.message || '登録に失敗しました')
  }
}
</script>
