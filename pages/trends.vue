<template>
  <div class="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-brand">
        <div class="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-text">
          <span class="text-xs font-bold">S</span>
        </div>
        <span>Skybird</span>
      </NuxtLink>

      <div class="flex items-center gap-4">
        <template v-if="userStore.user">
          <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors">ホーム</NuxtLink>
          <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-brand hover:underline font-medium">ログイン</NuxtLink>
        </template>
      </div>
    </nav>

    <h2 class="text-2xl font-bold text-text mb-6">トレンド</h2>

    <div v-if="trendStore.isLoading" class="flex justify-center py-12">
      <USpinner size="lg" />
    </div>

    <div v-else-if="trendStore.trends.length === 0" class="text-center py-12 text-text-muted">
      トレンドがまだありません。
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(trend, index) in trendStore.trends"
        :key="trend.id"
        class="UCard p-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-brand bg-brand/10"
          >
            {{ index + 1 }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-text">#{{ trend.tag }}</h3>
            <p class="text-sm text-text-muted">{{ trend.tweetCount.toLocaleString() }} 件のポスト</p>
          </div>
        </div>
        <NuxtLink
          :to="`/search?q=%23${trend.tag}`"
          class="text-brand hover:underline font-medium text-sm"
        >
          詳細を見る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const trendStore = useState('trends', () => ({
  trends: [] as any[],
  isLoading: false,
}))

const fetchTrends = async () => {
  trendStore.value.isLoading = true
  try {
    const res = await fetch('/api/trends')
    if (!res.ok) throw new Error('トレンドの取得に失敗しました')
    const data = await res.json()
    trendStore.value.trends = data.trends || []
  } catch (e) {
    console.error(e)
  } finally {
    trendStore.value.isLoading = false
  }
}

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}

fetchTrends()
</script>
