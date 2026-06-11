import { useState } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'

interface MessagesPageProps {
  onClose: () => void
}

export default function MessagesPage({ onClose }: MessagesPageProps) {
  const [activeConv, setActiveConv] = useState<{ convId: string; otherName: string } | null>(null)

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Left panel — conversation list */}
      <div className={`w-full sm:w-80 border-r border-gray-100 flex-col flex shrink-0 ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
        <ChatList
          onSelectConv={(convId, otherName) => setActiveConv({ convId, otherName })}
          onClose={onClose}
        />
      </div>

      {/* Right panel — chat window */}
      <div className={`flex-1 flex-col ${activeConv ? 'flex' : 'hidden sm:flex'}`}>
        {activeConv ? (
          <ChatWindow
            convId={activeConv.convId}
            otherName={activeConv.otherName}
            onBack={() => setActiveConv(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <p className="text-4xl">💬</p>
            <p className="text-sm font-extrabold text-gray-400">Select a conversation</p>
            <p className="text-xs text-gray-300 font-semibold">or start a new one with +</p>
          </div>
        )}
      </div>
    </div>
  )
}