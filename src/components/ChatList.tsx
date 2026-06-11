import { useEffect, useState } from 'react'
import { subscribeToConversations, getOrCreateConversation, fetchAllUsers } from '../lib/chat'
import { useAuthStore } from '../store/useAuthStore'
import { Search, Plus, ArrowLeft } from 'lucide-react'

interface ChatListProps {
  onSelectConv: (convId: string, otherName: string) => void
  onClose: () => void
}

export default function ChatList({ onSelectConv, onClose }: ChatListProps) {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToConversations(user.uid, setConversations)
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (showNewChat) {
      fetchAllUsers(user!.uid).then(setAllUsers)
    }
  }, [showNewChat])

  const handleStartChat = async (otherUser: any) => {
    if (!user || starting) return
    setStarting(true)
    const convId = await getOrCreateConversation(
      user.uid,
      user.displayName || user.email || 'Anonymous',
      otherUser.uid,
      otherUser.displayName || otherUser.email || 'User'
    )
    setShowNewChat(false)
    setStarting(false)
    onSelectConv(convId, otherUser.displayName || otherUser.email || 'User')
  }

  const filtered = conversations.filter((c) => {
    const otherName = Object.entries(c.participantNames || {})
      .find(([uid]) => uid !== user?.uid)?.[1] as string
    return otherName?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
<div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-extrabold text-gray-900">Messages</h2>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-7 h-7 flex items-center justify-center bg-violet-500 hover:bg-violet-600 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-300 transition placeholder-gray-300"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-xs font-extrabold text-gray-400">
                {search ? 'No results found' : 'No conversations yet'}
                </p>
                <p className="text-[10px] text-gray-300 font-semibold mt-1">
                {search ? 'Try a different name' : 'Tap + above to message someone'}
                </p>
                {!search && (
                <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-extrabold rounded-xl transition"
                >
                    + New Message
                </button>
                )}
            </div>
        ) : (
          filtered.map((conv) => {
            const otherEntry = Object.entries(conv.participantNames || {}).find(([uid]) => uid !== user?.uid)
            const otherName = (otherEntry?.[1] as string) || 'User'
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConv(conv.id, otherName)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-violet-50 transition text-left border-b border-gray-50"
              >
                <div className="w-9 h-9 bg-linear-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-white">{otherName?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-gray-900 truncate">{otherName}</p>
                  <p className="text-[10px] text-gray-400 font-semibold truncate">{conv.lastMessage || 'No messages yet'}</p>
                </div>
                <p className="text-[9px] text-gray-300 font-bold shrink-0">
                  {conv.lastMessageAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </button>
            )
          })
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col max-h-[60vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-extrabold text-gray-900">New Message</h3>
              <button onClick={() => setShowNewChat(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
              {allUsers.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-8">No other users found</p>
              ) : (
                allUsers.map((u: any) => (
                  <button
                    key={u.uid}
                    onClick={() => handleStartChat(u)}
                    disabled={starting}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-violet-50 transition text-left"
                  >
                    <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-extrabold text-white">
                        {(u.displayName || u.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">{u.displayName || 'User'}</p>
                      <p className="text-[10px] text-gray-400">{u.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}