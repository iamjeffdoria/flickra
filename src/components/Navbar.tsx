import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuthStore } from '../store/useAuthStore'
import { Camera, LogOut, Plus, Menu, Search, User } from 'lucide-react'
import NavChatPanel from './NavChatPanel'
import { useState, useRef, useEffect } from 'react'
import SearchBar from './SearchBars'


interface NavbarProps {
  onPostClick: () => void
  onMenuClick?: () => void
  onProfileClick: () => void
}

export default function Navbar({ onPostClick, onMenuClick, onProfileClick }: NavbarProps) {
  const { user } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    setShowConfirm(false)
    setShowDropdown(false)
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
    <div className="flex justify-between items-center w-full">

        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-violet-50 text-gray-400 mr-1"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center w-8 h-8 bg-violet-100 rounded-xl">
            <Camera className="w-4 h-4 text-violet-500" />
          </div>
          <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">Flickra</span>
        </div>

        {/* Search — hidden on mobile */}
       {showMobileSearch ? (
        <div className="absolute inset-0 z-50 bg-white flex items-center px-4 gap-2 sm:hidden">
          <SearchBar autoFocus />
          <button
            onClick={() => setShowMobileSearch(false)}
            className="shrink-0 text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowMobileSearch(true)}
          className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-violet-50 text-gray-400"
        >
          <Search className="w-4 h-4" />
        </button>
      )}

      <div className="hidden sm:flex flex-1 justify-center px-4">
        <SearchBar />
      </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NavChatPanel />
          <button
            onClick={onPostClick}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post</span>
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shrink-0 hover:bg-violet-600 transition"
            >
              <span className="text-xs font-bold text-white">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <button
                    onClick={() => { setShowDropdown(false); onProfileClick() }}
                    className="w-full text-left hover:opacity-70 transition"
                  >
                    <p className="text-xs font-extrabold text-gray-900 truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </button>
                </div>
                <button
                  onClick={() => { setShowConfirm(true); setShowDropdown(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-sm font-extrabold text-gray-900 mb-1">Log out?</h2>
            <p className="text-xs text-gray-400 mb-6">You'll need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-400 hover:bg-red-500 rounded-2xl transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

    </nav>
  )
}