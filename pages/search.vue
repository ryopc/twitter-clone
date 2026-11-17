<template>
  <div class="max-w-4xl mx-auto py-12 px-6 sm:px-8 lg:px-12 relative z-10">
    <nav class="flex items-center gap-4 mb-12">
      <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors font-medium">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1">ホームに戻る</span>
      </NuxtLink>
    </nav>

    <!-- Search bar -->
    <div class="card-glass p-1 mb-8 relative">
      <div class="flex items-center gap-3 px-4 py-3">
        <UIcon name="heroicons:magnifying-glass" size="20" class="text-text-muted" />
        <UInput
          v-model="query"
          placeholder="ユーザーや投稿を検索..."
          class="input-field bg-transparent border-none focus-visible:ring-0 focus-visible:border-transparent !text-base pl-0"
          @keyup.enter="search"
        />
        <button
          v-if="query.trim()"
          @click="query = ''; search()"
          class="text-text-muted hover:text-brand transition-colors"
        >
          <UIcon name="heroicons:x-mark" size="18" />
        </button>
      </div>
    </div>

    <div v-if="query.trim()" class="mb-8">
      <p class="text-sm text-text-muted">"{{ query }}" で検索中</p>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Users -->
      <div>
        <div class="section-header mb-6">
          <h2>ユーザー</h2>
        </div>
        <div v-if="searchResults.isLoading" class="flex justify-center py-12">
          <USpinner size="lg" class="text-brand" />
        </div>
        <div v-else-if="searchResults.users.length === 0" class="text-center py-16 text-text-muted">
          ユーザーが見つかりません。
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="user in searchResults.users"
            :key="user.id"
            class="card-glass p-5 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center gap-4">
              <UAvatar :size="44" :src="user.avatar" rounded="full" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <NuxtLink
                    :to="`/@${user.username}`"
                    class="text-base font-bold text-text hover:text-brand transition-colors"
                  >{{ user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ user.username }}</span>
                </div>
                <p v-if="user.bio" class="text-sm text-text-muted mt-1 line-clamp-2">{{ user.bio }}</p>
              </div>
              <UButton
                :label="isFollowing(user.username) ? 'フォロー中' : 'フォロー'"
                :color="isFollowing(user.username) ? 'gray' : 'brand'"
                size="sm"
                class="px-4 py-2 text-sm"
                @click="toggleFollow(user.username)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div>
        <div class="section-header mb-6">
          <h2>投稿</h2>
        </div>
        <div v-if="searchResults.isLoading" class="flex justify-center py-12">
          <USpinner size="lg" class="text-brand" />
        </div>
        <div v-else-if="searchResults.posts.length === 0" class="text-center py-16 text-text-muted">
          投稿が見つかりません。
        </div>
        <div v-else class="space-y-6">
          <div
            v-for="post in searchResults.posts"
            :key="post.id"
            class="card-glass p-6"
          >
            <div class="flex gap-4 mb-4">
              <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <NuxtLink
                    :to="`/@${post.user.username}`"
                    class="text-base font-bold text-text hover:text-brand transition-colors"
                  >{{ post.user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ post.user.username }} · {{ relativeTime(post.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="text-lg leading-relaxed mb-6">{{ post.content }}</div>
            <div class="flex gap-6 text-sm">
              <button
                :class="{ 'text-brand': post.liked }"
                class="flex items-center gap-2 font-medium transition-colors"
                @click="toggleLike(post.id)"
              >
                <UIcon name="heroicons:heart" size="18" />
                <span>{{ post.likes }}</span>
              </button>
              <button class="flex items-center gap-2 font-medium text-text-muted hover:text-text transition-colors">
                <UIcon name="heroicons:chat-bubble-oval-left" size="18" />
                <span>{{ post.replies }}</span>
              </button>
              <button
                :class="{ 'text-brand': post.reposted }"
                class="flex items-center gap-2 font-medium transition-colors"
                @click="toggleRepost(post.id)"
              >
                <UIcon name="heroicons:arrow-path" size="18" />
                <span>{{ post.reposts }}</span>
              </button>
              <span class="ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'

const userStore = useUserStore()
const postsStore = usePostsStore()

const query = useState('search-query', () => '')
const searchResults = useState('search-results', () => ({
  users: [] as any[],
  posts: [] as any[],
  isLoading: false,
}))

const isFollowing = (username: string) => false

const search = async () => {
  if (!query.value.trim()) {
    searchResults.value = { users: [], posts: [], isLoading: false }
    return
  }

  searchResults.value.isLoading = true
  try {
    const res = await $fetch<{ users: any[]; posts: any[] }>(`/api/search?q=${encodeURIComponent(query.value)}`)
    if (!res.ok) throw new Error('検索に失敗しました')
    const data = await res.json()
    searchResults.value = {
      users: data.users || [],
      posts: data.posts || [],
      isLoading: false,
    }
  } catch (e) {
    console.error(e)
    searchResults.value.isLoading = false
  }
}

const toggleLike = async (postId: string) => {
  await postsStore.toggleLike(postId)
}

const toggleRepost = async (postId: string) => {
  await postsStore.toggleRepost(postId)
}

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

// Initial search
if (query.value) {
  search()
}
</script>
