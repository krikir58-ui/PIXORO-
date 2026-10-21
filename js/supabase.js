// Supabase Connection - Pixoro 🔵
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}
window.supabase = window.supa
console.log('Supabase connected 🔵');

// GOLD TICK - Giri_office ku Mattum da
function isGoldUser(p){
  if(!p) return false
  // String vantha - 'giri_office'
  if(typeof p === 'string') return p.toLowerCase().split('@')[0] === 'giri_office'
  // Object vantha - {username, verified}
  return p.username === 'giri_office' || p.verified === true || p.is_verified === true
}
function goldTickHTML(){
  return '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
}
window.isGoldUser = isGoldUser
window.goldTickHTML = goldTickHTML
window.getTick = (p) => isGoldUser(p) ? goldTickHTML() : ''
