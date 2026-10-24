// Supabase Connection - Pixoro 🔵 - FINAL CORRECTED
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log('Supabase connected 🔵', !!window.supa);
}

// GOLD TICK - giri_office ku Mattum da 👑
function isGoldUser(p){
  if(!p) return false
  let u = ''
  if(typeof p === 'string') u = p.toLowerCase().split('@')[0].replace(/[^a-z0-9_.]/g,'')
  else u = String(p.username||'').toLowerCase()
  return u === 'giri_office' || p.verified === true || p.is_verified === true || p.is_gold === true
}
function goldTickHTML(){
  return '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
}
window.isGoldUser = isGoldUser
window.goldTickHTML = goldTickHTML
window.getTick = (p) => isGoldUser(p) ? goldTickHTML() : ''
