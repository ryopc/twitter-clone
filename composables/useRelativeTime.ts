export function useRelativeTime() {
  const relativeTime = (ts: number): string => {
    const sec = Math.floor((Date.now() - ts) / 1000)
    if (sec < 60) return 'たった今'
    if (sec < 3600) return `${Math.floor(sec / 60)}分前`
    if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`
    return `${Math.floor(sec / 86400)}日前`
  }

  return { relativeTime }
}
