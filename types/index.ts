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

export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender: User
  content: string
  createdAt: number
  read: boolean
}

export interface Conversation {
  id: string
  participantIds: string[]
  participants: User[]
  lastMessage: string
  lastMessageAt: number
  unreadCount: number
}

export interface Trend {
  id: string
  tag: string
  tweetCount: number
  trendingSince: number
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'repost' | 'reply' | 'follow' | 'mention'
  actorId: string
  actor: User
  postId?: string
  content: string
  createdAt: number
  read: boolean
}
