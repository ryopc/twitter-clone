<template>
  <div class="auth-layout min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
    <!-- Decorative gradient blobs -->
    <div class="fixed top-[-20%] left-[-20%] w-[700px] h-[700px] rounded-full bg-brand/20 blur-[200px] -z-10"></div>
    <div class="fixed bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[200px] -z-10"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand/5 blur-[150px] -z-10"></div>

    <!-- Hero branding on left (desktop) -->
    <div class="hidden md:flex flex-col items-center justify-center h-full w-1/2 pr-20 text-center">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-14 h-14 rounded-3xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-2xl font-black uppercase tracking-widest shadow-xl shadow-brand/50">
          S
        </div>
        <span class="text-4xl font-black text-white tracking-tighter">Skybird</span>
      </div>
      <h1 class="text-5xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
        新しいソーシャル、<br />
        <span class="text-gradient">あなたの声。</span>
      </h1>
      <p class="text-white/70 text-lg max-w-md leading-relaxed">
        商標に縛られないオープンな SNS。<br />
        PWA 対応、ダークモード、美しいデザイン。
      </p>
      <div class="mt-12 flex gap-4 justify-center">
        <div class="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-brand">
          <UIcon name="heroicons:shield-check" size="20" />
        </div>
        <div class="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-brand">
          <UIcon name="heroicons:phone" size="20" />
        </div>
        <div class="w-12 h-12 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center text-brand">
          <UIcon name="heroicons:desktop-computer" size="20" />
        </div>
      </div>
    </div>

    <!-- Auth card -->
    <div class="flex-1 flex items-center justify-center max-w-md w-full">
      <UCard class="w-full p-8 card-elevated relative z-10">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/40">
            <UIcon name="heroicons:shield-check" size="32" class="text-white" />
          </div>
          <h2 class="text-2xl font-bold text-text">{{ isLogin ? 'ようこそ戻ってきました' : 'アカウントを作成' }}</h2>
          <p class="text-text-muted mt-2">{{ isLogin ? 'アカウントにログインして、会話を始めましょう。' : '新しい Skybird アカウントを登録します。' }}</p>
        </div>

        <slot />
      </UCard>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const isLogin = route.path === '/login'
</script>
