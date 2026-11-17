<template>
  <div class="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <nav class="flex items-center justify-between mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-brand">
        <div class="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-text">
          <span class="text-xs font-bold">B</span>
        </div>
        <span>Skybird</span>
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink to="/search" class="text-text-muted hover:text-text transition-colors">
          検索
        </NuxtLink>
        <template v-if="userStore.user">
          <UButton label="ホーム" as="nuxt-link" to="/" size="sm" variant="outline" />
          <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-brand hover:underline font-medium">ログイン</NuxtLink>
        </template>
      </div>
    </nav>

    <div v-if="profile.user" class="flex flex-col lg:flex-row gap-6">
      <!-- ヘッダー -->
      <div class="w-full lg:w-1/3">
        <div class="relative mb-4">
          <div
            class="w-full h-24 bg-surface-dark rounded-t-lg"
            :style="{ backgroundImage: profile.user.headerImage ? `url(${profile.user.headerImage})` : 'none' }"
          />
          <div class="flex items-center justify-center -mt-10">
            <UAvatar :size="80" :src="profile.user.avatar" rounded="full" />
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-xl font-bold text-text">{{ profile.user.displayName }}</h1>
          <p class="text-text-muted">@{{ profile.user.username }}</p>
          <p v-if="profile.user.bio" class="mt-2 text-text">{{ profile.user.bio }}</p>

          <div class="flex justify-center gap-4 mt-4">
            <div class="text-center">
              <p class="text-sm font-semibold text-text">{{ profile.followersCount }}</p>
              <p class="text-xs text-text-muted">フォロワー</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-text">{{ profile.followingCount }}</p>
              <p class="text-xs text-text-muted">フォロー中</p>
            </div>
          </div>

          <div class="flex justify-center mt-4">
            <template v-if="userStore.user && userStore.user.username !== profile.user.username">
              <UButton
                :label="profile.isFollowing ? 'フォロー中' : 'フォロー'"
                :color="profile.isFollowing ? 'gray' : 'brand'"
                size="sm"
                @click="toggleFollow"
                :loading="isFollowingLoading"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- 投稿一覧 -->
      <div class="w-full lg:w-2/3 space-y-4">
        <div v-if="postsStore.isLoading" class="flex justify-center py-8">
          <USpinner size="lg" />
        </div>

        <div v-else-if="profile.posts.length > 0" class="space-y-4">
          <div v-for="post in profile.posts" :key="post.id" class="UCard p-4">
            <div class="flex gap-3">
              <UAvatar :size="32" :src="post.user.avatar" rounded="full" />
              <div class="flex-1">
                <div class="flex items-baseline gap-1 text-sm font-semibold text-text">
                  <NuxtLink
                    :to="`/@${post.user.username}`"
                    class="hover:text-brand cursor-pointer transition-colors"
                  >{{ post.user.displayName }}</NuxtLink>
                  <USpan class="text-text-muted">@{{ post.user.username }} · {{ relativeTime(post.createdAt) }}</USpan>
                </div>
                <UCardContent class="mt-2 text-text leading-relaxed">
                  {{ post.content }}
                  <template v-if="post.quoteOf">
                    <div class="mt-3 p-3 border border-border rounded-lg bg-surface-dark/50">
                      <p class="text-sm text-text-muted">引用ポスト</p>
                      <p class="mt-1 text-text">{{ getQuotedPost(post.quoteOf)?.content }}</p>
                    </div>
                  </template>
                </UCardContent>
                <div class="flex gap-4 mt-3">
                  <UButton
                    size="xs"
                    variant="ghost"
                    :class="{ 'text-brand': post.liked }"
                    @click="toggleLike(post.id)"
                  >
                    <UIcon name="heroicons:heart" size="16" /> <USpan>{{ post.likes }}</USpan>
                  </UButton>
                  <UButton size="xs" variant="ghost" @click="reply(post.id)">
                    <UIcon name="heroicons:chat-bubble-bottom-center" size="16" /> <USpan>{{ post.replies }}</USpan>
                  </UButton>
                  <UButton
                    size="xs"
                    variant="ghost"
                    :class="{ 'text-brand': post.reposted }"
                    @click="toggleRepost(post.id)"
                  >
                    <UIcon name="heroicons:arrow-path" size="16" /> <USpan>{{ post.reposts }}</USpan>
                  </UButton>
                  <USpan class="ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!postsStore.isLoading" class="text-center py-12 text-text-muted">
          投稿がまだありません。
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 text-text-muted">
      ユーザーが見つかりません。
    </div>
  </div>
</template>

<script setup lang="ts">
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
  const res = await fetch(`/api/users/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (res.ok) {
    const data = await res.json()
    profile.value.user = data.user
    profile.value.isFollowing = data.following || false
    profile.value.followersCount = data.followersCount || 0
    profile.value.followingCount = data.followingCount || 0
  }

  // そのユーザーの投稿を取得（全投稿からフィルタ）
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

const reply = (postId: string) => {
  // TODO: 返信画面
}

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

const getQuotedPost = (postId: string) => {
  return postsStore.posts.find((p) => p.id === postId)
}

fetchProfile()

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}
</script>
