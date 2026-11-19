import { computed } from 'vue'
import { useState } from '#app'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const TOAST_LIMIT = 5

export function useAppToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 }
    toasts.value = [newToast, ...toasts.value].slice(0, TOAST_LIMIT)

    // Auto-remove after duration
    setTimeout(() => {
      remove(id)
    }, newToast.duration)
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (title: string, message?: string, duration?: number) => {
    add({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    add({ type: 'error', title, message, duration: duration ?? 6000 })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    add({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    add({ type: 'info', title, message, duration })
  }

  return {
    toasts: computed(() => toasts.value),
    add,
    remove,
    success,
    error,
    warning,
    info,
  }
}
