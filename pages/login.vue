<template>
  <div class="auth-page min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
    <!-- Decorative gradient blobs -->
    <div class="fixed top-[-20%] left-[-20%] w-[700px] h-[700px] rounded-full bg-brand/20 blur-[200px] -z-10"></div>
    <div class="fixed bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[200px] -z-10"></div>

    <!-- Auth card -->
    <div class="flex-1 flex items-center justify-center max-w-md w-full">
      <UCard class="w-full p-8 card-elevated relative z-10 fade-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/40">
            <UIcon name="heroicons:shield-check" size="32" class="text-white" />
          </div>
          <h2 class="text-2xl font-bold text-text">ようこそ戻ってきました</h2>
          <p class="text-text-muted mt-2">アカウントにログインして、会話を始めましょう。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
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
            ログイン
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-text-muted">
          アカウントをお持ちでないですか？
          <NuxtLink
            to="/register"
            class="text-brand font-medium hover:underline transition-colors"
          >
            新規登録
          </NuxtLink>
        </p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const email = useState('auth-email', () => '')
const password = useState('auth-password', () => '')

const handleSubmit = async () => {
  try {
    await userStore.login(email, password)
    await navigateTo('/')
  } catch (e) {
    alert(e?.message || '処理に失敗しました')
  }
}
</script>
