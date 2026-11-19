<template>
  <div class="pointer-events-none fixed top-0 right-0 z-[60] w-full h-full">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
    />
  </div>
</template>

<script setup lang="ts">
import { useAppToast } from '~/composables/useAppToast'
import Toast from './Toast.vue'

const { toasts } = useAppToast()
</script>
