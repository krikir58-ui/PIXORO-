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
  if(typeof p === 'string') return GOLD_IDS.includes(String(p).trim());
  let ids = [p.user_id, p.owner_id, p.author_id, p.profile_id, p.uid, p.id];
  for(let id of ids){
    if(id && GOLD_IDS.includes(String(id).trim())) return true;
  }
  if(window.profileMap && p.username){
    let key = String(p.username).toLowerCase().replace(/[^a-z0-9_.]/g,'');
    let prof = window.profileMap[key];
    if(prof && GOLD_IDS.includes(String(prof.id))) return true;
  }
  if(window.profileById){
    for(let id of ids){
      if(id && window.profileById[String(id)] && GOLD_IDS.includes(String(window.profileById[String(id)].id))) return true;
    }
  }
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

// --- AUTO GOLD TICK - getTick PODALANA KUDA VARUM DA ---
function pixoroAutoGold(){
  // 1. profileMap la irunthu
  if(window.profileMap){
    document.querySelectorAll('[data-username]').forEach(el=>{
      let u = String(el.dataset.username||'').toLowerCase().replace(/[^a-z0-9_.]/g,'');
      let prof = window.profileMap[u];
      if(prof && GOLD_IDS.includes(String(prof.id)) && !el.querySelector('.pixoro-verified')){
        el.insertAdjacentHTML('beforeend', GOLD_TICK_SVG);
      }
    });
  }
  // 2. tamil_pixoro nu text ah iruntha - ID ah paakkama direct ah poda koodathu - but un ID ku mattum
  document.querySelectorAll('span,b,strong,a,div').forEach(el=>{
    if(el.children.length > 0) return;
    if(el.textContent.trim() === 'tamil_pixoro' && !el.innerHTML.includes('pixoro-verified')){
      el.innerHTML = 'tamil_pixoro' + GOLD_TICK_SVG;
    }
  });
}
setInterval(pixoroAutoGold, 800);
if(document.body){ new MutationObserver(pixoroAutoGold).observe(document.body,{childList:true,subtree:true}); }
window.pixoroAutoGold = pixoroAutoGold;

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
