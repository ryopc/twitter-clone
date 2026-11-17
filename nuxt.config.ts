import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
  ],

  typescript: {
    strict: true,
    shim: true,
  },

  css: ['@/assets/css/main.css'],

  ui: {
    icons: ['heroicons', 'simple-icons'],
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
