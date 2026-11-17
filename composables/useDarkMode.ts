import { useColorMode } from '#imports'

export const useDarkMode = () => {
  const colorMode = useColorMode()

  const toggleDarkMode = () => {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  const isDark = computed(() => colorMode.value === 'dark')

  return {
    isDark,
    toggleDarkMode,
    colorMode,
  }
}
