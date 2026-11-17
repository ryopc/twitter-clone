<template>
  <div class="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="fixed top-[-20%] left-[-20%] w-[700px] h-[700px] rounded-full bg-brand/25 blur-[160px] -z-10"></div>
    <div class="fixed bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-accent/15 blur-[160px] -z-10"></div>

    <!-- Hero branding on left -->
    <div class="hidden md:flex flex-col items-start justify-center h-full w-1/3 pr-20">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand text-xl font-black uppercase tracking-widest shadow-lg">
          S
        </div>
        <span class="text-3xl font-black text-white tracking-tighter">Skybird</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
        新しいソーシャル、<br />
        <span class="text-gradient">あなたの声。</span>
      </h1>
      <p class="text-white/80 text-lg max-w-md leading-relaxed">
        商標に縛られないオープンな SNS。PWA 対応、ダークモード、リアルタイム通信。
      </p>
    </div>

    <!-- Auth card -->
    <div class="flex-1 flex items-center justify-center">
      <UCard class="w-full max-w-md p-8 card-glass relative z-10">
        <slot />
      </UCard>
    </div>
  </div>
</template>
