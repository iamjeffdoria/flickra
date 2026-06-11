import { useState, useEffect } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { usePostStore } from '../store/usePostStore'
import { useAuthStore } from '../store/useAuthStore'
import { uploadImage } from '../lib/uploadImage'
import Navbar from '../components/Navbar'
import PostSkeleton from '../components/PostSkeleton'
import StoriesBar from '../components/StoriesBar'
import Sidebar from '../components/Sidebar'
import { Camera, X } from 'lucide-react'
import SquadFinderBar from '../components/SquadFinderBar'
import MessagesPage from '../components/MessagesPage'

export default function HomePage() {
const { user } = useAuthStore()
// AFTER
const { posts, loading, fetchPosts, addPost, toggleReaction, addComment } = usePostStore()
const [showUpload, setShowUpload] = useState(false)
const [caption, setCaption] = useState('')
const [file, setFile] = useState<File | null>(null)
const [preview, setPreview] = useState<string | null>(null)
const [uploading, setUploading] = useState(false)
const [commentText, setCommentText] = useState<Record<string, string>>({})      // ← add
const [showComments, setShowComments] = useState<Record<string, boolean>>({})   // ← add

const [openReactionPostId, setOpenReactionPostId] = useState<string | null>(null)
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
const [activePage, setActivePage] = useState('Home')

const handleComment = async (postId: string) => {// ← add
  const text = commentText[postId]?.trim()
  if (!text || !user) return
  await addComment(postId, user.uid, user.displayName || user.email || 'Anonymous', text)
  setCommentText(prev => ({ ...prev, [postId]: '' }))
}

useEffect(() => {
  const unsub = fetchPosts()
  return () => unsub?.()
}, [])

useBodyScrollLock(Object.values(showComments).some(Boolean))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
        if (preview) URL.revokeObjectURL(preview) // ← cleanup old URL
        setFile(selected)
        setPreview(URL.createObjectURL(selected))
    }
    }

  const handlePost = async () => {
    if (!file || !user) return
    setUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      await addPost(user.uid, user.displayName || user.email || 'Anonymous', imageUrl, caption)
      setShowUpload(false)
      setFile(null)
      setPreview(null)
      setCaption('')
    } catch (err) {
      console.error(err)
    }
    setUploading(false)
  }

return (
<div style={{ fontFamily: "'Nunito', sans-serif" }} className="h-screen overflow-hidden bg-white relative flex flex-col">
  {/* Rainbow top bar */}
  <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-600 via-pink-500 to-orange-400 z-40" />
{/* Gamepad 1 — top right, large, super faint */}
  <svg className="fixed top-24 -right-5 pointer-events-none z-0 opacity-[0.04] text-violet-600 -rotate-12" width="180" height="180" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 6H7C3.69 6 1 8.69 1 12s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm-8 7H8v1a1 1 0 0 1-2 0v-1H5a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2zm7.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
  </svg>
  {/* Gamepad 2 — bottom left, smaller, different angle */}
  <svg className="fixed bottom-32 -left-3.75 pointer-events-none z-0 opacity-[0.04] text-violet-400 rotate-20" width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 6H7C3.69 6 1 8.69 1 12s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm-8 7H8v1a1 1 0 0 1-2 0v-1H5a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2zm7.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
  </svg>

<div className="relative z-10 flex flex-col flex-1">
      <Navbar
        onPostClick={() => setShowUpload(true)}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <div className="flex flex-1">
        <Sidebar
          active={activePage}
          onNavigate={setActivePage}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
  <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-3.5rem)] overflow-y-auto">
    {activePage === 'Messages' ? <MessagesPage onClose={() => setActivePage('Home')} /> : (<>
    {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">New Post</h2>
              <button onClick={() => setShowUpload(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {preview ? (
               <img src={preview} className="w-full aspect-square object-cover rounded-2xl mb-4" />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-52 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-violet-300 transition mb-4">
                <Camera className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm font-semibold text-gray-300">Click to upload photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300 resize-none mb-4"
              rows={3}
            />

          <button
              onClick={handlePost}
              disabled={!file || uploading}
              className="w-full py-3 text-sm font-extrabold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition uppercase tracking-wider"
            >
              {uploading ? '⏳ Uploading...' : '⚔️ Post to Feed'}
            </button>
          </div>
        </div>
      )}

{/* Stories */}
      <div className="max-w-xl mx-auto w-full px-0 pt-2">
        <StoriesBar />
      </div>

      {/* Squad Finder — collapsible */}
      <SquadFinderBar />

      {/* Feed */}
      <main className="max-w-xl mx-auto px-3 pt-4 pb-24 flex flex-col gap-3">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
         <div className="text-center py-20">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-gray-800 font-extrabold text-lg">No posts yet</p>
            <p className="text-gray-400 font-bold text-sm mt-1">Be the first to post your gameplay!</p>
            <div className="inline-block mt-4 px-4 py-2 bg-violet-50 text-violet-600 font-extrabold text-xs rounded-lg border border-violet-100 uppercase tracking-wider">
              ⚔️ Post Your First Clip
            </div>
          </div>
        ) : (
          posts.map((post) => (
           <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-violet-200 transition">

              {/* Post Header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs font-extrabold text-white">
                      {post.displayName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-gray-900 leading-tight">{post.displayName}</p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      {post.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
             {/* AFTER */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-50">
          {/* Like */}
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
              onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 hover:bg-violet-50 hover:text-violet-500 hover:border-violet-100 transition"
            >
              💬 {post.comments?.length || 0}
            </button>

            <div className="ml-auto flex items-center gap-1">
              <span className="text-[10px] font-extrabold text-violet-300 uppercase tracking-widest">GG WP</span>
            </div>
          </div>

{/* Comment Modal */}
{Object.values(showComments).some(Boolean) && (
  <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
    <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col max-h-[70vh]">

      {/* Modal Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-extrabold text-gray-900">Comments</h2>
        <button onClick={() => setShowComments({})}>
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Comments List */}
     <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
        {Object.keys(showComments).length > 0 && (() => {
          const activePost = posts.find(p => showComments[p.id])
          if (!activePost?.comments?.length) return (
            <p className="text-xs text-gray-300 font-semibold text-center py-8">No comments yet. Be the first!</p>
          )
          return activePost.comments.map((c, i) => (
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
        })()}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
        {Object.keys(showComments).map(postId => showComments[postId] && (
          <div key={postId} className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText[postId] || ''}
              onChange={(e) => setCommentText(prev => ({ ...prev, [postId]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleComment(postId)}
              className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
            />
            <button
              onClick={() => handleComment(postId)}
              disabled={!commentText[postId]?.trim()}
              className="px-3 py-2 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-2xl transition"
            >
              Post
            </button>
          </div>
        ))}
      </div>

    </div>
  </div>
)}
            </div>
          ))
        )}
      </main>

</>)}{/* end activePage conditional */}
</div>{/* end flex-1 flex flex-col */}
      </div>{/* end flex flex-1 */}
</div>
    </div>
  )
}