import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { useAuthStore } from '../store/useAuthStore'
import { Camera, Users, Trophy, Swords } from 'lucide-react'

const slides = [
  {
    icon: Camera,
    title: 'Welcome to Flickra',
    description: "You're in! Let's get you set up so you can start finding your squad and joining tournaments.",
  },
  {
    icon: Users,
    title: 'Find Your Squad',
    description: 'Connect with other Filipino gamers, build your clan, and team up for your favorite games.',
  },
  {
    icon: Swords,
    title: 'Join Tournaments',
    description: 'Compete in tournaments across MLBB, Valorant, COD Mobile, Free Fire, and Ragnarok.',
  },
  {
    icon: Trophy,
    title: "You're All Set!",
    description: "Time to dive in. Let's go dominate the leaderboards.",
  },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const isLast = step === slides.length - 1
  const slide = slides[step]
  const Icon = slide.icon

  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete)

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }
    const user = auth.currentUser
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { onboardingComplete: true }, { merge: true })
      setOnboardingComplete(true)
    }
    navigate('/')
  }

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }} className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">

        {/* Icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mx-auto mb-6">
            <Icon className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{slide.title}</h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">{slide.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-violet-500' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Next / Get Started */}
        <button
          onClick={handleNext}
          className="w-full py-3 text-sm font-bold text-white bg-violet-500 rounded-2xl hover:bg-violet-600 active:scale-95 transition"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>

      </div>
    </div>
  )
}