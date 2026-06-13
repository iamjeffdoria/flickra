import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { subscribeToConversations, getOrCreateConversation, fetchAllUsers, subscribeToMessages, sendMessage, setTyping, subscribeToTyping } from '../lib/chat'
import { MessageCircle, Search, Send, X } from 'lucide-react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useTypingIndicator } from '../hooks/useTypingIndicator'


export default function NavChatPanel() {
  const { user } = useAuthStore()
  const [showChats, setShowChats] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<{ convId: string; otherName: string } | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [msgText, setMsgText] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
const [otherTyping, setOtherTyping] = useState(false)
  
const { handleTyping, clearTyping } = useTypingIndicator(
    activeConv?.convId ?? '', 
    user?.uid ?? ''
  )

  useBodyScrollLock(showChats)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToConversations(user.uid, setConversations)
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!activeConv) return
    const unsub = subscribeToMessages(activeConv.convId, setMessages)
    return () => unsub()
  }, [activeConv])

  useEffect(() => {
    if (!activeConv || !user) return
    const unsub = subscribeToTyping(activeConv.convId, user.uid, setOtherTyping)
    return () => {
      unsub()
      setTyping(activeConv.convId, user.uid, false)
    }
  }, [activeConv, user])


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (showNewChat) fetchAllUsers(user!.uid).then(setAllUsers)
  }, [showNewChat])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowChats(false)
        setActiveConv(null)
        setShowNewChat(false)
      }
    }
   if (showChats) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showChats])

  const handleMsgTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsgText(e.target.value)
    if (!user || !activeConv) return
    handleTyping()
  }
  const handleSend = async () => {
    if (!msgText.trim() || !user || !activeConv) return
    await clearTyping()
    await sendMessage(activeConv.convId, user.uid, user.displayName || user.email || 'Anonymous', msgText.trim())
    setMsgText('')
  }

  const handleStartChat = async (otherUser: any) => {
    if (!user) return
    const convId = await getOrCreateConversation(
      user.uid, user.displayName || user.email || 'Anonymous',
      otherUser.uid, otherUser.displayName || otherUser.email || 'User'
    )
    setShowNewChat(false)
    setActiveConv({ convId, otherName: otherUser.displayName || otherUser.email || 'User' })
  }

  return (
    <div className="relative" ref={panelRef}>

      {/* Bubble button */}
      <button
        onClick={() => { setShowChats(prev => !prev); setActiveConv(null) }}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition"
      >
        <MessageCircle className="w-5 h-5" />
        {conversations.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
            {conversations.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {showChats && (
       <div className="fixed inset-0 z-[999] sm:z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-80 sm:rounded-2xl sm:shadow-xl sm:border sm:border-gray-100 bg-white flex flex-col overflow-hidden sm:h-[480px] h-[100dvh]">

          {/* New chat overlay */}
          {showNewChat && (
            <div className="absolute inset-0 bg-white sm:rounded-2xl flex flex-col z-10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
                <button onClick={() => setShowNewChat(false)} className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
               <h3 className="text-sm font-extrabold text-gray-900">New Message</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
                {allUsers.length === 0
                  ? <p className="text-xs text-gray-300 text-center py-8">No other users found</p>
                  : allUsers.map((u: any) => (
                    <button key={u.uid} onClick={() => handleStartChat(u)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-violet-50 transition text-left">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-extrabold text-white">{(u.displayName || u.email || 'U')[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">{u.displayName || 'User'}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          )}

          {!activeConv ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowChats(false)} className="sm:hidden p-1 rounded-lg hover:bg-violet-50 text-gray-400 transition">
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-extrabold text-gray-900">Chats</h3>
                </div>
                <button onClick={() => setShowNewChat(true)}
                  className="w-6 h-6 bg-violet-500 hover:bg-violet-600 rounded-lg flex items-center justify-center transition">
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
                  <input placeholder="Search Messenger"
                    className="w-full pl-7 pr-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-violet-300 transition placeholder-gray-300" />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-2xl mb-1">💬</p>
                    <p className="text-xs font-extrabold text-gray-300">No chats yet</p>
                  </div>
                ) : conversations.map((conv) => {
                  const otherEntry = Object.entries(conv.participantNames || {}).find(([uid]) => uid !== user?.uid)
                  const otherName = (otherEntry?.[1] as string) || 'User'
                  return (
                    <button key={conv.id} onClick={() => setActiveConv({ convId: conv.id, otherName })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-violet-50 transition text-left">
                      <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-extrabold text-white">{otherName[0].toUpperCase()}</span>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-gray-900 truncate">{otherName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{conv.lastMessage || 'No messages yet'}</p>
                      </div>
                      <p className="text-[9px] text-gray-300 shrink-0">
                        {conv.lastMessageAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Chat header */}
             
            <div className="sticky top-0 z-10 bg-white flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
                <button onClick={() => setActiveConv(null)} className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-white">{activeConv.otherName[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-900 leading-none">{activeConv.otherName}</p>
                  <p className="text-[9px] text-green-400 font-bold">Active now</p>
                </div>
              </div>

              {/* Messages */}
             <div className="flex-1 overflow-y-auto px-3 py-3">
                <div className="flex flex-col justify-end min-h-full gap-1.5">
                {messages.length === 0 && <p className="text-center text-[10px] text-gray-300 py-6">Say hi! 👋</p>}
                {messages.map((msg) => {
                  const isMe = msg.senderUid === user?.uid
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-[11px] font-semibold ${
                        isMe ? 'bg-violet-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
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
              </div>

              {/* Input */}
              <div className="flex gap-2 px-3 py-2.5 border-t border-gray-100 shrink-0">
                <input
                  value={msgText}
                  onChange={handleMsgTyping}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Aa"
                  className="flex-1 px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
                />
                <button onClick={handleSend} disabled={!msgText.trim()}
                  className="w-8 h-8 flex items-center justify-center bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-xl transition shrink-0">
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  )
}