import { supabase } from '../supabase.js';

// Follow button click panna idhu nadakkum - Instagram secret!
export async function sendFollowRequest(targetUserId) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Avan account private ah nu paaru - Instagram trick!
  const { data: target } = await supabase.from('profiles')
    .select('is_private').eq('id', targetUserId).single();

  if (target.is_private) {
    // Private na Request ah save pannu - Direct follow koodathu!
    await supabase.from('follow_requests').insert({
      from_id: user.id,
      to_id: targetUserId,
      status: 'pending'
    });
    alert("🔒 Private Account - Request poiruchu da! Avanga OK sonna than follow aagum!");
  } else {
    // Public na direct follow - Simple!
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId
    });
    alert("Followed! ✅");
  }
}

// Ponnu Request accept pannum button ku!
export async function acceptRequest(requestId, fromId, toId) {
  await supabase.from('follow_requests').update({ status: 'accepted' }).eq('id', requestId);
  await supabase.from('follows').insert({ follower_id: fromId, following_id: toId });
  alert("Request Accept pannita! 💙");
    }
