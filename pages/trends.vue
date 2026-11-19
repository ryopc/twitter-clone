<template>
  <div class="trends-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6 px-4 sm:px-6">
      <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors touch-target">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
      </NuxtLink>
    </div>

    <div class="section-header mb-8 px-4 sm:px-6">
      <h2>トレンド</h2>
    </div>

    <!-- Category filter -->
    <div class="flex gap-2 overflow-x-auto pb-4 mb-6 px-4 sm:px-6 scrollbar-hide">
      <button
        v-for="category in categories"
        :key="category.key"
        @click="selectedCategory = category.key"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all touch-target whitespace-nowrap"
        :class="[
          selectedCategory === category.key
            ? 'bg-brand text-white shadow-lg shadow-brand/40'
            : 'bg-surface-card border border-surface-border text-text-muted hover:text-text hover:border-brand/40'
        ]"
      >
        {{ category.label }}
      </button>
    </div>

    <div v-if="trends.isLoading" class="flex justify-center py-20">
      <div class="skeleton-text w-48 mb-2" />
      <div class="skeleton-text w-64" />
    </div>

    <div v-else-if="filteredTrends.length === 0" class="text-center py-24 text-text-muted fade-in px-4 sm:px-6">
      トレンドがまだありません。
    </div>

    <div v-else class="space-y-4 fade-in px-4 sm:px-6">
      <div
        v-for="(trend, index) in filteredTrends"
        :key="trend.id"
        class="card-glass p-6 hover:border-brand/40 transition-colors group hover-card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black uppercase tracking-widest"
              :class="
                index === 0
                  ? 'bg-brand text-white shadow-lg shadow-brand/40'
                  : index === 1
                  ? 'bg-accent text-white shadow-lg shadow-accent/40'
                  : 'bg-surface-card border border-surface-border text-text-muted'
              "
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
            class="text-brand font-medium hover:text-brand-glow transition-colors text-sm touch-target"
          >
            詳細を見る
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trend } from '~/types'

const trends = useState('trends', () => ({
  trends: [] as Trend[],
  isLoading: false,
}))

const selectedCategory = useState('selected-trend-category', () => 'all')

const categories = [
  { key: 'all', label: 'すべて' },
  { key: 'tech', label: 'テクノロジ' },
  { key: 'entertainment', label: 'エンタメ' },
  { key: 'sports', label: 'スポーツ' },
  { key: 'news', label: 'ニュース' },
  { key: 'gaming', label: 'ゲーム' },
]

const filteredTrends = computed(() => {
  if (selectedCategory.value === 'all') return trends.value.trends
  return trends.value.trends.filter((t: Trend) => t.category === selectedCategory.value)
})

const fetchTrends = async () => {
  trends.value.isLoading = true
  try {
    const res = await $fetch<{ trends: Trend[] }>('/api/trends')
    const categoryList: ('tech' | 'entertainment' | 'sports' | 'news' | 'gaming')[] = [
      'tech', 'entertainment', 'sports', 'news', 'gaming'
    ]
    trends.value.trends = (res.trends || []).map((t, i) => ({
      ...t,
      category: categoryList[i % categoryList.length]
    }))
  } catch (e) {
    console.error(e)
  } finally {
    trends.value.isLoading = false
  }
}

fetchTrends()
</script>