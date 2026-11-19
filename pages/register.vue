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
          <h2 class="text-2xl font-bold text-text">アカウントを作成</h2>
          <p class="text-text-muted mt-2">新しい Skybird アカウントを登録します。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text mb-1">表示名</label>
            <UInput
              v-model="displayName"
              placeholder="藍井 カイ"
              class="input-field"
              :class="[
                errors.displayName ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' : ''
              ]"
              required
            />
            <p v-if="errors.displayName" class="text-xs text-destructive mt-1">{{ errors.displayName }}</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text mb-1">ユーザー名</label>
            <UInput
              v-model="username"
              placeholder="kai_dev"
              class="input-field"
              :class="[
                errors.username ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' : ''
              ]"
              required
            />
            <p v-if="errors.username" class="text-xs text-destructive mt-1">{{ errors.username }}</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text mb-1">メールアドレス</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="input-field"
              :class="[
                errors.email ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' : ''
              ]"
              required
            />
            <p v-if="errors.email" class="text-xs text-destructive mt-1">{{ errors.email }}</p>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text mb-1">パスワード</label>
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="input-field"
              :class="[
                errors.password ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' : ''
              ]"
              required
            />
            <p v-if="errors.password" class="text-xs text-destructive mt-1">{{ errors.password }}</p>
          </div>
          <button
            type="submit"
            class="w-full btn-brand text-base py-4 touch-target"
            :disabled="userStore.isLoading || isSubmitting"
          >
            {{ isSubmitting ? '処理中...' : 'アカウントを作成' }}
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-text-muted">
          すでにアカウントをお持ちですか？
          <NuxtLink
            to="/login"
            class="text-brand font-medium hover:underline transition-colors touch-target"
          >
            ログイン
          </NuxtLink>
        </p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useAppToast } from '~/composables/useAppToast'
import { reactive, ref } from 'vue'

const userStore = useUserStore()
const { error: showError, success } = useAppToast()

const displayName = useState('auth-displayName', () => '')
const username = useState('auth-username', () => '')
const email = useState('auth-email', () => '')
const password = useState('auth-password', () => '')
const errors = reactive({
  displayName: null as string | null,
  username: null as string | null,
  email: null as string | null,
  password: null as string | null,
})
const isSubmitting = ref(false)

const validate = (): boolean => {
  errors.displayName = null
  errors.username = null
  errors.email = null
  errors.password = null

  let valid = true

  if (!displayName.value.trim()) {
    errors.displayName = '表示名を入力してください'
    valid = false
  }
  if (!username.value.trim()) {
    errors.username = 'ユーザー名を入力してください'
    valid = false
  }
  if (!email.value.trim()) {
    errors.email = 'メールアドレスを入力してください'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = '有効なメールアドレスを入力してください'
    valid = false
  }
  if (!password.value) {
    errors.password = 'パスワードを入力してください'
    valid = false
  } else if (password.value.length < 6) {
    errors.password = 'パスワードは6文字以上で入力してください'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    await userStore.register({ displayName, username, email, password })
    success('アカウントを作成しました')
    await navigateTo('/')
  } catch (e: any) {
    const message = e?.message || '処理に失敗しました'
    showError('登録エラー', message)
    if (message?.includes('username') || message?.includes('ユーザー名')) {
      errors.username = message
    } else if (message?.includes('email') || message?.includes('メール')) {
      errors.email = message
    } else if (message?.includes('password') || message?.includes('パスワード')) {
      errors.password = message
    } else if (message?.includes('displayName') || message?.includes('表示名')) {
      errors.displayName = message
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>