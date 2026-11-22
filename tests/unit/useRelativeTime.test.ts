import { describe, it, expect, vi } from 'vitest'
import { useRelativeTime } from '~/composables/useRelativeTime'

describe('useRelativeTime', () => {
  const now = Date.now()

  it('現在時刻は「たった今」', () => {
    const { relativeTime } = useRelativeTime()
    expect(relativeTime(now)).toBe('たった今')
  })

  it('1 分前は「1分前」', () => {
    const { relativeTime } = useRelativeTime()
    expect(relativeTime(now - 90 * 1000)).toBe('1分前')
  })

  it('2 時間前は「2時間前」', () => {
    const { relativeTime } = useRelativeTime()
    expect(relativeTime(now - 2 * 3600 * 1000)).toBe('2時間前')
  })

  it('3 日前は「3日前」', () => {
    const { relativeTime } = useRelativeTime()
    expect(relativeTime(now - 3 * 86400 * 1000)).toBe('3日前')
  })

  it('未来日時は「未来」', () => {
    vi.useFakeTimers().setSystemTime(new Date(now))
    const { relativeTime } = useRelativeTime()
    expect(relativeTime(now + 60 * 1000)).toBe('未来')
    vi.useRealTimers()
  })
})
