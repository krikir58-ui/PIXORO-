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

// ✅ ELLA PAGE LAIMUM SAME + STYLE DA - ITHA ADD PANNITEN DA
(function(){
  let css = `
  .topPlus{
    width: auto !important;
    height: auto !important;
    background: transparent !important;
    color: #fff !important;
    border-radius: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 28px !important;
    font-weight: 300 !important;
    cursor: pointer !important;
    box-shadow: none !important;
    padding: 0 6px !important;
    border: none !important;
  }
  /* Mella Reels Font Same Style da */
  .reelsTop b, .topTitle{
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
    font-size: 20px !important;
    font-weight: 600 !important;
    letter-spacing: -0.5px !important;
    color: #fff !important;
  }
  /* Keela Profile Circle 38px - Audio 28px - Full Same Size da */
  .reel-pfp-wrap{width:38px!important;height:38px!important;min-width:38px!important;border:2px solid #fff!important}
  .audioDisc{width:28px!important;height:28px!important;border:2px solid #fff!important}
  .reel-username{font-size:17px!important;font-weight:700!important}
  .followBtnRBig{background:transparent!important;color:#fff!important;border:1.2px solid #fff!important;font-size:14px!important;height:28px!important}
  `;
  let s = document.createElement('style');
  s.innerText = css;
  document.head.appendChild(s);
})();

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
