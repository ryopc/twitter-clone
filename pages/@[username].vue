<template>
  <div class="profile-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <!-- Header image -->
    <div
      v-if="profile.user?.headerImage"
      class="header-banner h-48 w-full relative overflow-hidden"
      :style="{ backgroundImage: `url(${profile.user.headerImage})` }"
    >
      <div class="absolute inset-0 bg-black/40" />
    </div>
    <div v-else class="header-banner h-48 w-full bg-surface-card border-b border-surface-border relative">
      <div class="absolute inset-0 bg-gradient-to-br from-brand/10 to-accent/10" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="w-16 h-16 rounded-full bg-surface-card border-4 border-surface mb-3 shadow-xl" />
          <p class="text-text-muted text-sm">ヘッダー画像を設定</p>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
      <!-- Back + header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors touch-target">
          <UIcon name="heroicons:arrow-left" size="18" />
          <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
        </NuxtLink>
      </div>

      <div v-if="profile.user" class="fade-in">
        <!-- Profile header -->
        <div class="relative mb-6">
          <div class="absolute -top-16 left-6 z-20">
            <UAvatar
              :size="96"
              :src="profile.user.avatar || '/icons/icon-192x192.png'"
              rounded="full"
              class="border-4 border-surface shadow-xl avatar-border touch-target"
              :to="`/@${profile.user.username}`"
            />
          </div>
        </div>

        <div class="text-center mt-8">
          <h1 class="text-3xl font-black text-text tracking-tighter">{{ profile.user.displayName }}</h1>
          <p class="text-lg text-text-muted mt-2">@{{ profile.user.username }}</p>
          <p v-if="profile.user.bio" class="mt-4 text-text leading-relaxed max-w-md mx-auto">{{ profile.user.bio }}</p>

          <div class="flex items-center justify-center gap-6 mt-8 px-4">
            <div class="text-center touch-target">
              <p class="text-xl font-bold text-text">{{ profile.followersCount }}</p>
              <p class="text-sm text-text-muted">フォロワー</p>
            </div>
            <div class="text-center touch-target">
              <p class="text-xl font-bold text-text">{{ profile.followingCount }}</p>
              <p class="text-sm text-text-muted">フォロー中</p>
            </div>
          </div>

          <div class="flex justify-center mt-6">
            <template v-if="userStore.user && userStore.user.username !== profile.user.username">
              <button
                :class="[
                  'px-8 py-3 rounded-full font-bold text-base transition-all touch-target',
                  profile.isFollowing
                    ? 'bg-surface-elevated border border-surface-border text-text hover:bg-surface-input'
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

        <!-- Tabs -->
        <div class="tab-nav overflow-x-auto pb-2 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab touch-target"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <UIcon :name="tab.icon" size="18" class="text-text-muted transition-colors" />
            <span class="ml-1.5">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 'posts'" class="space-y-4">
          <div v-if="profile.posts.length > 0">
            <div
              v-for="post in profile.posts"
              :key="post.id"
              class="card-glass p-5 fade-in hover-card"
            >
              <div class="flex gap-3 mb-3">
                <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0 border border-surface-border touch-target" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-1.5 mb-1">
                    <NuxtLink
                      :to="`/@${post.user.username}`"
                      class="text-sm font-bold text-text hover:text-brand transition-colors"
                    >{{ post.user.displayName }}</NuxtLink>
                    <span class="text-xs text-text-muted">@{{ post.user.username }} · {{ relativeTime(post.createdAt) }}</span>
                  </div>
                  <div class="text-sm leading-relaxed whitespace-pre-line mb-3">{{ post.content }}</div>
                  <div v-if="post.imageUrl" class="mt-2 rounded-xl overflow-hidden border border-surface-border cursor-pointer" @click="openPost(post.id)">
                    <img :src="post.imageUrl" alt="" class="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>

              <div class="post-actions">
                <button
                  class="post-action touch-target"
                  :class="{ active: post.liked, liked: post.liked }"
                  @click="toggleLike(post.id)"
                >
                  <UIcon name="heroicons:heart" size="18" class="touch-target" />
                  <span class="touch-target">{{ post.likes }}</span>
                </button>
                <button class="post-action touch-target" @click="replyToPost(post.id)">
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
          <div v-else class="text-center py-20">
            <div class="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4 text-brand">
              <UIcon name="heroicons:feather" size="32" />
            </div>
            <p class="text-text-muted text-lg">投稿がまだありません。</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'media'" class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-surface-card/50 flex items-center justify-center mx-auto mb-4 text-text-muted">
            <UIcon name="heroicons:photograph" size="32" />
          </div>
          <p class="text-text-muted text-lg">メディアはまだありません。</p>
        </div>

        <div v-else-if="activeTab === 'likes'" class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-surface-card/50 flex items-center justify-center mx-auto mb-4 text-text-muted">
            <UIcon name="heroicons:heart" size="32" />
          </div>
          <p class="text-text-muted text-lg">いいねした投稿はまだありません。</p>
        </div>

        <div v-else-if="activeTab === 'reposts'" class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-surface-card/50 flex items-center justify-center mx-auto mb-4 text-text-muted">
            <UIcon name="heroicons:arrow-path" size="32" />
          </div>
          <p class="text-text-muted text-lg">リポストはまだありません。</p>
        </div>
      </div>

      <div v-else class="text-center py-32">
        <div class="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4 text-brand">
          <UIcon name="heroicons:user" size="32" />
        </div>
        <p class="text-text-muted text-lg">ユーザーが見つかりません。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'
