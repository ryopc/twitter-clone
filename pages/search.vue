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
          <NuxtLink to="/notifications" class="text-text-muted hover:text-text transition-colors">
            通知
          </NuxtLink>
          <NuxtLink to="/messages" class="text-text-muted hover:text-text transition-colors">
            メッセージ
          </NuxtLink>
          <UButton label="ホーム" as="nuxt-link" to="/" size="sm" variant="outline" />
          <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-brand hover:underline font-medium">ログイン</NuxtLink>
        </template>
      </div>
    </nav>

    <div class="mb-6">
      <UInput
        v-model="query"
        placeholder="ユーザーや投稿を検索..."
        class="w-full max-w-md"
        @keyup.enter="search"
      />
      <div class="mt-2 text-xs text-text-muted">
        "{{ query }}" で検索中 (ユーザー・投稿)
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ユーザー検索結果 -->
      <div>
        <h3 class="text-lg font-semibold text-text mb-4">ユーザー</h3>
        <div v-if="searchResults.isLoading" class="flex justify-center py-8">
          <USpinner size="lg" />
        </div>
        <div v-else-if="searchResults.users.length === 0" class="text-center py-8 text-text-muted">
          ユーザーが見つかりません。
        </div>
        <div v-else class="space-y-3">
          <div v-for="user in searchResults.users" :key="user.id" class="UCard p-4">
            <div class="flex items-center gap-3">
              <UAvatar :size="32" :src="user.avatar" rounded="full" />
              <div class="flex-1">
                <div class="flex items-baseline gap-1 text-sm font-semibold text-text">
                  <NuxtLink
                    :to="`/@${user.username}`"
                    class="hover:text-brand cursor-pointer transition-colors"
                  >{{ user.displayName }}</NuxtLink>
                  <USpan class="text-text-muted">@{{ user.username }}</USpan>
                </div>
                <p v-if="user.bio" class="text-sm text-text-muted mt-1">{{ user.bio }}</p>
              </div>
              <template v-if="userStore.user && userStore.user.username !== user.username">
                <UButton
                  :label="isFollowing(user.username) ? 'フォロー中' : 'フォロー'"
                  :color="isFollowing(user.username) ? 'gray' : 'brand'"
                  size="sm"
                  @click="toggleFollow(user.username)"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 投稿検索結果 -->
      <div>
        <h3 class="text-lg font-semibold text-text mb-4">投稿</h3>
        <div v-if="searchResults.isLoading" class="flex justify-center py-8">
          <USpinner size="lg" />
        </div>
        <div v-else-if="searchResults.posts.length === 0" class="text-center py-8 text-text-muted">
          投稿が見つかりません。
        </div>
        <div v-else class="space-y-4">
          <div v-for="post in searchResults.posts" :key="post.id" class="UCard p-4">
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
                    <UIcon name="heroicons:chat-bubble-bottom-center" size="16" />
                    <USpan>{{ post.replies }}</USpan>
                  </UButton>
                  <UButton
                    size="xs"
                    variant="ghost"
                    :class="{ 'text-brand': post.reposted }"
                    @click="toggleRepost(post.id)"
                  >
                    <UIcon name="heroicons:arrow-path" size="16" />
                    <USpan>{{ post.reposts }}</USpan>
                  </UButton>
                  <USpan class="ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const postsStore = usePostsStore()

const query = useState('search-query', () => '')
const searchResults = useState('search-results', () => ({
  users: [] as any[],
  posts: [] as any[],
  isLoading: false,
}))

const isFollowing = (username: string) => {
  // 簡易実装：フォロー状態はプロフィールページで確認
  return false
}

const search = async () => {
  if (!query.value.trim()) {
    searchResults.value = { users: [], posts: [], isLoading: false }
    return
  }

  searchResults.value.isLoading = true
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query.value)}`)
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

const reply = (postId: string) => {
  const content = prompt('返信内容を入力してください')
  if (!content) return
  postsStore.replyToPost(postId, content).then(() => search())
}

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
}

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}

// 初期検索（クエリがある場合）
if (query.value) {
  search()
}
</script>
