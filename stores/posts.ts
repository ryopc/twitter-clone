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
      const data = await $fetch<{ posts: Post[] }>('/api/posts')
      posts.value = (data.posts || []).sort((a, b) => b.createdAt - a.createdAt)
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
      const data = await $fetch<{ post: Post }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, imageUrl }),
      })
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
    const post = posts.value.find((p) => p.id === postId)
    const originalLikes = post?.likes
    const originalLiked = post?.liked

    if (post) {
      post.likes = post.liked ? post.likes - 1 : post.likes + 1
      post.liked = !post.liked
    }

    try {
      await $fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    } catch (e) {
      if (post) {
        post.likes = originalLikes
        post.liked = originalLiked
      }
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    }
  }

  const toggleRepost = async (postId: string) => {
    const post = posts.value.find((p) => p.id === postId)
    const originalReposts = post?.reposts
    const originalReposted = post?.reposted

    if (post) {
      post.reposts = post.reposted ? post.reposts - 1 : post.reposts + 1
      post.reposted = !post.reposted
    }

    try {
      await $fetch(`/api/posts/${postId}/repost`, { method: 'POST' })
    } catch (e) {
      if (post) {
        post.reposts = originalReposts
        post.reposted = originalReposted
      }
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    }
  }

  const replyToPost = async (parentId: string, content: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/posts/reply', {
        method: 'POST',
        body: JSON.stringify({ parentId, content }),
      })
      posts.value.unshift(data.post)
      return data.post
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const createQuotePost = async (quoteOf: string, content: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/posts/quote', {
        method: 'POST',
        body: JSON.stringify({ quoteOf, content }),
      })
      posts.value.unshift(data.post)
      return data.post
    } catch (e) {
      error.value = e instanceof Error ? e.message : '不明なエラー'
      throw e
    } finally {
      isLoading.value = false
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
    toggleRepost,
    replyToPost,
    createQuotePost,
    setPosts,
    addPost,
  }
})