import { useAppToast } from '~/composables/useAppToast'
import { useRelativeTime } from '~/composables/useRelativeTime'
import { computed, ref } from 'vue'
import { useRoute, navigateTo } from '#app'
import type { User, Post, FollowStatus } from '~/types'

const route = useRoute()
const username = route.params.username as string

const userStore = useUserStore()
const postsStore = usePostsStore()
const { success, error: showError } = useAppToast()
const { relativeTime } = useRelativeTime()

const profile = useState(`profile-${username}`, () => ({
  user: null as User | null,
  posts: [] as Post[],
  isFollowing: false,
  followersCount: 0,
  followingCount: 0,
}))

const isFollowingLoading = useState(`following-loading-${username}`, () => false)
const activeTab = ref('posts')

const tabs = [
  { key: 'posts', label: '投稿', icon: 'heroicons:pencil' },
  { key: 'media', label: 'メディア', icon: 'heroicons:photograph' },
  { key: 'likes', label: 'いいね', icon: 'heroicons:heart' },
  { key: 'reposts', label: 'リポスト', icon: 'heroicons:arrow-path' },
]

const fetchProfile = async () => {
  const token = userStore.token
  try {
    const res = await $fetch<{
      user: User
      following: boolean
      followersCount: number
      followingCount: number
    }>(`/api/users/${username}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    profile.value.user = res.user
    profile.value.isFollowing = res.following || false
    profile.value.followersCount = res.followersCount || 0
    profile.value.followingCount = res.followingCount || 0

    await postsStore.fetchPosts()
    profile.value.posts = postsStore.posts.filter((p: Post) => p.user.username === username)
  } catch (e) {
    showError('エラー', 'プロフィールの取得に失敗しました')
  }
}

const toggleFollow = async () => {
  if (!userStore.user) return
  isFollowingLoading.value = true
  try {
    const following = await userStore.toggleFollow(username)
    profile.value.isFollowing = following
    success(following ? 'フォローしました' : 'フォローを解除しました')
  } catch (e) {
    showError('エラー', 'フォロー処理に失敗しました')
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

const replyToPost = async (postId: string) => {
  navigateTo(`/posts/${postId}`)
}

const openPost = (postId: string) => {
  navigateTo(`/posts/${postId}`)
}

fetchProfile()
</script>