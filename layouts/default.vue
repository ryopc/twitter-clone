<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-500 relative overflow-hidden">
    <!-- Decorative gradient blobs -->
    <div class="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand/20 blur-[120px] -z-10"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] -z-10"></div>

    <UHeader fixed class="bg-surface/80 backdrop-blur-md border-b border-border/50 z-20">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="flex items-center justify-between h-20">
          <NuxtLink to="/" class="flex items-center gap-3 text-xl font-bold tracking-tighter">
            <div class="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand/40">
              <span class="text-xs font-black uppercase tracking-widest">S</span>
            </div>
            <span class="bg-clip-text text-transparent bg-gradient-to-br from-brand via-accent to-white">Skybird</span>
          </NuxtLink>

          <div class="flex items-center gap-6">
            <template v-if="userStore.user">
              <UBadge :value="notificationStore.unreadCount" :bordered="false" class="ml-2" />
              <UButton
                icon="heroicons:bell"
                size="sm"
                variant="ghost"
                as="nuxt-link"
                to="/notifications"
                class="text-text-muted hover:text-text transition-colors"
              />
              <UButton
                icon="heroicons:moon"
                size="sm"
                variant="ghost"
                :icon-pack="'ph'"
                @click="toggleDarkMode"
                class="text-text-muted hover:text-text transition-colors"
                :title="isDark ? 'ライトモード' : 'ダークモード'"
              />
              <UAvatar
                :size="32"
                :src="userStore.user.avatar"
                rounded="full"
                class="cursor-pointer border border-white/20"
                :to="`/@${userStore.user.username}`"
              />
            </template>
          </div>
        </div>
      </div>
    </UHeader>

    <main class="relative z-10">
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
      class="fixed bottom-6 right-6 z-50 max-w-md"
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
