import { useState, useEffect, useCallback } from 'react'
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
} from '../lib/followService'

export function useFollow(viewerUid: string | undefined, targetUid: string | undefined) {
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!targetUid) return
    setLoading(true)
    const [followerCt, followingCt, isFollowingTarget] = await Promise.all([
      getFollowerCount(targetUid),
      getFollowingCount(targetUid),
      viewerUid ? isFollowing(viewerUid, targetUid) : Promise.resolve(false),
    ])
    setFollowerCount(followerCt)
    setFollowingCount(followingCt)
    setFollowing(isFollowingTarget)
    setLoading(false)
  }, [viewerUid, targetUid])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleFollow = async () => {
    if (!viewerUid || !targetUid || busy) return
    setBusy(true)
    try {
      if (following) {
        await unfollowUser(viewerUid, targetUid)
        setFollowing(false)
        setFollowerCount(c => Math.max(c - 1, 0))
      } else {
        await followUser(viewerUid, targetUid)
        setFollowing(true)
        setFollowerCount(c => c + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  return { following, followerCount, followingCount, loading, busy, toggleFollow }
}