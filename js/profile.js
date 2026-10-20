// profile.js - Public/Private + Instagram Blue Tick da Giri 🔥
export async function togglePrivateAccount(userId, isPrivate) {
  await supabase.from('profiles').update({
    is_private_account: isPrivate
  }).eq('id', userId)
}

export async function getProfile(viewerId, profileId) {
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', profileId).single()

  if (profile.is_private_account) {
    const { data: isFollowing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', viewerId)
      .eq('following_id', profileId).single()

    if (!isFollowing && viewerId !== profileId) {
      return { ...profile, isLocked: true, reels: [] }
    }
  }
  const { data: reels } = await supabase
    .from('reels').select('*').eq('user_id', profileId)
  return { ...profile, isLocked: false, reels }
}

// ===== PIXORO BLUE TICK - PIXORO Style da =====
export async function requestVerification(userId, username) {
  const fullName = prompt("Un Full Name da:")
  const reason = prompt("Yen Unakku Blue Tick Venum da?")
  if(!fullName) return

  const { error } = await window.supa
    .from('verification_requests')
    .insert([{ user_id: userId, username: username, full_name: fullName, reason: reason, status: 'pending' }])

  if(!error){
    alert("Request Pochu da Giri! 🔥 Admin Approve pannathum Blue Tick Varum da!")
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
  if(!isVerified) return;
  // Display Name la Tick Vara Koodathu da - Instagram Rule
  if(el.classList.contains('my-name') || el.id === 'displayName' || el.classList.contains('display-name')){
    return;
  }
  // Username ku mattum Instagram Blue Tick da
  if(el.querySelector('.pixoro-blue-tick')) return;
  el.innerHTML += ` <svg class="pixoro-blue-tick" width="16" height="16" viewBox="0 0 24 24" fill="#0095F6"><path d="M12 1.8l2.4 2.1 3.2-.5 1 3 3 1.2 1 3-1 3-1.2 3-3 1.2-1 3-3.2-.5L12 22.2l-2.4-2.1-3.2.5-1-3-3-1.2-1-3 1-3 1.2-3 3-1.2 1-3 3.2.5z"/><path d="M10.5 15.5l-3-3 1.4-1.4 1.6 1.6 4.5-4.5 1.4 1.4z" fill="white"/></svg>`;
}

// Profile Photo Round + Link Style ku da
export function applyInstagramProfileStyle(){
  const photo = document.querySelector('.profile-photo, #profilePic');
  if(photo){
    photo.style.borderRadius = '50%';
    photo.style.objectFit = 'cover';
  }
}
