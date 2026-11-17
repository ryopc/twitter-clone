<template>
  <div class="max-w-3xl mx-auto py-12 px-6 sm:px-8 lg:px-12 relative z-10">
    <nav class="flex items-center gap-4 mb-12">
      <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors font-medium">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1">ホームに戻る</span>
      </NuxtLink>
    </nav>

    <div class="section-header mb-10">
      <h2>トレンド</h2>
    </div>

    <div v-if="trends.isLoading" class="flex justify-center py-20">
      <USpinner size="lg" class="text-brand" />
    </div>

    <div v-else-if="trends.trends.length === 0" class="text-center py-24 text-text-muted">
      トレンドがまだありません。
    </div>

    <div v-else class="space-y-5">
      <div
        v-for="(trend, index) in trends.trends"
        :key="trend.id"
        class="card-glass p-6 hover:shadow-xl transition-all group"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black uppercase tracking-widest"
              :class="index === 0 ? 'bg-brand text-white shadow-lg shadow-brand/40' : index === 1 ? 'bg-accent text-white shadow-lg shadow-accent/40' : 'bg-surface/50 text-text-muted'"
            >
              {{ index + 1 }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-text">#{{ trend.tag }}</h3>
              <p class="text-sm text-text-muted">{{ trend.tweetCount.toLocaleString() }} 件のポスト</p>
            </div>
          </div>
          <NuxtLink
            :to="`/search?q=%23${trend.tag}`"
            class="text-brand font-medium hover:underline transition-colors text-sm"
          >
            詳細を見る
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const trends = useState('trends', () => ({
  trends: [] as any[],
  isLoading: false,
}))

const fetchTrends = async () => {
  trends.value.isLoading = true
  try {
    const res = await $fetch<{ trends: any[] }>('/api/trends')
    trends.value.trends = res.trends || []
  } catch (e) {
    console.error(e)
  } finally {
    trends.value.isLoading = false
  }
}

fetchTrends()
</script>
