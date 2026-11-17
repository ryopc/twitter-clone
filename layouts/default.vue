<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-300 relative overflow-hidden">
    <!-- Decorative night-sky blobs (atmosphere & depth) -->
    <div class="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-brand/10 blur-[200px] -z-10"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-accent/10 blur-[200px] -z-10"></div>

    <!-- X-style Top Header -->
    <header class="fixed top-0 left-0 right-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Logo -->
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5"
          >
            <div class="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-text-inverse shadow-lg shadow-brand/50">
              <span class="text-xs font-black uppercase tracking-wider">S</span>
            </div>
            <span class="text-xl font-black text-text tracking-tighter">Skybird</span>
          </NuxtLink>

          <!-- Center: Search -->
          <div class="hidden sm:flex items-center flex-1 max-w-[400px] ml-12">
            <div class="relative w-full">
              <UIcon name="heroicons:magnifying-glass" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="検索"
                class="w-full bg-surface-input border border-text-dim/30 rounded-full pl-10 pr-4 py-2 text-sm text-text placeholder-text-dim focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none transition-all"
              />
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-4">
            <template v-if="userStore.user">
              <UButton
                icon="heroicons:bell"
                size="sm"
                variant="ghost"
                as="nuxt-link"
                to="/notifications"
                class="text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                :aria-label="'通知 (' + notificationStore.unreadCount + ')'"
              />
              <UButton
                icon="heroicons:chat-bubble-oval-left"
                size="sm"
                variant="ghost"
                as="nuxt-link"
                to="/messages"
                class="text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
              />
              <button
                class="btn-brand hidden sm:block"
              >
                ポスト
              </button>
              <UAvatar
                :size="32"
                :src="userStore.user.avatar"
                rounded="full"
                class="cursor-pointer border border-text-dim/40 hover:border-brand transition-colors"
                :to="`/@${userStore.user.username}`"
              />
              <UButton
                icon="heroicons:moon"
                size="sm"
                variant="ghost"
                :icon-pack="'ph'"
                @click="toggleDarkMode"
                class="text-text-muted hover:text-text transition-colors hidden sm:block"
                :title="isDark ? 'ライトモード' : 'ダークモード'"
              />
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <NuxtLink to="/login" class="btn-ghost hidden sm:block">ログイン</NuxtLink>
                <NuxtLink to="/register" class="btn-brand hidden sm:block">登録</NuxtLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="relative z-10 pt-20">
      <slot />
    </main>

    <!-- PWA インストールプロンプト -->
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
  </div>
</template>

<script setup>
const { installPrompt, isInstalled, installApp } = usePWA()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const { isDark, toggleDarkMode } = useDarkMode()
</script>