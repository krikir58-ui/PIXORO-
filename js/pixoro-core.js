// js/pixoro-core.js - PIXORO CORE - FINAL da 🔵👑
// Un Code - Same thaan da
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// Gold Tick - Un Code Same da
function isGoldUser(p){ /* Un Code */ }
function goldTickHTML(){ /* Un Code */ }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;

// 🔥 NEW - Real Views - Same Table Ella Page kum da
async function getViewsCount(postId){
  let {data} = await supa.from('views').select('id').eq('post_id', postId);
  return data ? data.length : 0;
}
async function trackRealView(postId, videoEl){
  if(!videoEl || videoEl.currentTime < 3) return;
  if(videoEl.dataset.viewed) return;
  videoEl.dataset.viewed = '1';
  await supa.from('views').insert({post_id: postId, username: localStorage.getItem('pixoro_user')});
}
window.getViewsCount = getViewsCount;
window.trackRealView = trackRealView;
