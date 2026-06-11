import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

export async function createPost(userId: string, displayName: string, imageUrl: string, caption: string) {
  await addDoc(collection(db, 'posts'), {
    userId,
    displayName,
    imageUrl,
    caption,
    likes: [],
    reactions: {},
    comments: [],
    createdAt: serverTimestamp(),
  })
}

export async function getPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function toggleReaction(postId: string, userId: string, emoji: string, currentReaction: string | null) {
  const postRef = doc(db, 'posts', postId)
  const updates: Record<string, any> = {}

  // Remove old reaction if exists
  if (currentReaction) {
    updates[`reactions.${currentReaction}`] = arrayRemove(userId)
  }

  // Add new reaction only if different from current (toggle off if same)
  if (currentReaction !== emoji) {
    updates[`reactions.${emoji}`] = arrayUnion(userId)
  }

  await updateDoc(postRef, updates)
}

export async function addComment(postId: string, userId: string, displayName: string, text: string) {
  const postRef = doc(db, 'posts', postId)
  await updateDoc(postRef, {
    comments: arrayUnion({
      userId,
      displayName,
      text,
      createdAt: new Date().toISOString(),
    })
  })
}