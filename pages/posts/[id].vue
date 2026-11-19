<template>
  <div class="post-detail-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6 px-4 sm:px-6">
      <NuxtLink to="/" class="text-text-muted hover:text-brand transition-colors touch-target">
        <UIcon name="heroicons:arrow-left" size="18" />
        <span class="ml-1.5 text-sm font-medium">ホームに戻る</span>
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="skeleton-text w-48 mb-2" />
      <div class="skeleton-text w-64" />
    </div>

    <div v-else-if="error" class="text-center py-20 text-destructive">
      <p>{{ error }}</p>
      <NuxtLink to="/" class="text-brand font-medium hover:underline mt-4 inline-block">ホームに戻る</NuxtLink>
    </div>

    <div v-else-if="post" class="max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <!-- Post Card -->
      <article class="card-glass p-5 hover-card fade-in">
        <div class="flex gap-3 mb-4">
          <UAvatar
            :size="48"
            :src="post.user.avatar || '/icons/icon-192x192.png'"
            rounded="full"
            class="flex-shrink-0 border border-surface-border"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-1.5 mb-1">
              <NuxtLink
                :to="`/@${post.user.username}`"
                class="text-sm font-bold text-text hover:text-brand transition-colors"
              >{{ post.user.displayName }}</NuxtLink>
              <span class="text-xs text-text-muted">@{{ post.user.username }}</span>
              <span class="text-xs text-text-muted">·</span>
              <span class="text-xs text-text-muted">{{ relativeTime(post.createdAt) }}</span>
            </div>
            <div class="text-sm leading-relaxed whitespace-pre-line mb-4">{{ post.content }}</div>
            <div v-if="post.imageUrl" class="mt-3 rounded-xl overflow-hidden border border-surface-border">
              <img :src="post.imageUrl" alt="" class="w-full h-64 object-cover cursor-pointer" @click="openImage(post.imageUrl)" />
            </div>
          </div>
        </div>

        <div class="post-actions border-t border-surface-border pt-4">
          <button
            class="post-action touch-target"
            :class="{ active: post.liked, liked: post.liked }"
            @click="toggleLike"
          >
            <UIcon name="heroicons:heart" size="20" class="touch-target" />
            <span class="touch-target">{{ post.likes }}</span>
          </button>
          <button class="post-action touch-target" @click="replyToPost">
            <UIcon name="heroicons:chat-bubble-oval-left" size="20" class="touch-target" />
            <span class="touch-target">{{ post.replies }}</span>
          </button>
          <button
            class="post-action touch-target"
            :class="{ active: post.reposted }"
            @click="toggleRepost"
          >
            <UIcon name="heroicons:arrow-path" size="20" class="touch-target" />
            <span class="touch-target">{{ post.reposts }}</span>
          </button>
          <button class="post-action touch-target">
            <UIcon name="heroicons:share" size="20" class="touch-target" />
          </button>
        </div>
      </article>

      <!-- Replies Section -->
      <div v-if="post.replies > 0 || true" class="mt-8">
        <div class="section-header mb-6">
          <h2>返信</h2>
        </div>

        <div class="card-glass p-5 mb-6">
          <div class="flex gap-3 mb-4">
            <UAvatar
              :size="40"
              :src="userStore.user?.avatar || '/icons/icon-192x192.png'"
              rounded="full"
              class="flex-shrink-0 border border-surface-border"
            />
            <div class="flex-1 min-w-0">
              <textarea
                v-model="replyText"
                placeholder="返信を書く..."
                class="textarea-field"
                rows="2"
                :disabled="!isAuthenticated"
              />
            </div>
          </div>
          <button
            :disabled="!replyText.trim() || !isAuthenticated"
            class="btn-brand text-sm px-6 py-2.5 touch-target"
            @click="createReply"
          >
            返信を送信
          </button>
        </div>

        <div v-if="replies.length === 0" class="text-center py-16 text-text-muted">
          <p>返信はまだありません。</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="reply in replies"
            :key="reply.id"
            class="card-glass p-4 border-l-2 border-brand hover:bg-surface-elevated transition-colors"
          >
            <div class="flex gap-3 mb-2">
              <UAvatar :size="32" :src="reply.user.avatar" rounded="full" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-1.5 mb-1">
                  <NuxtLink
                    :to="`/@${reply.user.username}`"
                    class="text-sm font-bold text-text hover:text-brand transition-colors"
                  >{{ reply.user.displayName }}</NuxtLink>
                  <span class="text-xs text-text-muted">@{{ reply.user.username }}</span>
                  <span class="text-xs text-text-muted">· {{ relativeTime(reply.createdAt) }}</span>
                </div>
                <div class="text-sm text-text leading-relaxed">{{ reply.content }}</div>
              </div>
            </div>
            <div class="post-actions mt-2">
              <button class="post-action text-xs touch-target" @click="toggleLike(reply.id)">
                <UIcon name="heroicons:heart" size="16" class="touch-target" />
                <span class="touch-target">{{ reply.likes }}</span>
              </button>
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
import { useAppToast } from '~/composables/useAppToast'
import { useRelativeTime } from '~/composables/useRelativeTime'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from '#app'
import type { Post } from '~/types'

const route = useRoute()
const postId = route.params.id as string

const userStore = useUserStore()
const postsStore = usePostsStore()
const { success, error: showError } = useAppToast()
const { relativeTime } = useRelativeTime()

const isLoading = ref(false)
const error = ref<string | null>(null)
const post = ref<Post | null>(null)
const replies = ref<Post[]>([])
const replyText = useState('reply-text', () => '')

const isAuthenticated = computed(() => !!userStore.token)

onMounted(async () => {
  await fetchPost()
})

const fetchPost = async () => {
  isLoading.value = true
  error.value = null
  try {
    const data = await $fetch<{ post: Post }>(`/api/posts/${postId}`, {
      headers: userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {},
    })
    post.value = data.post
    await postsStore.fetchPosts()
    replies.value = postsStore.posts.filter((p: Post) => p.replyTo === postId)
  } catch (e) {
    error.value = e?.message || '投稿の取得に失敗しました'
    showError('エラー', error.value)
  } finally {
    isLoading.value = false
  }
}

const toggleLike = async () => {
  if (!post.value) return
  await postsStore.toggleLike(post.value.id)
  await fetchPost()
}

const toggleRepost = async () => {
  if (!post.value) return
  await postsStore.toggleRepost(post.value.id)
  await fetchPost()
}

const createReply = async () => {
  if (!replyText.value.trim()) return
  if (!isAuthenticated.value) return
  try {
    await postsStore.replyToPost(postId, replyText.value)
    replyText.value = ''
    await fetchPost()
    success('返信を投稿しました')
  } catch (e) {
    showError('エラー', '返信の投稿に失敗しました')
  }
}

const replyToPost = async () => {
}

const openImage = (url: string) => {
  window.open(url, '_blank')
}
</script>