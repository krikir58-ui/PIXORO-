// profile.js - Public/Private Account toggle
export async function togglePrivateAccount(userId, isPrivate) {
  await supabase.from('profiles').update({
    is_private_account: isPrivate // true = Private ID, false = Public ID
  }).eq('id', userId)
}

export async function getProfile(viewerId, profileId) {
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', profileId).single()

  if (profile.is_private_account) {
    // Private ID na - Follower ah nu check pannu da
    const { data: isFollowing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', viewerId)
      .eq('following_id', profileId).single()

    if (!isFollowing && viewerId !== profileId) {
      return { ...profile, isLocked: true, reels: [] } // Lock screen kaatu da
    }
  }
  // Public ID or Follower na full data kaatu da
  const { data: reels } = await supabase
    .from('reels').select('*').eq('user_id', profileId)
  return { ...profile, isLocked: false, reels }
}
