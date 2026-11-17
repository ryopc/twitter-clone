import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
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

  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  compatibilityDate: '2024-07-01',
})
