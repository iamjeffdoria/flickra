import { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { db } from '../lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Camera } from 'lucide-react'

const provider = new GoogleAuthProvider()

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err: any) {
      setError('Oops! Wrong email or password.')
    }
  }

  const handleGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp(),
      }, { merge: true })
      navigate('/')
    } catch (err: any) {
      setError('Could not sign in with Google.')
    }
  }
return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }} className="min-h-screen flex">

      {/* LEFT — Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden bg-white">

        {/* Sharp geometric accent top-left */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600 opacity-5 rotate-45 -translate-x-24 -translate-y-24" />
        {/* Bottom right accent */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-50 rotate-12 translate-x-32 translate-y-32 rounded-3xl" />
        {/* Thin top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-600 via-pink-500 to-orange-400" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-14 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 bg-violet-600 rounded-lg">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 text-2xl font-extrabold tracking-tight">Flickra</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 mb-8">
          <div className="inline-block bg-violet-100 text-violet-700 text-xs font-extrabold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            🇵🇭 #1 Filipino Gaming Platform
          </div>
          <h2 className="text-6xl font-extrabold text-gray-900 leading-none mb-4 tracking-tight">
            Where<br />
            <span className="text-violet-600">Filipino</span><br />
            Gamers<br />
            <span className="relative inline-block">
              Dominate.
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-violet-600 rounded-full" />
            </span>
          </h2>
          <p className="text-gray-400 text-base font-bold mt-6">
            Find your squad. Destroy tournaments.<br />Build your legacy.
          </p>
        </div>

        {/* Game badges */}
        <div className="flex flex-wrap gap-2 relative z-10 mb-10">
          {[
            { label: '🗡️ MLBB', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
            { label: '🔫 Valorant', color: 'bg-red-50 text-red-700 border border-red-200' },
            { label: '💣 COD Mobile', color: 'bg-green-50 text-green-700 border border-green-200' },
            { label: '🔥 Free Fire', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
            { label: '⚔️ Ragnarok', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
          ].map((game) => (
            <span key={game.label} className={`text-xs font-extrabold px-3 py-1.5 rounded-lg ${game.color}`}>
              {game.label}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-8 relative z-10">
          {[
            { value: '10K+', label: 'Gamers' },
            { value: '500+', label: 'Clans' },
            { value: '200+', label: 'Tournaments' },
          ].map((stat) => (
            <div key={stat.label} className="border-l-4 border-violet-600 pl-3">
              <p className="text-gray-900 text-2xl font-extrabold leading-none">{stat.value}</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT — Login */}
      <div className="w-full lg:w-110 flex items-center justify-center px-8 bg-white border-l-4 border-violet-600 relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-600 via-pink-500 to-orange-400" />

        <div className="w-full max-w-xs">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-violet-600 rounded-lg mx-auto mb-3">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Flickra</h1>
            <p className="text-gray-400 text-sm mt-1 font-bold">Where Filipino Gamers Dominate 🇵🇭</p>
          </div>

          <div className="mb-8">
            <div className="inline-block bg-violet-100 text-violet-700 text-xs font-extrabold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              🎮 Ready to Play?
            </div>
            <h2 className="text-gray-900 text-3xl font-extrabold mb-1 tracking-tight">Welcome<br />back, <span className="text-violet-600">gamer.</span></h2>
            <p className="text-gray-400 text-sm font-bold mt-2">Sign in and get back in the game</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-500 text-sm font-bold text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-violet-500 transition placeholder-gray-300"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-violet-500 transition placeholder-gray-300"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 text-sm font-extrabold text-white bg-violet-600 rounded-xl hover:bg-violet-700 active:scale-95 transition mt-1 uppercase tracking-wider"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300 font-extrabold">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 font-bold mt-6">
            New here?{' '}
            <Link to="/signup" className="text-violet-600 font-extrabold hover:underline">
              Join Flickra
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}