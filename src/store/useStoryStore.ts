import { create } from 'zustand'
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Story {
  id: string
  uid: string
  displayName: string
  imageUrl: string
  createdAt: Timestamp
}

interface StoryStore {
  stories: Story[]
  fetchStories: () => void
  addStory: (uid: string, displayName: string, imageUrl: string) => Promise<void>
}

export const useStoryStore = create<StoryStore>((set) => ({
  stories: [],

  fetchStories: () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const q = query(
      collection(db, 'stories'),
      where('createdAt', '>=', Timestamp.fromDate(cutoff)),
      orderBy('createdAt', 'desc')
    )
    onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Story[]
      set({ stories })
    })
  },

  addStory: async (uid, displayName, imageUrl) => {
    await addDoc(collection(db, 'stories'), {
      uid,
      displayName,
      imageUrl,
      createdAt: serverTimestamp(),
    })
  },
}))