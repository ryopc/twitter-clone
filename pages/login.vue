<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const route = useRoute()
const isLogin = route.path === '/login'

const userStore = useUserStore()

const displayName = useState('auth-displayName', () => '')
const username = useState('auth-username', () => '')
const email = useState('auth-email', () => '')
const password = useState('auth-password', () => '')

const handleSubmit = async () => {
  try {
    if (isLogin) {
      await userStore.login(email, password)
    } else {
      await userStore.register({ displayName, username, email, password })
    }
    await navigateTo('/')
  } catch (e) {
    alert(e?.message || '処理に失敗しました')
  }
}
</script>

<template>
  <div class="text-center mb-10">
    <div class="w-16 h-16 rounded-3xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
      <UIcon name="heroicons:shield-check" size="32" class="text-white" />
    </div>
    <h2 class="text-2xl font-bold text-text">{{ isLogin ? 'ようこそ戻ってきました' : 'アカウントを作成' }}</h2>
    <p class="text-text-muted mt-2">{{ isLogin ? 'アカウントにログインして、会話を始めましょう。' : '新しい Skybird アカウントを登録します。' }}</p>
  </div>

  <form @submit.prevent="handleSubmit" class="space-y-5">
    <template v-if="!isLogin">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-text mb-1">表示名</label>
        <UInput
          v-model="displayName"
          placeholder="藍井 カイ"
          class="input-field"
          required
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-text mb-1">ユーザー名</label>
        <UInput
          v-model="username"
          placeholder="kai_dev"
          class="input-field"
          required
        />
      </div>
    </template>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-text mb-1">メールアドレス</label>
      <UInput
        v-model="email"
        type="email"
        placeholder="you@example.com"
        class="input-field"
        required
      />
    </div>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-text mb-1">パスワード</label>
      <UInput
        v-model="password"
        type="password"
        placeholder="••••••••"
        class="input-field"
        required
      />
    </div>
    <button
      type="submit"
      class="w-full btn-brand text-base py-4"
      :disabled="userStore.isLoading"
    >
      {{ isLogin ? 'ログイン' : '登録する' }}
    </button>
  </form>

  <p class="mt-8 text-center text-sm text-text-muted">
    {{ isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？' }}
    <NuxtLink
      :to="isLogin ? '/register' : '/login'"
      class="text-brand font-medium hover:underline transition-colors"
    >
      {{ isLogin ? '新規登録' : 'ログイン' }}
    </NuxtLink>
  </p>
</template>
