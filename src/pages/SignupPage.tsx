import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { db } from '../lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Camera } from 'lucide-react'

const provider = new GoogleAuthProvider()

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: user.email || '',
        createdAt: serverTimestamp(),
      })
      navigate('/')
    } catch (err: any) {
      console.log(err.code)
      setError('Oops! Something went wrong. Try again.')
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
      console.log(err.code)
      setError('Could not sign in with Google.')
    }
  }

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }} className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center w-14 h-14 bg-violet-100 rounded-2xl mx-auto mb-4">
            <Camera className="w-7 h-7 text-violet-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Flickra</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-violet-300 transition placeholder-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-sm font-bold text-white bg-violet-500 rounded-2xl hover:bg-violet-600 active:scale-95 transition"
          >
            Create account
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
          className="w-full py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95 transition flex items-center justify-center gap-2"
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
        <p className="text-center text-sm text-gray-400 font-semibold mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}