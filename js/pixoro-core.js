const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}

// ✅ GOLD TICK OFF da - Ipa Vendaam da - Next Level ku Clean Look da
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
function isGoldUser(p){ return false; }
function goldTickHTML(p){ return ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

// ✅ ELLA PAGE LAIMUM SAME + STYLE DA - + BACKGROUND REMOVE DA
(function(){
  let css = `
  .topPlus, .createBtn, .plusBtn, .topAdd, [onclick*="createSheet"]{
    width: auto !important;
    height: auto !important;
    background: transparent !important;
    background-image: none !important;
    background-color: transparent !important;
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
  .reelsTop b, .topTitle{
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
    font-size: 20px !important;
    font-weight: 600 !important;
    letter-spacing: -0.5px !important;
    color: #fff !important;
  }
  .reel-pfp-wrap{width:38px!important;height:38px!important;min-width:38px!important;border:2px solid #fff!important}
  .audioDisc{width:28px!important;height:28px!important;border:2px solid #fff!important}
  .reel-username{font-size:17px!important;font-weight:700!important}
  .followBtnRBig{background:transparent!important;color:#fff!important;border:1.2px solid #fff!important;font-size:14px!important;height:28px!important}

  /* SEARCH, DM, NOTIFICATION REMOVE DA */
  .bell, .bellWhite, .notifBtn, .notificationBtn, .notifIcon, .searchTopBtn, .dmTopBtn, .topSearch, .topDM{
    display: none !important;
  }

  /* 🔥 NEW FIX DA - ELLA PAGE LAIMUM VARUTHU NU SONNA ATHUKU DA */
  /* MESSAGE BUTTON - ELLA PAGE LAIMUM PINK POYIDUM - WHITE BORDER MATTUM DA */
  .msgBtn, .messageBtn, button.msgBtn{
    background: transparent !important;
    background-image: none !important;
    color: #fff !important;
    border: 1.2px solid #fff !important;
    font-weight: 700 !important;
  }
  .viewBtn{
    background: transparent !important;
    color: #fff !important;
    border: 1.2px solid #fff !important;
  }
  /* CREATE SHEET ICON - PINK BORDER REMOVE - WHITE DA */
  .createIco{
    background: transparent !important;
    border: 1.2px solid #fff !important;
    color: #fff !important;
  }
  .createRow{ background: transparent !important; }
  /* CREATE SHEET - HOME LA MATTUM OPEN AAGUM DA - SEARCH/DM/PROFILE LA OPEN AAGATHU DA */
  #createSheet{ display:none !important; }
  body.isHome #createSheet.open{ display:flex !important; }
  `;
  let s = document.createElement('style');
  s.innerText = css;
  document.head.appendChild(s);

  function hideTopIcons(){
    document.querySelectorAll('div,button,a,span').forEach(el=>{
      let t = (el.innerText||'').trim();
      if(t === '🔔' || t === '🔍' || t === '✉️') el.style.display = 'none';
      let c = (el.className||'').toString().toLowerCase();
      if(c.includes('bell') || c.includes('notif')) el.style.display = 'none';
    });
  }
  setTimeout(hideTopIcons, 500);
  setInterval(hideTopIcons, 2000);

  // 🔥 CREATE SHEET ELLA PAGE LAIMUM AUTO OPEN AAGAMA BLOCK DA
  setInterval(()=>{
    let path = location.pathname.toLowerCase();
    let isHome = path.endsWith('index.html') || path.endsWith('/') || path === '' || path.includes('index');
    if(!isHome){
      let cs = document.getElementById('createSheet');
      if(cs) cs.style.display = 'none';
    }
  }, 400);

  // Home na body la class podu da
  if(location.pathname.includes('index') || location.pathname.endsWith('/')) document.body.classList.add('isHome');
})();

window.getPfp = function(p){
  let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp;
  if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
  let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
  return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
}
