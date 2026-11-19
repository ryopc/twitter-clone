<template>
  <transition
    name="toast"
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="toast"
      class="fixed top-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-top-4"
    >
      <div
        class="card-glass p-4 rounded-xl border-l-4 shadow-lg flex items-start gap-3 animate-fade-in"
        :class="toastClasses"
      >
        <div class="flex-shrink-0 mt-0.5">
          <UIcon
            :name="iconName"
            size="20"
            :class="iconClasses"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-text leading-tight">{{ toast.title }}</h4>
          <p v-if="toast.message" class="text-xs text-text-muted mt-0.5 leading-relaxed">
            {{ toast.message }}
          </p>
        </div>
        <button
          class="flex-shrink-0 p-1.5 text-text-muted hover:text-text transition-colors rounded hover:bg-surface-elevated"
          @click="removeToast"
        >
          <UIcon name="heroicons:x-mark" size="14" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppToast } from '~/composables/useAppToast'

const props = defineProps<{
  toast: import('~/composables/useAppToast').Toast
}>()

const { remove } = useAppToast()

const toastClasses = computed(() => {
  const base = 'border-surface-border'
  switch (props.toast.type) {
    case 'success':
      return `${base} border-brand/50`
    case 'error':
      return `${base} border-destructive/50`
    case 'warning':
      return `${base} border-warning/50`
    case 'info':
      return `${base} border-brand/50`
    default:
      return base
  }
})

const iconName = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'heroicons:check-circle'
    case 'error':
      return 'heroicons:circle-exclamation'
    case 'warning':
      return 'heroicons:exclamation-triangle'
    case 'info':
      return 'heroicons:information-circle'
    default:
      return 'heroicons:information-circle'
  }
})

const iconClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-success'
    case 'error':
      return 'text-destructive'
    case 'warning':
      return 'text-warning'
    case 'info':
      return 'text-brand'
    default:
      return 'text-brand'
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
