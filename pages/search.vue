<template>
  <div class="search-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6 px-4 sm:px-6">
      <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors touch-target">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
      </NuxtLink>
    </div>

    <!-- Search bar -->
    <div class="card-glass mb-8 px-4 sm:px-6">
      <div class="flex items-center gap-3 px-5 py-4">
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
          class="text-text-muted hover:text-brand transition-colors touch-target"
        >
          <UIcon name="heroicons:x-mark" size="18" class="touch-target" />
        </button>
      </div>
    </div>

    <div v-if="query.trim()" class="mb-6 px-4 sm:px-6">
      <p class="text-sm text-text-muted">"{{ query }}" で検索中</p>
    </div>

    <!-- Tabs -->
    <div class="tab-nav overflow-x-auto pb-2 mb-6 px-4 sm:px-6">
      <button
        v-for="tab in searchTabs"
        :key="tab.key"
        class="tab touch-target"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="grid md:grid-cols-2 gap-8 px-4 sm:px-6">
      <!-- Users -->
      <div v-if="activeTab === 'users' || activeTab === 'all'">
        <div class="section-header mb-6">
          <h2>ユーザー</h2>
        </div>
        <div v-if="searchResults.isLoading" class="flex justify-center py-12">
          <div class="skeleton-text w-48 mb-2" />
          <div class="skeleton-text w-64" />
        </div>
        <div v-else-if="searchResults.users.length === 0" class="text-center py-16 text-text-muted">
          ユーザーが見つかりません。
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="user in searchResults.users"
            :key="user.id"
            class="card-glass p-5 hover:border-brand/40 transition-colors hover-card"
          >
            <div class="flex items-center gap-4">
              <UAvatar :size="44" :src="user.avatar" rounded="full" class="flex-shrink-0 border border-surface-border touch-target" :to="`/@${user.username}`" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <NuxtLink
                    :to="`/@${user.username}`"
                    class="text-sm font-bold text-text hover:text-brand transition-colors"
                  >{{ user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ user.username }}</span>
                </div>
                <p v-if="user.bio" class="text-sm text-text-muted mt-1 line-clamp-2">{{ user.bio }}</p>
              </div>
              <button
                :class="[
                  'px-4 py-2 rounded-full text-sm font-bold transition-colors touch-target',
                  isFollowing(user.username)
                    ? 'bg-surface-elevated border border-surface-border text-text hover:bg-surface-input'
                    : 'btn-brand text-xs px-3 py-1.5'
                ]"
                @click="toggleFollow(user.username)"
              >
                {{ isFollowing(user.username) ? 'フォロー中' : 'フォロー' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="activeTab === 'posts' || activeTab === 'all'">
        <div class="section-header mb-6">
          <h2>投稿</h2>
        </div>
        <div v-if="searchResults.isLoading" class="flex justify-center py-12">
          <div class="skeleton-text w-64 mb-2" />
          <div class="skeleton-text w-full" />
        </div>
        <div v-else-if="searchResults.posts.length === 0" class="text-center py-16 text-text-muted">
          投稿が見つかりません。
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="post in searchResults.posts"
            :key="post.id"
            class="card-glass p-5 hover:border-brand/40 transition-colors hover-card"
          >
            <div class="flex gap-3 mb-3">
              <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0 border border-surface-border touch-target" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-1.5">
                  <NuxtLink
                    :to="`/@${post.user.username}`"
                    class="text-sm font-bold text-text hover:text-brand transition-colors"
                  >{{ post.user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ post.user.username }} · {{ relativeTime(post.createdAt) }}</span>
                </div>
              </div>
              <div class="text-sm leading-relaxed whitespace-pre-line mb-3">{{ post.content }}</div>
              <div class="post-actions">
                <button
                  class="post-action touch-target"
                  :class="{ active: post.liked }"
                  @click="toggleLike(post.id)"
                >
                  <UIcon name="heroicons:heart" size="18" class="touch-target" />
                  <span class="touch-target">{{ post.likes }}</span>
                </button>
                <button class="post-action touch-target">
                  <UIcon name="heroicons:chat-bubble-oval-left" size="18" class="touch-target" />
                  <span class="touch-target">{{ post.replies }}</span>
                </button>
                <button
                  class="post-action touch-target"
                  :class="{ active: post.reposted }"
                  @click="toggleRepost(post.id)"
                >
                  <UIcon name="heroicons:arrow-path" size="18" class="touch-target" />
                  <span class="touch-target">{{ post.reposts }}</span>
                </button>
              </div>
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
import { computed, ref } from 'vue'
import { useRelativeTime } from '~/composables/useRelativeTime'
import type { User, Post } from '~/types'

const userStore = useUserStore()
const postsStore = usePostsStore()
const { relativeTime } = useRelativeTime()

const query = useState('search-query', () => '')
const searchResults = useState('search-results', () => ({
  users: [] as User[],
  posts: [] as Post[],
  isLoading: false,
}))

const followingCache = useState<'following-cache', Record<string, boolean>>('search-following-cache', () => {})
const activeTab = ref('all')

const searchTabs = [
  { key: 'all', label: 'すべて' },
  { key: 'users', label: 'ユーザー' },
  { key: 'posts', label: '投稿' },
]

const isFollowing = computed(() => (username: string) => {
  return followingCache.value[username] ?? false
})

const loadFollowingStatus = async (usernames: string[]) => {
  if (!userStore.token) return
  await Promise.all(
    usernames.map(async (username) => {
      if (followingCache.value[username] !== undefined) return
      try {
        const status = await userStore.fetchFollowStatus(username)
        followingCache.value = { ...followingCache.value, [username]: status.following }
      } catch {
        followingCache.value = { ...followingCache.value, [username]: false }
      }
    })
  )
}

const search = async () => {
  if (!query.value.trim()) {
    searchResults.value = { users: [], posts: [], isLoading: false }
    return
  }

  searchResults.value.isLoading = true
  try {
    const data = await $fetch<{ users: User[]; posts: Post[] }>(`/api/search?q=${encodeURIComponent(query.value)}`)
    searchResults.value = {
      users: data.users || [],
      posts: data.posts || [],
      isLoading: false,
    }
    await loadFollowingStatus((data.users || []).map((u) => u.username))
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
</script>