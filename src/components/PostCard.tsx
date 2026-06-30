import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTimeAgo } from '../lib/formatTimeAgo'

interface Comment {
  displayName: string
  text: string
}

interface Post {
  id: string
  userId: string
  displayName: string
  imageUrl: string
  caption?: string
  createdAt: any
  reactions?: Record<string, string[]>
  comments?: Comment[]
}

interface Props {
  post: Post
  user: any
  toggleReaction: (postId: string, uid: string, emoji: string, remove: string | null) => void
  addComment: (postId: string, uid: string, displayName: string, text: string) => Promise<void>
}

export default function PostCard({ post, user, toggleReaction, addComment }: Props) {
  const navigate = useNavigate()
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleComment = async () => {
    const text = commentText.trim()
    if (!text || !user) return
    await addComment(post.id, user.uid, user.displayName || user.email || 'Anonymous', text)
    setCommentText('')
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-violet-200 transition">

      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(`/profile/${post.userId}`)}
        >
          <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xs font-extrabold text-white">
              {post.displayName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900 leading-tight hover:underline">{post.displayName}</p>
            <p className="text-[10px] text-gray-400 font-bold">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-1 bg-violet-50 text-violet-600 rounded-md border border-violet-100 shrink-0">
          🎮 MLBB
        </span>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="text-xs text-gray-700 font-semibold px-3 pb-2">{post.caption}</p>
      )}

      {/* Image */}
      <img src={post.imageUrl} className="w-full object-cover aspect-square" />

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-50">
        <button
          onClick={() => {
            const liked = post.reactions?.['❤️']?.includes(user!.uid) ?? false
            toggleReaction(post.id, user!.uid, '❤️', liked ? '❤️' : null)
          }}
          className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg transition ${
            post.reactions?.['❤️']?.includes(user!.uid)
              ? 'bg-red-50 text-red-500 border border-red-100'
              : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-400 hover:border-red-100'
          }`}
        >
          {post.reactions?.['❤️']?.includes(user!.uid) ? '❤️' : '🤍'} {post.reactions?.['❤️']?.length || 0}
        </button>

        <button
          onClick={() => setShowComments(prev => !prev)}
          className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 hover:bg-violet-50 hover:text-violet-500 hover:border-violet-100 transition"
        >
          💬 {post.comments?.length || 0}
        </button>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] font-extrabold text-violet-300 uppercase tracking-widest">GG WP</span>
        </div>
      </div>

      {/* Comment Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col max-h-[70vh]">

            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-sm font-extrabold text-gray-900">Comments</h2>
              <button onClick={() => setShowComments(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
              {!post.comments?.length ? (
                <p className="text-xs text-gray-300 font-semibold text-center py-8">No comments yet. Be the first!</p>
              ) : (
                post.comments.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-violet-500">{c.displayName?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                      <p className="text-xs font-extrabold text-gray-800">{c.displayName}</p>
                      <p className="text-xs text-gray-600">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="px-3 py-2 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-2xl transition"
              >
                Post
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}