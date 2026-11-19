<template>
  <div class="home-page min-h-[calc(100vh-4rem)] bg-surface relative">
    <!-- Compose Box -->
    <div class="compose-section max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div class="tweet-compose reveal-item reveal-delay-1 hover-card">
        <div class="flex gap-3 mb-4">
          <UAvatar
            :size="48"
            :src="userStore.user?.avatar || '/icons/icon-192x192.png'"
            rounded="full"
            class="flex-shrink-0 border border-surface-border touch-target"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-2">
              <span class="text-sm font-bold text-text">{{ userStore.user?.displayName || 'ユーザー' }}</span>
              <span class="text-xs text-text-muted">@{{ userStore.user?.username || 'user' }}</span>
            </div>
            <textarea
              v-model="composeText"
              placeholder="いま何が起きていますか？"
              class="textarea-field"
              rows="3"
            />
            <!-- Image preview -->
            <div v-if="composeImage" class="mt-3 relative group">
              <img :src="composeImage" alt="プレビュー" class="w-full h-48 object-cover rounded-xl border border-surface-border" />
              <button
                @click="removeComposeImage"
                class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors touch-target"
                aria-label="画像を削除"
              >
                <UIcon name="heroicons:x-mark" size="16" />
              </button>
            </div>
            <!-- Image attach button -->
            <div class="mt-2 flex items-center gap-2">
              <label class="cursor-pointer flex items-center gap-1.5 text-xs text-brand hover:text-brand-glow transition-colors touch-target" @click="openImagePicker">
                <UIcon name="heroicons:image" size="14" />
                <span>画像を追加</span>
              </label>
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>
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
            :disabled="!composeText.trim() && !composeImage || isLoading || !isAuthenticated.value"
            class="btn-brand text-sm px-6 py-2.5 touch-target"
            @click="createPost"
          >
            ポスト
          </button>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <div v-if="isLoading && postsStore.posts.length === 0" class="flex justify-center py-20">
        <div class="skeleton-text w-48 mb-2" />
        <div class="skeleton-text w-64" />
        <div class="skeleton-avatar" />
      </div>

      <div v-else-if="postsStore.posts.length > 0" class="space-y-4">
        <div
          v-for="post in postsStore.posts"
          :key="post.id"
          class="card-glass p-5 reveal-item group fade-in"
        >
          <div class="flex gap-3 mb-3">
            <UAvatar
              :size="40"
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
              <div class="text-sm leading-relaxed whitespace-pre-line mb-3">{{ post.content }}</div>
              <div v-if="post.imageUrl" class="mt-2 rounded-xl overflow-hidden border border-surface-border">
                <img :src="post.imageUrl" alt="" class="w-full h-48 object-cover" />
              </div>
            </div>
          </div>

          <div class="post-actions">
            <button
              class="post-action"
              :class="{ active: post.liked, liked: post.liked }"
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
        <div class="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6 text-brand animate-pulse-glow">
          <UIcon name="heroicons:feather" size="40" />
        </div>
        <h3 class="text-lg font-bold text-text mb-2">まだポストがありません</h3>
        <p class="text-text-muted text-sm max-w-xs mx-auto">最初のポストを投稿して、会話を始めましょう。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { usePostsStore } from '~/stores/posts'
import { computed, onMounted, ref } from 'vue'
import { useAppToast } from '~/composables/useAppToast'
import { useRelativeTime } from '~/composables/useRelativeTime'

const userStore = useUserStore()
const postsStore = usePostsStore()
const { success, error } = useAppToast()
const { relativeTime } = useRelativeTime()

const composeText = useState('compose-text', () => '')
const isLoading = useState('compose-loading', () => false)
const composeImage = useState('compose-image', () => '')
const imageInput = ref<HTMLInputElement | null>(null)

const isAuthenticated = computed(() => !!userStore.token)

onMounted(() => {
  postsStore.fetchPosts()
})

const openImagePicker = () => {
  imageInput.value?.click()
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error('無効なファイル', '画像ファイルを選択してください')
    return
  }
  composeImage.value = URL.createObjectURL(file)
}

const removeComposeImage = () => {
  if (composeImage.value) {
    URL.revokeObjectURL(composeImage.value)
  }
  composeImage.value = ''
}

const createPost = async () => {
  if (!composeText.trim() && !composeImage.value) return
  if (!isAuthenticated.value) return
  isLoading.value = true
  try {
    await postsStore.createPost(composeText.trim(), composeImage.value || undefined)
    composeText.value = ''
    removeComposeImage()
    success('ポストを投稿しました')
  } catch (e) {
    error('投稿に失敗しました', e?.message || 'もう一度お試しください')
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
</script>
