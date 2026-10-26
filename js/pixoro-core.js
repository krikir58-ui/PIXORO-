// js/pixoro-core.js - PIXORO CORE - FINAL - ID ONLY - NO USERNAME CHECK ❌
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// --- GOLD TICK - USER ID ONLY - NAME MATHUNA KUDA POGATHU ---
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
const GOLD_IDS = [ GIRI_UID ];

const GOLD_TICK_SVG = '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

function isGoldUser(p){
  if(!p) return false;
  // String ah direct ID ah kudutha kuda work aagum
  if(typeof p === 'string'){
    return GOLD_IDS.includes(String(p).trim());
  }
  // 1. Post / Comment / Reel -> user_id
  // 2. Profile -> id
  // 3. Vera object la id / user_id / owner_id / author_id edhu irunthalum
  let pid = String(p.id || p.user_id || p.owner_id || p.author_id || p.profile_id || '');
  if(pid && GOLD_IDS.includes(pid)) return true;

  // 4. profileMap la irunthu lookup - username la irunthu ID kandupudikkum
  if(window.profileMap && p.username){
    let prof = window.profileMap[String(p.username).toLowerCase().replace(/[^a-z0-9_.]/g,'')];
    if(prof && GOLD_IDS.includes(String(prof.id))) return true;
  }
  if(window.profileById && pid && window.profileById[pid]){
    let prof = window.profileById[pid];
    if(prof && GOLD_IDS.includes(String(prof.id))) return true;
  }

  // 5. Supabase la is_gold + verified iruntha
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
