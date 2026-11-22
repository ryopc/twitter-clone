<template>
  <div class="default-layout min-h-screen bg-surface text-text transition-colors duration-300 relative overflow-hidden">
    <!-- Decorative aurora blobs -->
    <div class="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand/10 blur-[200px] -z-10 animate-float"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[200px] -z-10 animate-float" style="animation-delay: 2s"></div>

    <!-- Left Sidebar (Desktop) -->
    <aside class="sidebar fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-border transition-all duration-300 transform -translate-x-full sm:translate-x-0">
      <div class="flex flex-col h-full">
        <!-- Brand -->
        <div class="flex items-center gap-2 px-6 py-6">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/40">
            <span class="text-xs font-black uppercase tracking-wider">S</span>
          </div>
          <span class="text-xl font-black text-text tracking-tighter">Skybird</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.to"
            class="nav-item"
            :class="{ active: isActive(item.to) }"
            exact
          >
            <UIcon :name="item.icon" size="20" class="icon text-text-muted transition-colors" />
            <span class="transition-colors">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Bottom: User profile + settings -->
        <div class="px-4 py-6 border-t border-surface-border">
          <div class="flex items-center gap-3 cursor-pointer mb-6 group" @click="toggleUserMenu">
            <UAvatar :size="40" :src="userStore.user?.avatar || '/icons/icon-192x192.png'" class="avatar-md avatar-border" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-text truncate">{{ userStore.user?.displayName || 'ユーザー' }}</p>
              <p class="text-xs text-text-muted truncate">@{{ userStore.user?.username || 'user' }}</p>
            </div>
            <UIcon name="heroicons:chevron-down" size="16" class="text-text-muted transition-transform group-hover:rotate-180" />
          </div>

          <div class="space-y-1">
            <button class="nav-item text-text hover:text-brand" @click="logout">
              <UIcon name="heroicons:logout" size="20" class="text-text-muted" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="showMobileNav" class="fixed inset-0 z-40 bg-surface/95 backdrop-blur-sm transition-opacity" @click="showMobileNav = false"></div>

    <!-- Main Content -->
    <main class="main-content relative z-10 pt-16 sm:pt-0 sm:ml-64 transition-all duration-300">
      <!-- Top Header -->
      <header class="top-header fixed top-0 left-0 right-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Mobile toggle -->
            <button
              v-if="!userStore.user"
              class="mr-2 sm:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-elevated transition-colors"
              @click="showMobileNav = true"
            >
              <UIcon name="heroicons:menu" size="20" />
            </button>

            <!-- Center: Search -->
            <div class="hidden sm:flex items-center flex-1 max-w-[450px] mx-4">
              <div class="relative w-full">
                <UIcon name="heroicons:magnifying-glass" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="検索"
                  class="w-full bg-surface-input border border-surface-border rounded-full pl-10 pr-4 py-2.5 text-sm text-text placeholder-text-dim focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-3">
              <template v-if="userStore.user">
                <UButton
                  icon="heroicons:bell"
                  size="sm"
                  variant="ghost"
                  as="nuxt-link"
                  to="/notifications"
                  class="text-text-muted hover:text-text hover:bg-surface-elevated transition-colors w-9 h-9 rounded-full flex items-center justify-center p-0"
                  :aria-label="'通知 (' + notificationStore.unreadCount + ')'"
                />
                <UButton
                  icon="heroicons:chat-bubble-oval-left"
                  size="sm"
                  variant="ghost"
                  as="nuxt-link"
                  to="/messages"
                  class="text-text-muted hover:text-text hover:bg-surface-elevated transition-colors w-9 h-9 rounded-full flex items-center justify-center p-0"
                />
                <NuxtLink to="/" class="btn-brand text-sm px-5 py-2.5">ポスト</NuxtLink>
                <UAvatar
                  :size="36"
                  :src="userStore.user.avatar"
                  rounded="full"
                  class="cursor-pointer border border-surface-border hover:border-brand transition-colors avatar-border touch-target relative"
                  :to="`/@${userStore.user.username}`"
                  @click.stop="toggleUserMenu"
                />
                <UButton
                  icon="heroicons:moon"
                  size="sm"
                  variant="ghost"
                  :icon-pack="'ph'"
                  @click="toggleDarkMode"
                  class="text-text-muted hover:text-text transition-colors w-8 h-8 rounded-full flex items-center justify-center p-0 hidden sm:block touch-target"
                  :title="isDark ? 'ライトモード' : 'ダークモード'"
                />
              </template>
              <template v-else>
                <div class="flex items-center gap-2">
                  <NuxtLink to="/login" class="text-sm font-medium text-text hover:text-brand transition-colors hidden sm:block">ログイン</NuxtLink>
                  <NuxtLink to="/register" class="btn-brand text-sm px-5 py-2.5 hidden sm:block">登録</NuxtLink>
                </div>
              </template>
            </div>

            <!-- User dropdown menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-surface-card border border-surface-border rounded-xl shadow-lg z-50 fade-in"
            >
              <div class="py-2">
                <NuxtLink
                  :to="`/@${userStore.user.username}`"
                  class="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-elevated transition-colors touch-target"
                >
                  <UIcon name="heroicons:user" size="18" class="text-text-muted" />
                  <span>プロフィール</span>
                </NuxtLink>
                <div class="px-4 py-1 text-xs text-text-muted uppercase tracking-wider font-medium">設定</div>
                <NuxtLink
                  to="/settings"
                  class="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-elevated transition-colors touch-target"
                >
                  <UIcon name="heroicons:cog" size="18" class="text-text-muted" />
                  <span>アカウント設定</span>
                </NuxtLink>
                <NuxtLink
                  to="/settings/appearance"
                  class="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-elevated transition-colors touch-target"
                >
                  <UIcon name="heroicons:palette" size="18" class="text-text-muted" />
                  <span>外観</span>
                </NuxtLink>
                <div class="border-t border-surface-border"></div>
                <button
                  @click="logout"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-red-500/10 transition-colors touch-target"
                >
                  <UIcon name="heroicons:logout" size="18" class="text-destructive" />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content pt-20 sm:pt-0 min-h-[calc(100vh-4rem)]">
        <slot />
      </div>
    </main>

    <!-- PWA Install Prompt -->
    <UNotification
      v-if="installPrompt && !isInstalled"
      color="info"
      dismissible
      :action="{
        label: 'インストール',
        onClick: () => installApp(),
      }"
      class="fixed bottom-6 right-6 z-50 max-w-md card-glass"
    >
      Skybird をアプリとしてインストールしませんか？
    </UNotification>

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useNotificationStore } from '~/stores/notification'
import { usePWA } from '~/composables/usePWA'
import { useDarkMode } from '~/composables/useDarkMode'
import { useRoute } from '#app'
import ToastContainer from '~/components/ToastContainer.vue'

const route = useRoute()
const { installPrompt, isInstalled, installApp } = usePWA()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const { isDark, toggleDarkMode } = useDarkMode()

const showMobileNav = useState('mobile-nav', () => false)
const showUserMenu = useState('user-menu', () => false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Close dropdown when clicking outside
if (process.client) {
  document.addEventListener('click', (e) => {
    if (showUserMenu.value) {
      showUserMenu.value = false
    }
  })
}

const navItems = [
  { key: 'home', to: '/', label: 'ホーム', icon: 'heroicons:home' },
  { key: 'search', to: '/search', label: '検索', icon: 'heroicons:magnifying-glass' },
  { key: 'notifications', to: '/notifications', label: '通知', icon: 'heroicons:bell' },
  { key: 'messages', to: '/messages', label: 'メッセージ', icon: 'heroicons:chat-bubble-oval-left' },
  { key: 'trends', to: '/trends', label: 'トレンド', icon: 'heroicons:trending-up' },
]

const isActive = (to) => route.path === to || (to !== '/' && route.path.startsWith(to))

const logout = async () => {
  await userStore.logout()
  await navigateTo('/login')
}
</script>
