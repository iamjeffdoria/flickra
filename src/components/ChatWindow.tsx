import { useEffect, useRef, useState } from 'react'
import { sendMessage, subscribeToMessages, setTyping, subscribeToTyping } from '../lib/chat'
import { useAuthStore } from '../store/useAuthStore'
import { ArrowLeft, Send } from 'lucide-react'
import { useTypingIndicator } from '../hooks/useTypingIndicator'

interface ChatWindowProps {
  convId: string
  otherName: string
  onBack: () => void
}

export default function ChatWindow({ convId, otherName, onBack }: ChatWindowProps) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const { handleTyping, clearTyping } = useTypingIndicator(convId, user?.uid ?? '')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = subscribeToMessages(convId, setMessages)
    return () => unsub()
  }, [convId])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTyping(convId, user.uid, setOtherTyping)
    return () => {
      unsub()
      // Clear our own typing indicator on unmount
      if (user) setTyping(convId, user.uid, false)
    }
  }, [convId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (!user) return
    handleTyping()
  }

  const handleSend = async () => {
    if (!text.trim() || !user) return
    setSending(true)
    await clearTyping()
    await sendMessage(convId, user.uid, user.displayName || user.email || 'Anonymous', text.trim())
    setText('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-extrabold text-white">{otherName?.[0]?.toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xs font-extrabold text-gray-900">{otherName}</p>
          <p className="text-[10px] text-green-400 font-bold">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-300 font-semibold py-8">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderUid === user?.uid
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs font-semibold ${
                isMe
                  ? 'bg-violet-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-0.5 ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                  {msg.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
       {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-gray-100 shrink-0 bg-white">
        <input
          type="text"
          value={text}
         onChange={handleTextChange}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-9 h-9 flex items-center justify-center bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-2xl transition shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  )
}