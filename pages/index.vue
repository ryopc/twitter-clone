<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-300 relative overflow-hidden">
    <!-- Decorative night-sky blobs -->
    <div class="fixed top-0 left-0 w-full h-[300px] bg-brand/10 -z-10 blur-[120px]"></div>
    <div class="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-brand/10 blur-[160px] -z-10"></div>

    <div class="max-w-2xl mx-auto pt-20 pb-24 px-6 sm:px-8 relative z-10">
      <!-- Tweet compose box (What's happening?) -->
      <div class="tweet-compose reveal-item reveal-delay-1 mb-12">
        <div class="flex gap-3 mb-3">
          <UAvatar :size="48" :src="userStore.user?.avatar || '/icons/icon-192x192.png'" rounded="full" class="flex-shrink-0 border border-text-dim/40" />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-bold text-text">{{ userStore.user?.displayName || 'ユーザー' }}</span>
              <span class="text-xs text-text-muted">@{{ userStore.user?.username || 'user' }}</span>
            </div>
            <textarea
              v-model="composeText"
              placeholder="いま何が起きていますか？"
              class="w-full mt-2 bg-transparent border-none text-text text-sm resize-none focus:outline-none focus:ring-0 placeholder-text-dim leading-relaxed"
              rows="3"
            />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <span class="flex items-center gap-1 text-text">
              <UIcon name="heroicons:globe" size="14" />
              誰でも
            </span>
          </div>
          <button
            :disabled="!composeText.trim() || isLoading"
            class="btn-brand"
            @click="createPost"
          >
            ポスト
          </button>
        </div>
      </div>

      <!-- Timeline -->
      <div v-if="postsStore.posts.length > 0" class="space-y-6">
        <div
          v-for="post in postsStore.posts"
          :key="post.id"
          class="card-glass p-5 reveal-item group hover:border-brand/40 transition-colors"
        >
          <div class="flex gap-3 mb-3">
            <UAvatar :size="40" :src="post.user.avatar" rounded="full" class="flex-shrink-0 border border-text-dim/40" />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-1.5">
                <NuxtLink
                  :to="`/@${post.user.username}`"
                  class="text-sm font-bold text-text hover:underline transition-colors"
                >{{ post.user.displayName }}</NuxtLink>
                <span class="text-xs text-text-muted">@{{ post.user.username }}</span>
                <span class="text-xs text-text-muted">·</span>
                <span class="text-xs text-text-muted">{{ relativeTime(post.createdAt) }}</span>
              </div>
              <div class="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{{ post.content }}</div>
            </div>
          </div>

          <div class="post-actions mt-3">
            <button
              class="post-action"
              :class="{ active: post.liked }"
              @click="toggleLike(post.id)"
            >
              <UIcon name="heroicons:heart" size="18" />
              <span>{{ post.likes }}</span>
            </button>
            <button class="post-action" @click="replyToPost(post.id)">
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
            <button class="post-action">
              <UIcon name="heroicons:share" size="18" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-32 reveal-item reveal-delay-1">
        <div class="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4 text-brand">
          <UIcon name="heroicons:feather" size="32" />
        </div>
        <h3 class="text-lg font-bold text-text mb-2">まだポストがありません</h3>
        <p class="text-text-muted text-sm">最初のポストを投稿して、会話を始めましょう。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'

const userStore = useUserStore()
const postsStore = usePostsStore()

const composeText = useState('compose-text', () => '')
const isLoading = useState('compose-loading', () => false)

const createPost = async () => {
  if (!composeText.trim()) return
  isLoading.value = true
  try {
    await postsStore.createPost(composeText.trim())
    composeText.value = ''
  } catch (e) {
    alert('ポストに失敗しました')
  } finally {
    isLoading.value = false
  }
}

const toggleLike = async (postId: string) => {
  await postsStore.toggleLike(postId)
}

const toggleRepost = async (postId: string) => {
  await postsStore.toggleRepost(postId)
}

const replyToPost = async (postId: string) => {
  const content = prompt('返信を入力してください')
  if (content) {
    await postsStore.replyToPost(postId, content)
  }
}

const relativeTime = (ts: number) => {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'たった今'
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
  return `${Math.floor(sec / 86400)}日前`
}
</script>