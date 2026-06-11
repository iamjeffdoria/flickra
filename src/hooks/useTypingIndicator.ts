import { useRef } from 'react'
import { setTyping } from '../lib/chat'

export function useTypingIndicator(convId: string, userId: string) {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTyping = () => {
    setTyping(convId, userId, true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(convId, userId, false)
    }, 2000)
  }

  const clearTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setTyping(convId, userId, false)
  }

  return { handleTyping, clearTyping }
}