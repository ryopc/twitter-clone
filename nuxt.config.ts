import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  typescript: {
    strict: true,
  },

  css: ['@/assets/css/main.css'],

  ui: {
    icons: {
      dynamic: true,
    },
  },

  imports: {
    dirs: ['stores', 'composables'],
  },

  app: {
    head: {
      title: 'Skybird - オープン SNS クライアント',
      link: [
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  compatibilityDate: '2024-07-01',
})
