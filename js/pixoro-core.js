const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// ✅ GOLD TICK OFF da - Ipa Vendaam da - Next Level ku Clean Look da
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';

function isGoldUser(p){
  return false; // Ellaarum False da - Yarukkum Tick Illa da
}

function goldTickHTML(p){ 
  return ''; // Tick HTML eh Illa da
}

window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

// ❌ AUTO TICK OFF da - Ithu Thaan 0.8 sec ku tick pottutu irunthuchu da
/*
function autoGoldTick(){
  document.querySelectorAll('[data-uid="47f16fa1-fe14-4161-8729-82e28c77286a"]').forEach(el=>{
    if(!el.querySelector('.pixoro-verified')) el.insertAdjacentHTML('beforeend', goldTickHTML({id:GIRI_UID}));
  });
}
setInterval(autoGoldTick, 800);
*/

// ✅ PROFILE PHOTO FIX - Ella Page layum Work Aagum da
window.getPfp = function(p){
  let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp;
  if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
  let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
  return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
}
