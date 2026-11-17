import { defineStore } from 'pinia'
import type { Post, User } from '~/types'

export const usePostsStore = defineStore('posts', () => {
  const posts = useState<Post[]>('posts', () => [])
  const isLoading = useState('posts-loading', () => false)
  const error = useState<string | null>('posts-error', () => null)

  const fetchPosts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('投稿の取得に失敗しました')
      const data = await res.json()
      posts.value = data.posts || data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
    } finally {
      isLoading.value = false
    }
  }

  const createPost = async (content: string, imageUrl?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl }),
      })
      if (!res.ok) throw new Error('投稿の作成に失敗しました')
      const data = await res.json()
      posts.value.unshift(data.post)
      return data.post
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const toggleLike = async (postId: string) => {
    // 楽観的更新
    const post = posts.value.find((p) => p.id === postId)
    const originalLikes = post?.likes
    const originalLiked = post?.liked

    if (post) {
      post.likes = (post.liked ? post.likes - 1 : post.likes + 1)
      post.liked = !post.liked
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      if (!res.ok) {
        // ロールバック
        if (post) {
          post.likes = originalLikes
          post.liked = originalLiked
        }
        throw new Error('いいねの処理に失敗しました')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    }
  }

  const setPosts = (newPosts: Post[]) => {
    posts.value = newPosts
  }

  const addPost = (post: Post) => {
    posts.value.unshift(post)
  }

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    toggleLike,
    setPosts,
    addPost,
  }
})
