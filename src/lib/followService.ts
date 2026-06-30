import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Stored as: follows/{followerId}_{followingId}
// This makes existence-checks and deletes O(1) by doc ID instead of querying.

function followDocId(followerId: string, followingId: string) {
  return `${followerId}_${followingId}`
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) return // can't follow yourself
  const ref = doc(db, 'follows', followDocId(followerId, followingId))
  await setDoc(ref, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  })
}

export async function unfollowUser(followerId: string, followingId: string) {
  const ref = doc(db, 'follows', followDocId(followerId, followingId))
  await deleteDoc(ref)
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const ref = doc(db, 'follows', followDocId(followerId, followingId))
  const snap = await getDoc(ref)
  return snap.exists()
}

export async function getFollowerCount(uid: string): Promise<number> {
  const q = query(collection(db, 'follows'), where('followingId', '==', uid))
  const snap = await getDocs(q)
  return snap.size
}

export async function getFollowingCount(uid: string): Promise<number> {
  const q = query(collection(db, 'follows'), where('followerId', '==', uid))
  const snap = await getDocs(q)
  return snap.size
}