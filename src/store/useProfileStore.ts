import { create } from 'zustand'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

interface Profile {
  uid: string
  displayName: string
  email: string
  bio?: string
  gameTag?: string
  mainGame?: string
  photoURL?: string
}

interface ProfileStore {
  profile: Profile | null
  loading: boolean
  fetchProfile: (uid: string) => Promise<void>
  updateProfile: (uid: string, data: Partial<Profile>) => Promise<void>
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,

  fetchProfile: async (uid) => {
    set({ loading: true })
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      set({ profile: snap.data() as Profile })
    }
    set({ loading: false })
  },

  updateProfile: async (uid, data) => {
    await updateDoc(doc(db, 'users', uid), data)
    set(state => ({ profile: state.profile ? { ...state.profile, ...data } : null }))
  }
}))