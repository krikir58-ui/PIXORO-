// Supabase Connection - Pixoro 🔵 - FINAL CORRECTED - LOGIN LOOP FIX
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'pixoro-auth-token'
    }
  });
}
window.getSupa = function(){ return window.supa; };

// GOLD TICK - ID ONLY - 47f16fa1... ku Mattum da 👑
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
const GOLD_IDS = [GIRI_UID];

function isGoldUser(p){
  if(!p) return false;
  if(typeof p === 'string') return GOLD_IDS.includes(p.trim());
  let ids = [p.user_id, p.owner_id, p.author_id, p.profile_id, p.uid, p.id];
  for(let id of ids){ if(id && GOLD_IDS.includes(String(id).trim())) return true; }
  if(window.profileMap && p.username){
    let key = String(p.username).toLowerCase().replace(/[^a-z0-9_.]/g,'');
    let prof = window.profileMap[key];
    if(prof && GOLD_IDS.includes(String(prof.id))) return true;
  }
  return false;
}
function goldTickHTML(p){ return isGoldUser(p) ? '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;
window.GIRI_UID = GIRI_UID;
window.GOLD_IDS = GOLD_IDS;

// ✅ AUTO TICK AH THOOKITEN DA - setInterval + MutationObserver vendaam da
