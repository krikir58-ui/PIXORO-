// profile.js - Public/Private + Gold Tick da Giri 🔥
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

// ===== PIXORO GOLD TICK - Settings ku Add pannathu da =====
export async function requestVerification(userId, username) {
  const fullName = prompt("Un Full Name da:")
  const reason = prompt("Yen Unakku Gold Tick Venum da?")
  if(!fullName) return

  const { error } = await window.supa
    .from('verification_requests')
    .insert([{ user_id: userId, username: username, full_name: fullName, reason: reason, status: 'pending' }])

  if(!error){
    alert("Request Pochu da Giri! 🔥 Admin Approve pannathum Gold Tick Varum da!")
  } else {
    alert("Error da: " + error.message)
  }
}

export async function checkTickStatus(userId) {
  const { data } = await window.supa
    .from('verification_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .limit(1).single()

  if(!data) return alert("Innum Apply pannala da!")
  alert("Status da: " + data.status.toUpperCase() + " ✔️")
}

export function showGoldTick(el, isVerified) {
  if(isVerified){
    el.innerHTML += ' <span style="color:gold">✔️</span>'
  }
}
