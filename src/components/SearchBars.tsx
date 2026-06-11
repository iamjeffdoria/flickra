import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { searchUsers, type SearchUser } from '../lib/searchService'
import { useDebounce } from '../hooks/useDebounce'

export default function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }
    setLoading(true)
    searchUsers(debouncedQuery).then(res => {
      setResults(res)
      setShowResults(true)
      setLoading(false)
    })
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
        <input
            autoFocus={autoFocus}
            value={query}
            onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search players..."
          className="w-full pl-8 pr-8 py-2 text-xs font-semibold bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-violet-300 transition placeholder-gray-300"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-3 h-3 text-gray-300 hover:text-gray-500" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-10 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
          {loading ? (
            <p className="text-xs text-gray-300 font-semibold text-center py-4">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-gray-300 font-semibold text-center py-4">No users found</p>
          ) : (
            results.map(u => (
              <div key={u.uid} className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 transition cursor-pointer">
                <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-white">
                    {(u.displayName || u.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-gray-900 truncate">{u.displayName || 'User'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}