import { useState, useRef, useEffect } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useStoryStore } from '../store/useStoryStore'
import { useAuthStore } from '../store/useAuthStore'
import { uploadImage } from '../lib/uploadImage'
import { Plus, X } from 'lucide-react'

export default function StoriesBar() {
  const { user } = useAuthStore()
  const { stories, fetchStories, addStory } = useStoryStore()
  const [viewing, setViewing] = useState<{ uid: string; index: number } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  useBodyScrollLock(!!viewing)

// group ALL stories per user as an array, sorted newest first
  const grouped = Object.values(
    stories.reduce((acc, story) => {
      if (!acc[story.uid]) acc[story.uid] = []
      acc[story.uid].push(story)
      return acc
    }, {} as Record<string, typeof stories[0][]>)
  )

  const myGroup = grouped.find((g) => g[0].uid === user?.uid)
  const othersGroups = grouped.filter((g) => g[0].uid !== user?.uid)
  const orderedGroups = myGroup ? [myGroup, ...othersGroups] : [null, ...othersGroups]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setShowUpload(true)
    }
  }

  const handlePost = async () => {
    if (!file || !user) return
    setUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      await addStory(user.uid, user.displayName || user.email || 'Anonymous', imageUrl)
      setShowUpload(false)
      setFile(null)
      setPreview(null)
    } catch (err) {
      console.error(err)
    }
    setUploading(false)
  }

  const viewingGroup = viewing ? stories.filter((s) => s.uid === viewing.uid) : []
  const viewingStory = viewingGroup[viewing?.index ?? 0] ?? null

return (
  <>
    {/* Single shared file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />

    {/* Stories Row */}
    <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">

        {orderedGroups.map((group, i) => {
        const isMe = i === 0

        if (isMe && !myGroup) {
          return (
            <div key="add-story" className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-violet-100 border-2 border-dashed border-violet-300 flex items-center justify-center hover:bg-violet-200 transition"
              >
                <Plus className="w-5 h-5 text-violet-400" />
              </button>
              <span className="text-[10px] font-bold text-gray-400 w-16 text-center truncate">
                Your story
              </span>
            </div>
          )
        }

        if (!group) return null

        const story = group[0]
        const ringClass = story.uid === user?.uid
          ? 'ring-2 ring-violet-500 ring-offset-2'
          : 'ring-2 ring-pink-400 ring-offset-2'

        return (
          <div key={story.uid} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="relative">
              <button
                onClick={() => setViewing({ uid: story.uid, index: 0 })}
                className={`w-16 h-16 rounded-full overflow-hidden ${ringClass} transition hover:opacity-90`}
              >
                <img src={story.imageUrl} className="w-full h-full object-cover" />
              </button>
              {story.uid === user?.uid && (
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center border-2 border-white shadow"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-400 w-16 text-center truncate">
              {story.uid === user?.uid ? 'Your story' : story.displayName}
            </span>
          </div>
        )
      })}

                    </div>

      {/* Story Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">Add Story</h2>
              <button onClick={() => { setShowUpload(false); setFile(null); setPreview(null) }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {preview && (
              <img src={preview} className="w-full h-64 object-cover rounded-2xl mb-4" />
            )}

            <button
              onClick={handlePost}
              disabled={!file || uploading}
              className="w-full py-3 text-sm font-bold text-white bg-violet-500 rounded-2xl hover:bg-violet-600 disabled:opacity-50 transition"
            >
              {uploading ? 'Posting...' : 'Share Story'}
            </button>
          </div>
        </div>
      )}

     {/* Story Viewer Modal */}
      {viewing && viewingStory && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setViewing(null)}
        >
          <div className="relative w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Progress dots */}
            <div className="flex gap-1 mb-3">
              {viewingGroup.map((_, idx) => (
                <div key={idx} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
                  <div
                    className={`h-full bg-white rounded-full ${
                      idx < viewing.index ? 'w-full' :
                      idx === viewing.index ? 'animate-story-progress' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {viewingStory.displayName?.[0]?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-bold text-white">{viewingStory.displayName}</p>
              <span className="text-xs text-white/50 ml-1">{viewing.index + 1} / {viewingGroup.length}</span>
              <button onClick={() => setViewing(null)} className="ml-auto">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Image */}
            <img
              src={viewingStory.imageUrl}
              className="w-full max-h-[70vh] object-contain rounded-2xl"
            />

            {/* Tap zones for prev/next */}
            <div className="absolute inset-0 flex rounded-2xl" style={{ top: '80px' }}>
              <div
                className="w-1/2 h-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  if (viewing.index > 0)
                    setViewing({ uid: viewing.uid, index: viewing.index - 1 })
                }}
              />
              <div
                className="w-1/2 h-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  if (viewing.index < viewingGroup.length - 1)
                    setViewing({ uid: viewing.uid, index: viewing.index + 1 })
                  else
                    setViewing(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}