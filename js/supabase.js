// Supabase Connection - Pixoro 🔵 - FINAL CORRECTED - V1029 - RACE FIX + LOGIN LOOP FIX + CDN AUTO LOAD
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

let _pixoroSupaCreating = false;

function pixoroCreateSupa(){
  if(window.supa) return window.supa;
  if(_pixoroSupaCreating) return null;
  if(!window.supabase || !window.supabase.createClient) return null;
  _pixoroSupaCreating = true;
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'pixoro-auth-token'
    }
  });
  // ✅ V1029 FIX - Flag Vechi da - Feed.js Vantha Aprom Check Pannikalam da
  window.PIXORO_SUPA_READY = true;
  console.log("✅ Pixoro Supa Connected da!");
  // ✅ V1029 FIX - Event ah Konjam Late ah Anuppu da - Feed.js Listener Register Aagattum da
  // ✅ V1029 FIX - Oru Vaati Mattum Anuppu da - Thirumba Thirumba Anuppaathe da
  setTimeout(()=>{ window.dispatchEvent(new Event("pixoro-supa-ready")); }, 100);
  // ✅ V1029 FIX - Feed.js Irundha Mattum Thaan Call Pannu da
  if(typeof window.loadPixoroFeed === 'function') setTimeout(()=>window.loadPixoroFeed(), 300);
  if(typeof window.loadPixoroReels === 'function') setTimeout(()=>window.loadPixoroReels(), 300);
  return window.supa;
}

// ✅ CORRECTED DA - CDN Load Aagala na - Thaanave Load Pannikkum da
if(!window.supa){
  if(window.supabase && window.supabase.createClient){
    pixoroCreateSupa();
  } else {
    let script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = ()=>{ _pixoroSupaCreating = false; pixoroCreateSupa(); };
    script.onerror = ()=>{ _pixoroSupaCreating = false; console.log("Supabase CDN Load Failed da"); };
    document.head.appendChild(script);
  }
}

// ✅ V1029 FIX - getSupa la Event ah Thirumba Anuppaathe da - Supa Illana Create Pannu - Irundha Kudu da
window.getSupa = function(){ return window.supa || pixoroCreateSupa(); };
window.PIXORO_URL = SUPA_URL;
window.PIXORO_KEY = SUPA_KEY;

// GOLD TICK - ID + USERNAME Rendum da 👑
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
const GOLD_IDS = [GIRI_UID];
function isGoldUser(p){
  if(!p) return false;
  if(typeof p === 'string'){
    let s = p.trim().toLowerCase();
    if(GOLD_IDS.includes(p.trim())) return true;
    return s === 'giri_official' || s === 'giri_ceo';
  }
  let ids = [p.user_id, p.owner_id, p.author_id, p.profile_id, p.uid, p.id];
  for(let id of ids){ if(id && GOLD_IDS.includes(String(id).trim())) return true; }
  let uname = String(p.username || p.name || '').toLowerCase().replace('@','').trim();
  if(uname === 'giri_official' || uname === 'giri_ceo') return true;
  if(p.is_gold === true || p.is_verified === true || p.gold_tick === true) return true;
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
