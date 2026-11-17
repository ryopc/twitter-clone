<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-300 relative overflow-hidden">
    <!-- Decorative night-sky blobs -->
    <div class="fixed top-0 left-0 w-full h-[300px] bg-brand/10 -z-10 blur-[120px]"></div>
    <div class="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-brand/10 blur-[160px] -z-10"></div>

    <div class="max-w-3xl mx-auto pt-20 pb-24 px-6 sm:px-8 relative z-10">
      <!-- Back + header -->
      <div class="flex items-center gap-3 mb-10">
        <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors">
          <UIcon name="heroicons:arrow-left" size="18" />
          <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
        </NuxtLink>
      </div>

      <div v-if="profile.user" class="space-y-8">
        <!-- Profile header -->
        <div class="relative">
          <div
            class="w-full h-40 bg-surface-elevated rounded-2xl overflow-hidden border border-border"
            :style="{ backgroundImage: profile.user.headerImage ? `url(${profile.user.headerImage})` : 'none' }"
          />
          <div class="flex items-center justify-center -mt-20">
            <UAvatar :size="96" :src="profile.user.avatar" rounded="full" class="border-4 border-surface-card shadow-lg" />
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-2xl font-bold text-text">{{ profile.user.displayName }}</h1>
          <p class="text-lg text-text-muted mt-1">@{{ profile.user.username }}</p>
          <p v-if="profile.user.bio" class="mt-3 text-text leading-relaxed max-w-md mx-auto">{{ profile.user.bio }}</p>

          <div class="flex items-center justify-center gap-5 mt-7">
            <div class="text-center">
              <p class="text-xl font-bold text-text">{{ profile.followersCount }}</p>
              <p class="text-sm text-text-muted">フォロワー</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-text">{{ profile.followingCount }}</p>
              <p class="text-sm text-text-muted">フォロー中</p>
            </div>
          </div>

          <div class="flex justify-center mt-5">
            <template v-if="userStore.user && userStore.user.username !== profile.user.username">
              <button
                :class="[
                  'px-8 py-3 rounded-2xl font-bold text-base transition-all',
                  profile.isFollowing
                    ? 'bg-surface-elevated border border-text-dim/30 text-text hover:bg-surface-card'
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
        <div class="section-header mb-6">
          <h2>投稿</h2>
        </div>

        <div v-if="profile.posts.length > 0" class="space-y-6">
          <div
            v-for="post in profile.posts"
            :key="post.id"
            class="card-glass p-6 hover:border-brand/40 transition-colors"
          >
            <div class="flex gap-4 mb-4">
              <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0 border border-text-dim/40" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-1.5">
                  <NuxtLink
                    :to="`/@${post.user.username}`"
                    class="text-sm font-bold text-text hover:underline transition-colors"
                  >{{ post.user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ post.user.username }} · {{ relativeTime(post.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="text-lg leading-relaxed mb-5 whitespace-pre-line">{{ post.content }}</div>
            <div class="post-actions">
              <button
                class="post-action"
                :class="{ active: post.liked }"
                @click="toggleLike(post.id)"
              >
                <UIcon name="heroicons:heart" size="18" />
                <span>{{ post.likes }}</span>
              </button>
              <button class="post-action">
                <UIcon name="heroicons:chat-bubble-oval-left" size="18" />
                <span>{{ post.replies }}</span>
              </button>
              <button
                class="post-action"
                :class="{ active: post.reposted }"
                @click="toggleRepost(post.id)"
              >
                <UIcon name="heroicons:arrow-path" size="18" />
                <span>{{ post.reposts }}</span>
              </button>
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