<template>
  <div class="min-h-screen bg-surface text-text transition-colors duration-300">
    <UHeader fixed class="bg-surface/95 backdrop-blur border-b border-border" />
    <slot />
    <UFooter class="bg-surface border-t border-border mt-auto" />

    <!-- PWA インストールプロンプト -->
    <UNotification
      v-if="installPrompt && !isInstalled"
      color="info"
      dismissible
      :action="{
        label: 'インストール',
        onClick: () => installApp(),
      }"
      class="fixed bottom-4 right-4 z-50 max-w-md"
    >
      Skybird をアプリとしてインストールしませんか？
    </UNotification>
  </div>
</template>

<script setup>
const { installPrompt, isInstalled, installApp } = usePWA();
</script>
