// follow.js - Public ID vs Private ID
import { supabase } from './supabase.js'

// Follow pannumbothu check pannum
export async function followUser(currentUserId, targetUserId) {
  const { data: target } = await supabase
    .from('profiles')
    .select('is_private_account')
    .eq('id', targetUserId).single()

  if (target.is_private_account) {
    // PRIVATE ID - Request anuppanum da
    await supabase.from('follow_requests').insert({
      from_id: currentUserId,
      to_id: targetUserId,
      status: 'pending'
    })
    return { status: 'requested' } // "Requested" button varum
  } else {
    // PUBLIC ID - Direct follow da
    await supabase.from('follows').insert({
      follower_id: currentUserId,
      following_id: targetUserId
    })
    return { status: 'following' }
  }
}

// Private ID request Accept/Decline da
export async function handleFollowRequest(requestId, action) {
  if (action === 'accept') {
    const { data: req } = await supabase
      .from('follow_requests').select('*').eq('id', requestId).single()
    
    await supabase.from('follows').insert({
      follower_id: req.from_id,
      following_id: req.to_id
    })
    await supabase.from('follow_requests').delete().eq('id', requestId)
  } else {
    await supabase.from('follow_requests').delete().eq('id', requestId)
  }
}
