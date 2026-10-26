// js/pixoro-core.js - PIXORO CORE - FINAL - ID ONLY - NO USERNAME CHECK ❌
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// --- GOLD TICK - USER ID ONLY - NAME MATHUNA KUDa POGATHU ---
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
const GOLD_IDS = [ GIRI_UID ]; // Vera Yaarukku Venum na ID mattum Inga Podu - Username Podathe

const GOLD_TICK_SVG = '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

function isGoldUser(p){
  if(!p) return false;
  // ID mattum thaan paakrom - Username ah paakave maatom
  let pid = String(p.id || p.user_id || '');
  if(!pid) return false;
  if(GOLD_IDS.includes(pid)) return true;
  // Supabase la is_gold iruntha kuda - ID check thaan
  if(p.is_gold === true && p.verified === true) return true;
  return false;
}

function goldTickHTML(p){ return isGoldUser(p) ? GOLD_TICK_SVG : ''; }
function getTick(p){ return goldTickHTML(p); }

window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = getTick;
window.GIRI_UID = GIRI_UID;
window.GOLD_IDS = GOLD_IDS;

// Views - Same
async function getViewsCount(postId){
  let supa = window.supa; if(!supa) return 0;
  let {data} = await supa.from('views').select('id').eq('post_id', postId);
  return data ? data.length : 0;
}
async function trackRealView(postId, videoEl){
  let supa = window.supa; if(!supa) return;
  if(!videoEl || videoEl.currentTime < 3) return;
  if(videoEl.dataset.viewed) return;
  videoEl.dataset.viewed = '1';
  await supa.from('views').insert({post_id: postId, username: localStorage.getItem('pixoro_user')});
}
window.getViewsCount = getViewsCount;
window.trackRealView = trackRealView;
