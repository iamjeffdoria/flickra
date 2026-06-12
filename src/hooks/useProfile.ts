import { useEffect } from 'react'
import { useProfileStore } from '../store/useProfileStore'

export function useProfile(uid: string | undefined) {
  const { profile, loading, fetchProfile, updateProfile } = useProfileStore()

  useEffect(() => {
    if (uid) fetchProfile(uid)
  }, [uid])

  return { profile, loading, updateProfile }
}