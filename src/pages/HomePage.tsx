import { useState, useEffect } from 'react'
import { usePostStore } from '../store/usePostStore'
import { useAuthStore } from '../store/useAuthStore'
import { uploadImage } from '../lib/uploadImage'
import Navbar from '../components/Navbar'
import PostSkeleton from '../components/PostSkeleton'
import StoriesBar from '../components/StoriesBar'
import Sidebar from '../components/Sidebar'
import { Camera, X } from 'lucide-react'
import PostCard from '../components/PostCard'
import SquadFinderBar from '../components/SquadFinderBar'
import MessagesPage from '../components/MessagesPage'
import ProfilePage from '../pages/ProfilePage'

export default function HomePage() {
const { user } = useAuthStore()
// AFTER
const { posts, loading, fetchPosts, addPost, toggleReaction, addComment } = usePostStore()
const [showUpload, setShowUpload] = useState(false)
const [caption, setCaption] = useState('')
const [file, setFile] = useState<File | null>(null)
const [preview, setPreview] = useState<string | null>(null)
const [uploading, setUploading] = useState(false)


const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
const [activePage, setActivePage] = useState('Home')
const [showProfile, setShowProfile] = useState(false)



useEffect(() => {
  const unsub = fetchPosts()
  return () => unsub?.()
}, [])



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
        onProfileClick={() => setShowProfile(true)}
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
    {showProfile ? <ProfilePage onBack={() => setShowProfile(false)} /> : activePage === 'Messages' ? <MessagesPage onClose={() => setActivePage('Home')} /> : (<>
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
          <PostCard
            key={post.id}
            post={post}
            user={user}
            toggleReaction={toggleReaction}
            addComment={addComment}
          />
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