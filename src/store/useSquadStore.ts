import { create } from 'zustand'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createSquad, joinSquad, deleteSquad } from '../lib/squadService'
import type { SquadPost } from '../lib/squadService'

interface SquadState {
  squads: SquadPost[]
  loading: boolean
  fetchSquads: () => () => void
  addSquad: (
    userId: string,
    displayName: string,
    game: string,
    rank: string,
    role: string,
    region: string,
    slots: number
  ) => Promise<void>
  joinSquad: (squadId: string, userId: string, displayName: string, currentSlots: number) => Promise<void>
  removeSquad: (squadId: string) => Promise<void>
}

export const useSquadStore = create<SquadState>((set) => ({
  squads: [],
  loading: false,
  fetchSquads: () => {
    set({ loading: true })
    const q = query(collection(db, 'squads'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const squads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SquadPost[]
      set({ squads, loading: false })
    })
    return unsubscribe
  },
  addSquad: async (userId, displayName, game, rank, role, region, slots) => {
    await createSquad(userId, displayName, game, rank, role, region, slots)
  },
  joinSquad: async (squadId, userId, displayName, currentSlots) => {
    await joinSquad(squadId, userId, displayName, currentSlots)
  },
  removeSquad: async (squadId) => {
    await deleteSquad(squadId)
  },
}))