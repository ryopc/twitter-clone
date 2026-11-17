<template>
  <div class="max-w-4xl mx-auto py-12 px-6 sm:px-8 relative z-10">
    <nav class="flex items-center gap-4 mb-12">
      <NuxtLink to="/" class="text-text-muted hover:text-text transition-colors font-medium">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1">ホームに戻る</span>
      </NuxtLink>
    </nav>

    <div v-if="profile.user" class="space-y-10">
      <!-- Header -->
      <div class="relative">
        <div
          class="w-full h-48 bg-surface-elevated rounded-3xl overflow-hidden border border-border"
          :style="{ backgroundImage: profile.user.headerImage ? `url(${profile.user.headerImage})` : 'none' }"
        />
        <div class="flex items-center justify-center -mt-24">
          <UAvatar :size="112" :src="profile.user.avatar" rounded="full" class="border-4 border-surface shadow-xl" />
        </div>
      </div>

      <div class="text-center">
        <h1 class="text-3xl font-bold text-text">{{ profile.user.displayName }}</h1>
        <p class="text-xl text-text-muted mt-2">@{{ profile.user.username }}</p>
        <p v-if="profile.user.bio" class="mt-4 text-text leading-relaxed max-w-2xl mx-auto">{{ profile.user.bio }}</p>

        <div class="flex items-center justify-center gap-6 mt-8">
          <div class="text-center">
            <p class="text-2xl font-bold text-text">{{ profile.followersCount }}</p>
            <p class="text-sm text-text-muted">フォロワー</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-text">{{ profile.followingCount }}</p>
            <p class="text-sm text-text-muted">フォロー中</p>
          </div>
        </div>

        <div class="flex justify-center mt-6">
          <template v-if="userStore.user && userStore.user.username !== profile.user.username">
            <button
              :class="[
                'btn-base px-8 py-3 rounded-2xl font-bold text-base transition-all',
                profile.isFollowing
                  ? 'bg-white text-brand border border-brand/30 hover:bg-brand/5'
                  : 'btn-brand'
              ]"
              @click="toggleFollow"
              :disabled="isFollowingLoading"
            >
              {{ isFollowingLoading ? '処理中...' : (profile.isFollowing ? 'フォロー中' : 'フォロー') }}
            </button>
          </template>
        </div>
      </div>

      <!-- Posts -->
      <div class="section-header">
        <h2>投稿</h2>
      </div>

      <div v-if="profile.posts.length > 0" class="space-y-6">
        <div
          v-for="post in profile.posts"
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

      <div v-else class="text-center py-20">
        <p class="text-text-muted text-lg">投稿がまだありません。</p>
      </div>
    </div>

    <div v-else class="text-center py-32">
      <p class="text-text-muted text-lg">ユーザーが見つかりません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'

const route = useRoute()
const username = route.params.username as string

const userStore = useUserStore()
const postsStore = usePostsStore()

const profile = useState(`profile-${username}`, () => ({
  user: null as any,
  posts: [] as any[],
  isFollowing: false,
  followersCount: 0,
  followingCount: 0,
}))

const isFollowingLoading = useState(`following-loading-${username}`, () => false)

const fetchProfile = async () => {
  const token = userStore.token
  const res = await $fetch(`/api/users/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  profile.value.user = res.user
  profile.value.isFollowing = res.following || false
  profile.value.followersCount = res.followersCount || 0
  profile.value.followingCount = res.followingCount || 0

  await postsStore.fetchPosts()
  profile.value.posts = postsStore.posts.filter((p) => p.user.username === username)
}

const toggleFollow = async () => {
  if (!userStore.user) return
  isFollowingLoading.value = true
  try {
    const following = await userStore.toggleFollow(username)
    profile.value.isFollowing = following
  } catch (e) {
    alert(e?.message || 'フォロー処理に失敗しました')
  } finally {
    isFollowingLoading.value = false
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

fetchProfile()
</script>
