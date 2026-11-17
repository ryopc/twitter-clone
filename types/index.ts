export interface User {
  id: string
  displayName: string
  username: string
  avatar?: string
  bio?: string
  headerImage?: string
  createdAt: number
}

export interface Post {
  id: string
  user: User
  content: string
  imageUrl?: string
  createdAt: number
  likes: number
  liked: boolean
  reposts: number
  reposted: boolean
  repostedBy: string[]
  replies: number
  replyTo?: string
  quoteOf?: string
  quotedBy: string[]
}

export interface AuthResponse {
  user: User
  token: string
}

export interface FollowStatus {
  following: boolean
  followersCount: number
  followingCount: number
}
