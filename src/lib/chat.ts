import {
  collection, doc, setDoc, addDoc, query,
  orderBy, onSnapshot, serverTimestamp,
  getDocs, getDoc, where, updateDoc
} from 'firebase/firestore'
import { db } from './firebase'

// Generate a consistent conversation ID from two user UIDs
export function getConversationId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_')
}

// Create or get a conversation between two users
export async function getOrCreateConversation(
  myUid: string,
  myName: string,
  otherUid: string,
  otherName: string
) {
  const convId = getConversationId(myUid, otherUid)
  const convRef = doc(db, 'conversations', convId)
  const convSnap = await getDoc(convRef)

  if (!convSnap.exists()) {
    await setDoc(convRef, {
      participants: [myUid, otherUid],
      participantNames: { [myUid]: myName, [otherUid]: otherName },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  }
  return convId
}

// Send a message
export async function sendMessage(convId: string, senderUid: string, senderName: string, text: string) {
  const messagesRef = collection(db, 'conversations', convId, 'messages')
  await addDoc(messagesRef, {
    senderUid,
    senderName,
    text,
    createdAt: serverTimestamp(),
  })
  // Update last message on conversation doc
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  })
}

// Subscribe to messages in a conversation (real-time)
export function subscribeToMessages(
  convId: string,
  callback: (messages: any[]) => void
) {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

// Subscribe to all conversations for a user (real-time)
export function subscribeToConversations(
  uid: string,
  callback: (convs: any[]) => void
) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid)
  )
  return onSnapshot(q, (snap) => {
    const convs = snap.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => {
        const aTime = a.lastMessageAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0
        const bTime = b.lastMessageAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0
        return bTime - aTime
      })
    callback(convs)
  })
}

export async function fetchAllUsers(currentUid: string) {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() as any }))
    .filter(u => u.uid !== currentUid)
}
export async function setTyping(convId: string, uid: string, isTyping: boolean) {
  await updateDoc(doc(db, 'conversations', convId), {
    [`typing.${uid}`]: isTyping
  })
}

export function subscribeToTyping(
  convId: string,
  myUid: string,
  callback: (isTyping: boolean) => void
) {
  return onSnapshot(doc(db, 'conversations', convId), (snap) => {
    const typing = snap.data()?.typing || {}
    const otherTyping = Object.entries(typing)
      .some(([uid, val]) => uid !== myUid && val === true)
    callback(otherTyping)
  })
}