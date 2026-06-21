import { X } from 'lucide-react'
import type { SquadPost } from '../lib/squadService'

interface Props {
  squad: SquadPost
  onClose: () => void
}

export default function SquadMembersModal({ squad, onClose }: Props) {
  const totalSlots = squad.slots + (squad.filledBy?.length || 0)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-60 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col max-h-[70vh]">

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">Squad Members</h2>
            <p className="text-[10px] text-gray-400 font-bold">{squad.game} · {squad.role} · {squad.region}</p>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
          {/* Host */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 rounded-xl border border-violet-100">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-extrabold text-white">
                {squad.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-gray-900">{squad.displayName}</p>
              <p className="text-[10px] text-violet-500 font-bold">{squad.rank} · Host</p>
            </div>
          </div>

          {/* Joined members */}
          {!squad.filledBy?.length ? (
            <p className="text-xs text-gray-300 font-semibold text-center py-6">No one has joined yet.</p>
          ) : (
            squad.filledBy.map((member, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-white">
                    {member.displayName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-gray-800">{member.displayName}</p>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <p className="text-[10px] font-extrabold text-gray-400 text-center uppercase tracking-wider">
            {squad.filledBy?.length || 0} / {totalSlots} slots filled
          </p>
        </div>

      </div>
    </div>
  )
}