import { create } from 'zustand'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  onboardingComplete: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setOnboardingComplete: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  onboardingComplete: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
}))