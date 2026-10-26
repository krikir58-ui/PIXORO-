const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// ID ONLY - Username Check Kidayathu da
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
function isGoldUser(p){
  if(!p) return false;
  if(typeof p === 'string') return p.trim() === GIRI_UID;
  let id = p.user_id || p.owner_id || p.author_id || p.id || p.uid || '';
  return String(id).trim() === GIRI_UID;
}
function goldTickHTML(p){ return isGoldUser(p) ? '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;
