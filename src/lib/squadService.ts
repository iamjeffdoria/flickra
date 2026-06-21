import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

export interface SquadPost {
  id: string
  userId: string
  displayName: string
  game: string
  rank: string
  role: string
  region: string
  slots: number
  filledBy: { userId: string; displayName: string }[]
  createdAt: any
}

export async function createSquad(
  userId: string,
  displayName: string,
  game: string,
  rank: string,
  role: string,
  region: string,
  slots: number
) {
  await addDoc(collection(db, 'squads'), {
    userId,
    displayName,
    game,
    rank,
    role,
    region,
    slots,
    filledBy: [],
    createdAt: serverTimestamp(),
  })
}

export async function joinSquad(
  squadId: string,
  userId: string,
  displayName: string,
  currentSlots: number
) {
  const squadRef = doc(db, 'squads', squadId)
  const newSlots = Math.max(currentSlots - 1, 0)

  // Keep the post visible even when full — just update slots and record the joiner
  await updateDoc(squadRef, {
    slots: newSlots,
    filledBy: arrayUnion({ userId, displayName }),
  })
}

export async function deleteSquad(squadId: string) {
  await deleteDoc(doc(db, 'squads', squadId))
}