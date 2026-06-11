import { create } from 'zustand'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createPost, toggleReaction, addComment } from '../lib/postService'

interface Comment {                        // ← add this interface
  userId: string
  displayName: string
  text: string
  createdAt: string
}

interface Post {
  id: string
  userId: string
  displayName: string
  imageUrl: string
  caption: string
  likes: string[]
  reactions: Record<string, string[]>
  comments: Comment[]
  createdAt: any
}

interface PostState {
  posts: Post[]
  loading: boolean
  fetchPosts: () => () => void
  addPost: (userId: string, displayName: string, imageUrl: string, caption: string) => Promise<void>
  toggleReaction: (postId: string, userId: string, emoji: string, currentReaction: string | null) => Promise<void>
  addComment: (postId: string, userId: string, displayName: string, text: string) => Promise<void>
}
export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,
  fetchPosts: () => {
  set({ loading: true })
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]
    set({ posts, loading: false })
  })
  return unsubscribe
 },
  addPost: async (userId, displayName, imageUrl, caption) => {
  await createPost(userId, displayName, imageUrl, caption)
    },
toggleReaction: async (postId, userId, emoji, currentReaction) => {
    await toggleReaction(postId, userId, emoji, currentReaction)
  },
    addComment: async (postId, userId, displayName, text) => {
    await addComment(postId, userId, displayName, text)
    },
}))

