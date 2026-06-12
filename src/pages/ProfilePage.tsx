import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useProfile } from '../hooks/useProfile'
import { usePostStore } from '../store/usePostStore'
import { ArrowLeft, Edit2, Check, X } from 'lucide-react'

const GAMES = ['MLBB', 'Valorant', 'COD Mobile', 'Free Fire', 'Ragnarok']

interface Props {
  onBack: () => void
}

export default function ProfilePage({ onBack }: Props) {
  const { user } = useAuthStore()
  const { profile, loading, updateProfile } = useProfile(user?.uid)
  const { posts } = usePostStore()

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [gameTag, setGameTag] = useState('')
  const [mainGame, setMainGame] = useState('')
  const [saving, setSaving] = useState(false)

  const myPosts = posts.filter(p => p.userId === user?.uid)

  const startEdit = () => {
    setBio(profile?.bio || '')
    setGameTag(profile?.gameTag || '')
    setMainGame(profile?.mainGame || '')
    setEditing(true)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await updateProfile(user.uid, { bio, gameTag, mainGame })
    setSaving(false)
    setEditing(false)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-violet-100 animate-pulse" />
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-extrabold text-gray-900">Profile</span>
        {!editing ? (
          <button onClick={startEdit} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        ) : (
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition">
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={handleSave} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 transition">
              <Check className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 flex flex-col gap-5">

        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-linear-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-2xl font-extrabold text-white">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900">{user?.displayName || 'Anonymous'}</p>
            <p className="text-xs text-gray-400 font-semibold">{user?.email}</p>
            {profile?.gameTag && (
              <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 bg-violet-50 text-violet-500 rounded-md border border-violet-100">
                🎮 {profile.gameTag}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: myPosts.length, label: 'Posts' },
            { val: myPosts.reduce((acc, p) => acc + (p.reactions?.['❤️']?.length || 0), 0), label: 'Likes' },
            { val: myPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 0), label: 'Comments' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-violet-50 rounded-2xl px-4 py-3 text-center border border-violet-100">
              <p className="text-lg font-extrabold text-violet-600">{val}</p>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Bio</p>
          {editing ? (
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the squad about yourself..."
              rows={3}
              className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-violet-300 transition placeholder-gray-300 resize-none"
            />
          ) : (
            <p className="text-xs text-gray-600 font-semibold">{profile?.bio || 'No bio yet.'}</p>
          )}
        </div>

        {/* Game Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Game Info</p>

          <div>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Game Tag</p>
            {editing ? (
              <input
                value={gameTag}
                onChange={e => setGameTag(e.target.value)}
                placeholder="e.g. JeffDoria#1234"
                className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-violet-300 transition placeholder-gray-300"
              />
            ) : (
              <p className="text-xs font-extrabold text-gray-700">{profile?.gameTag || '—'}</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 mb-1">Main Game</p>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {GAMES.map(g => (
                  <button
                    key={g}
                    onClick={() => setMainGame(g)}
                    className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border transition ${
                      mainGame === g
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-violet-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs font-extrabold text-gray-700">{profile?.mainGame || '—'}</p>
            )}
          </div>
        </div>

        {/* My Posts */}
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">My Posts</p>
          {myPosts.length === 0 ? (
            <p className="text-xs text-gray-300 font-semibold text-center py-8">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {myPosts.map(p => (
                <img key={p.id} src={p.imageUrl} className="aspect-square object-cover rounded-xl w-full" />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}