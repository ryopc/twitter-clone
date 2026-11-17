<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-500 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="fixed top-0 left-0 w-full h-[400px] bg-gradient-brand opacity-40 -z-10 blur-[100px]"></div>
    <div class="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-brand/20 blur-[120px] -z-10"></div>
    <div class="fixed top-20 left-10 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px] -z-10"></div>

    <div class="max-w-7xl mx-auto py-12 px-6 sm:px-8 lg:px-12 relative z-10">
      <!-- Navigation -->
      <nav class="flex items-center justify-between mb-16">
        <NuxtLink to="/" class="flex items-center gap-3 text-2xl font-bold tracking-tighter">
          <div class="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand/40">
            <span class="text-xs font-black uppercase tracking-widest">S</span>
          </div>
          <span class="bg-clip-text text-transparent bg-gradient-to-br from-brand via-accent to-white">Skybird</span>
        </NuxtLink>

        <div class="flex items-center gap-6">
          <template v-if="userStore.user">
            <NuxtLink
              to="/notifications"
              class="relative text-text-muted hover:text-text transition-colors"
            >
              <UIcon name="heroicons:bell" size="20" />
              <span v-if="notificationStore.unreadCount > 0" class="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
            </NuxtLink>
            <NuxtLink to="/messages" class="text-text-muted hover:text-text transition-colors">
              <UIcon name="heroicons:chat-bubble-oval-left" size="20" />
            </NuxtLink>
            <NuxtLink
              :to="`/@${userStore.user.username}`"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border border-border text-text font-medium hover:bg-surface/70 transition-all"
            >
              <UAvatar :size="28" :src="userStore.user.avatar" rounded="full" />
              <span class="hidden sm:inline">{{ userStore.displayName }}</span>
            </NuxtLink>
            <UButton label="ログアウト" @click="handleLogout" variant="outline" size="sm" class="px-4" />
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-text-muted hover:text-brand transition-colors font-medium">ログイン</NuxtLink>
            <a href="/register" class="btn-brand px-6 py-3 text-base">アカウント作成</a>
          </template>
        </div>
      </nav>

      <!-- Hero Section -->
      <div class="hero relative reveal-item reveal-delay-1">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-sm font-medium uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            オープン SNS クライアント
          </div>
          <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6 reveal-item reveal-delay-2">
            独自の声を、<br />
            <span class="text-gradient">自由な形で。</span>
          </h1>
          <p class="text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed reveal-item reveal-delay-3">
            商標に縛られない、オープンでモダンなソーシャルネットワーク。
            PWA 対応でオフラインでも動作。あなたの投稿を、あなたのペースで。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 reveal-item reveal-delay-4">
            <a href="/register" class="btn-brand w-full sm:w-auto text-center">今すぐ始める</a>
            <NuxtLink to="/login" class="btn-ghost w-full sm:w-auto text-center">ログイン</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="mt-20 grid md:grid-cols-3 gap-8">
        <div class="card-glass p-8 reveal-item reveal-delay-1 group">
          <div class="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
            <UIcon name="heroicons:rocket-launch" size="28" class="text-brand" />
          </div>
          <h3 class="text-xl font-bold mb-3">PWA 対応</h3>
          <p class="text-text-muted leading-relaxed">ホーム画面にインストール。オフラインでも投稿をキューイングし、オンライン復帰時に同期。</p>
        </div>
        <div class="card-glass p-8 reveal-item reveal-delay-2 group">
          <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
            <UIcon name="heroicons:shield-check" size="28" class="text-accent" />
          </div>
          <h3 class="text-xl font-bold mb-3">商標回避</h3>
          <p class="text-text-muted leading-relaxed">オリジナルデザイン。既存ブランドを模倣しない、クリーンなインターフェイス。</p>
        </div>
        <div class="card-glass p-8 reveal-item reveal-delay-3 group">
          <div class="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
            <UIcon name="heroicons:zap" size="28" class="text-brand" />
          </div>
          <h3 class="text-xl font-bold mb-3">リアルタイム</h3>
          <p class="text-text-muted leading-relaxed">いいね、リポスト、返信、DM。すべてのインタラクションが即座に反映されます。</p>
        </div>
      </div>

      <!-- Feed Preview -->
      <div class="mt-20 reveal-item reveal-delay-1">
        <div class="flex items-center justify-between mb-8">
          <div class="section-header">
            <h2>タイムライン</h2>
          </div>
          <NuxtLink to="/" class="text-sm font-medium text-brand hover:underline">すべて見る</NuxtLink>
        </div>

        <div v-if="postsStore.posts.length > 0" class="space-y-6">
          <div
            v-for="post in postsStore.posts.slice(0, 3)"
            :key="post.id"
            class="card-glass p-6 group"
          >
            <div class="flex gap-4 mb-4">
              <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <NuxtLink
                    :to="`/@${post.user.username}`"
                    class="text-base font-bold text-text hover:text-brand transition-colors"
                  >{{ post.user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ post.user.username }}</span>
                  <span class="text-xs text-text-muted">·</span>
                  <span class="text-xs text-text-muted">{{ relativeTime(post.createdAt) }}</span>
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
              <button class="flex items-center gap-2 font-medium text-text-muted hover:text-text transition-colors">
                <UIcon name="heroicons:ellipsis-vertical" size="18" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20">
          <p class="text-text-muted text-lg">投稿がまだありません。最初の一歩を踏み出しましょう。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'
import { useNotificationStore } from '~/stores/notification'

const userStore = useUserStore()
const postsStore = usePostsStore()
const notificationStore = useNotificationStore()

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  userStore.logout()
  await navigateTo('/login')
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
</script>
