import { defineStore } from 'pinia'
import type { User, FollowStatus } from '~/types'

export const useUserStore = defineStore('user', () => {
  const user = useState<User | null>('auth-user', () => null)
  const token = useState('auth-token', () => '')
  const isLoading = useState('auth-loading', () => false)

  const setUser = (u: User | null) => {
    user.value = u
  }

  const setToken = (t: string) => {
    token.value = t
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      setUser(res.user)
      setToken(res.token)
      return res
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: {
    displayName: string
    username: string
    email: string
    password: string
  }) => {
    isLoading.value = true
    try {
      const res = await $fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setUser(res.user)
      setToken(res.token)
      return res
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
  }

  const fetchMe = async () => {
    const res = await $fetch('/api/auth/me', {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    setUser(res.user)
    return res.user
  }

  const toggleFollow = async (targetUsername: string) => {
    if (!user.value || !token.value) throw new Error('未認証です')

    const res = await $fetch(`/api/users/${targetUsername}/follow`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })
    return res.following
  }

  const fetchFollowStatus = async (targetUsername: string): Promise<FollowStatus> => {
    if (!token.value) {
      return { following: false, followersCount: 0, followingCount: 0 }
    }

    const res = await $fetch(`/api/users/${targetUsername}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })
    return {
      following: res.following || false,
      followersCount: res.followersCount || 0,
      followingCount: res.followingCount || 0,
    }
  }

  return {
    user,
    token,
    isLoading,
    setUser,
    setToken,
    login,
    register,
    logout,
    fetchMe,
    toggleFollow,
    fetchFollowStatus,
  }
})
