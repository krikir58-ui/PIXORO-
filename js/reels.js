// reels.js - Reels visibility
export async function uploadReel(userId, videoUrl, isPrivateShare, sharedWithIds) {
  await supabase.from('reels').insert({
    user_id: userId,
    video_url: videoUrl,
    visibility: isPrivateShare ? 'private_share' : 'public', // Instagram maari public da
    shared_with: isPrivateShare ? sharedWithIds : null
  })
}

// feed.js - Feed la enna kaamikkanum
export async function getFeed(currentUserId) {
  // Public IDs oda reels + Naan follow panra Private IDs oda reels mattum da
  const { data: following } = await supabase
    .from('follows').select('following_id').eq('follower_id', currentUserId)

  const followingIds = following.map(f => f.following_id)

  const { data: reels } = await supabase
    .from('reels')
    .select('*, profiles!inner(is_private_account)')
    .or(`profiles.is_private_account.eq.false,user_id.in.(${followingIds})`)
    .eq('visibility', 'public') // Private Share reels feed la varathu da - DM la mattum

  return reels
}
