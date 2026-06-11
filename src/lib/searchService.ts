import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export interface SearchUser {
  uid: string
  displayName: string
  email: string
}

export async function searchUsers(query: string): Promise<SearchUser[]> {
  if (!query.trim()) return []
  const snapshot = await getDocs(collection(db, 'users'))
  const q = query.toLowerCase()
  return snapshot.docs
    .map(doc => ({ uid: doc.id, ...doc.data() } as SearchUser))
    .filter(u =>
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
}