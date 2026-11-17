<template>
  <div class="max-w-screen-lg mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <!-- ナビゲーション -->
    <nav class="flex items-center justify-between mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold text-brand">
        <div class="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-text">
          <span class="text-xs font-bold">B</span>
        </div>
        <span>Birdie</span>
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink to="/search" class="text-text-muted hover:text-text transition-colors">
          検索
        </NuxtLink>
        <template v-if="userStore.user">
          <NuxtLink
            :to="`/@${userStore.user.username}`"
            class="text-text-muted hover:text-text transition-colors"
          >
            プロフィール
          </NuxtLink>
          <UButton label="ログアウト" size="sm" @click="handleLogout" variant="outline" />
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-text-muted hover:text-text transition-colors">ログイン</NuxtLink>
          <NuxtLink to="/register" class="btn-brand px-4 py-2 rounded-md font-medium text-white">登録</NuxtLink>
        </template>
      </div>
    </nav>

    <!-- 投稿作成カード -->
    <UCard v-if="userStore.user" class="mb-6">
      <UCardHeader class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <UAvatar
            :size="40"
            :src="userStore.user.avatar"
            rounded="full"
          />
          <div class="flex-1">
            <UInput
              v-model="draft"
              placeholder="いまどうしてる？"
              class="!bg-transparent !border-0 focus-visible:!ring-0 text-text !text-base"
            />
          </div>
        </div>
        <div class="flex items-center gap-4 pt-2 border-t border-border">
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <USpan class="text-brand cursor-pointer hover:opacity-80 transition-opacity">公開</USpan>
            <USpan>みんなに表示されます</USpan>
          </div>
          <UButton
            :disabled="!draft.trim() || postsStore.isLoading"
            label="投稿"
            color="brand"
            size="sm"
            class="whitespace-nowrap"
            @click="createPost"
          />
        </div>
      </UCardHeader>
    </UCard>

    <template v-else>
      <UCard class="mb-6 p-6 text-center">
        <UCardContent>
          <p class="text-text-muted mb-4">投稿を閲覧・作成するにはログインしてください。</p>
          <div class="flex gap-2 justify-center">
            <NuxtLink to="/login" class="text-brand hover:underline font-medium">ログイン</NuxtLink>
            <span class="text-text-muted">|</span>
            <NuxtLink to="/register" class="text-brand hover:underline font-medium">新規登録</NuxtLink>
          </div>
        </UCardContent>
      </UCard>
    </template>

    <!-- ローディング -->
    <div v-if="postsStore.isLoading" class="flex justify-center py-8">
      <USpinner size="lg" />
    </div>

    <!-- エラー表示 -->
    <div v-if="postsStore.error" class="UCard p-4 mb-6 bg-error/10 border border-error text-error">
      {{ postsStore.error }}
      <UButton size="xs" variant="ghost" class="ml-2" @click="fetchPosts">再試行</UButton>
    </div>

    <!-- タイムライン -->
    <div v-if="postsStore.posts.length > 0" class="space-y-4">
      <div v-for="post in postsStore.posts" :key="post.id" class="UCard p-4">
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
              <UButton size="xs" variant="ghost" @click="bookmark(post.id)">
                <UIcon name="heroicons:bookmark" size="16" />
              </UButton>
              <USpan class="ml-auto" />
              <UButton size="xs" variant="ghost" class="text-text-muted hover:text-text">
                <UIcon name="heroicons:ellipsis-vertical" size="16" />
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!postsStore.isLoading && !postsStore.error" class="text-center py-12 text-text-muted">
      投稿がまだありません。最初の投稿をしてみましょう。
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const postsStore = usePostsStore()

const draft = useState('feed-draft', () => '')

const fetchPosts = async () => {
  await postsStore.fetchPosts()
}

const createPost = async () => {
  if (!draft.value.trim()) return
  await postsStore.createPost(draft.value)
  draft.value = ''
}

const toggleLike = async (postId: string) => {
  await postsStore.toggleLike(postId)
}

const reply = (postId: string) => {
  // TODO: 返信画面へ遷移
}

const toggleRepost = (postId: string) => {
  // TODO: リポスト実装
}

const bookmark = (postId: string) => {
  // TODO: ブックマーク実装
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

// 初期データ取得
fetchPosts()
</script>
