import { useState, useEffect } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useSquadStore } from '../store/useSquadStore'
import { useAuthStore } from '../store/useAuthStore'
import SquadMembersModal from './SquadMembersModal'
import type { SquadPost } from '../lib/squadService'
import { openCheckout, LEMON_SQUEEZY_CONFIG } from '../lib/lemonSqueezy'

const GAMES = ['MLBB', 'Valorant', 'COD Mobile', 'Free Fire', 'Ragnarok']


const GAME_COLORS: Record<string, string> = {
  'MLBB': 'bg-blue-50 text-blue-600 border-blue-200',
  'Valorant': 'bg-red-50 text-red-600 border-red-200',
  'COD Mobile': 'bg-green-50 text-green-600 border-green-200',
  'Free Fire': 'bg-orange-50 text-orange-600 border-orange-200',
  'Ragnarok': 'bg-purple-50 text-purple-600 border-purple-200',
}

export default function SquadFinderBar() {
  const { user } = useAuthStore()
  const { squads, fetchSquads, addSquad, joinSquad } = useSquadStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useBodyScrollLock(showForm)
  const [game, setGame] = useState('MLBB')
  const [rank, setRank] = useState('')
  const [role, setRole] = useState('')
  const [region, setRegion] = useState('Visayas')
  const [slots, setSlots] = useState('1')
  const [viewingSquad, setViewingSquad] = useState<SquadPost | null>(null)
  const [paywallSquad, setPaywallSquad] = useState<SquadPost | null>(null)

  useEffect(() => {
    const unsub = fetchSquads()
    return () => unsub?.()
  }, [])

  const handlePostLFG = async () => {
    if (!user || !rank.trim() || !role.trim()) return
    await addSquad(
      user.uid,
      user.displayName || user.email || 'Anonymous',
      game,
      rank.trim(),
      role.trim(),
      region,
      Number(slots)
    )
    setRank('')
    setRole('')
    setShowForm(false)
  }

  const handleJoin = async (squadId: string, currentSlots: number) => {
    if (!user) return
    await joinSquad(squadId, user.uid, user.displayName || user.email || 'Anonymous', currentSlots)
  }

  return (
    <>
      {/* Fixed right-side tab + panel */}
      <div className="fixed right-0 top-1/3 z-40 flex items-start">

        {/* Panel */}
        {isOpen && (
          <div className="bg-white border border-gray-100 shadow-xl rounded-l-2xl w-52 max-h-[60vh] flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider">⚔️ Squad Finder</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded-full">LIVE</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowForm(true) }}
                className="text-[9px] font-extrabold px-2 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 active:scale-95 transition uppercase"
              >
                + LFG
              </button>
            </div>

          {/* Vertical squad list */}
           <div className="flex flex-col gap-2 overflow-y-auto overscroll-contain px-2.5 py-2.5">
              {squads.length === 0 ? (
                <p className="text-[10px] text-gray-300 font-bold text-center py-6">No squads yet. Be first!</p>
              ) : (
               squads.map((squad) => {
                  const alreadyJoined = squad.filledBy?.some(f => f.userId === user?.uid)
                  return (
                    <div
                      key={squad.id}
                      onClick={() => setViewingSquad(squad)}
                      className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm hover:border-violet-200 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${GAME_COLORS[squad.game]}`}>
                          {squad.game}
                        </span>
                        <span className="text-[9px] font-extrabold text-green-500">
                          {squad.slots} slot{squad.slots > 1 ? 's' : ''}
                        </span>
                      </div>
                     <p className="text-xs font-extrabold text-gray-900 truncate">{squad.displayName}</p>
                      <p className="text-[10px] text-violet-500 font-bold">{squad.rank}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate">{squad.role} · {squad.region}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (alreadyJoined || squad.userId === user?.uid || squad.slots <= 0) return
                          setPaywallSquad(squad) // 👈 show paywall instead of joining directly
                        }}
                        disabled={alreadyJoined || squad.userId === user?.uid || squad.slots <= 0}
                        className={`mt-2 w-full text-[9px] font-extrabold py-1 rounded-lg border transition disabled:cursor-not-allowed ${
                          alreadyJoined
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : squad.slots <= 0
                            ? 'bg-gray-50 text-gray-400 border-gray-100'
                            : 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100'
                        }`}
                      >
                        {alreadyJoined
                          ? 'Joined ✓'
                          : squad.userId === user?.uid
                          ? 'Your Post'
                          : squad.slots <= 0
                          ? 'Full'
                          : 'Join Squad'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tab trigger */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="bg-violet-600 text-white rounded-l-xl px-1.5 py-5 flex flex-col items-center gap-1 shadow-lg hover:bg-violet-700 active:scale-95 transition"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
            {isOpen ? '✕ Close' : '⚔️ Squad'}
          </span>
       </button>
      </div>

      {/* Squad Members Modal */}
      {viewingSquad && (
        <SquadMembersModal squad={viewingSquad} onClose={() => setViewingSquad(null)} />
      )}

      {/* Paywall Modal */}
      {paywallSquad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⚔️</div>
              <h2 className="text-base font-extrabold text-gray-900">Join Squad</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">
                Unlock squad joining to team up with
              </p>
              <p className="text-xs font-extrabold text-violet-600 mt-0.5">
                {paywallSquad.displayName}
              </p>
            </div>

            {/* Squad preview */}
            <div className="bg-gray-50 rounded-2xl p-3 mb-4 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${GAME_COLORS[paywallSquad.game]}`}>
                  {paywallSquad.game}
                </span>
                <span className="text-[9px] font-extrabold text-green-500">
                  {paywallSquad.slots} slot{paywallSquad.slots > 1 ? 's' : ''} left
                </span>
              </div>
              <p className="text-xs font-extrabold text-gray-800">{paywallSquad.rank}</p>
              <p className="text-[10px] text-gray-400 font-bold">{paywallSquad.role} · {paywallSquad.region}</p>
            </div>

            {/* What they get */}
            <ul className="text-[10px] font-bold text-gray-500 space-y-1.5 mb-5">
              {['Join any squad instantly', 'Show up in squad member list', 'Priority matching in your region'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (!user?.email) return
                console.log('Variant ID:', LEMON_SQUEEZY_CONFIG.products.premiumSlots) // 👈 debug
                openCheckout(
                  LEMON_SQUEEZY_CONFIG.products.premiumSlots,
                  user.email,
                  user.uid
                )
                handleJoin(paywallSquad.id, paywallSquad.slots)
                setPaywallSquad(null)
              }}
              className="w-full py-3 text-xs font-extrabold text-white bg-violet-600 rounded-xl hover:bg-violet-700 active:scale-95 transition uppercase tracking-wider"
            >
              ⚡ Unlock & Join Squad
            </button>
            <button
              onClick={() => setPaywallSquad(null)}
              className="w-full mt-2 py-2 text-[10px] font-extrabold text-gray-400 hover:text-gray-600 transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* LFG Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Looking for Squad</h2>
                <p className="text-xs text-gray-400 font-bold">Post your LFG request</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg font-bold">✕</button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto overscroll-contain">
              <div>
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 block">Game</label>
                <div className="flex flex-wrap gap-1.5">
                  {GAMES.map(g => (
                    <button
                      key={g}
                      onClick={() => setGame(g)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition ${
                        game === g ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 block">Your Rank</label>
                <input
                  type="text"
                  placeholder="e.g. Mythic, Diamond..."
                  value={rank}
                  onChange={e => setRank(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-400 transition placeholder-gray-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 block">Role Needed</label>
                <input
                  type="text"
                  placeholder="e.g. Jungler, Support..."
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-400 transition placeholder-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 block">Region</label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-400 transition"
                  >
                    <option>Visayas</option>
                    <option>Luzon</option>
                    <option>Mindanao</option>
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 block">Slots</label>
                  <select
                    value={slots}
                    onChange={e => setSlots(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-400 transition"
                  >
                    {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

             <button
                onClick={handlePostLFG}
                disabled={!rank.trim() || !role.trim()}
                className="w-full py-3 text-xs font-extrabold text-white bg-violet-600 rounded-xl hover:bg-violet-700 active:scale-95 disabled:opacity-50 transition uppercase tracking-wider mt-1"
              >
                ⚔️ Post LFG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
