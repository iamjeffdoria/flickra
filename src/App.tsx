import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useAuthStore } from './store/useAuthStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'

import { doc, getDoc } from 'firebase/firestore'
import { db } from './lib/firebase'

function App() {
  const { setUser, setLoading, setOnboardingComplete, user, loading, onboardingComplete } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        setOnboardingComplete(snap.exists() ? !!snap.data().onboardingComplete : false)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

if (loading) return (
  <div className="fixed inset-0 bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
        <span className="text-white text-lg">🎮</span>
      </div>
      <p className="text-xs font-extrabold text-violet-400 uppercase tracking-widest">Loading...</p>
    </div>
  </div>
)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={user ? (onboardingComplete ? <Navigate to="/" /> : <OnboardingPage />) : <Navigate to="/login" />} />
        <Route path="/" element={user ? (onboardingComplete ? <HomePage /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App