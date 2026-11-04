// ===== PIXORO MAIN - Correct File da =====
// SUPA_URL / SUPA_KEY - Unakku theriyum la - Atha Inga Podu da - Chat la Anuppatha da

const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log("✅ Pixoro Supa Connected da!");
}

// GOLD TICK OFF - Correct da - Thodatha da
const GIRI_UID = '47f16fa1-fe14-4161-8729-82e28c77286a';
function isGoldUser(p){ return false; }
function goldTickHTML(p){ return ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

// ===== PIXORO STYLE - Plus / Bell Correct da =====
(function(){
  let css = `
  .topPlus, .createBtn, .plusBtn, .topAdd{
    width: auto !important; height: auto !important;
    background: transparent !important; background-image: none !important;
    color: #fff !important; border-radius: 0 !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    font-size: 28px !important; font-weight: 300 !important;
    cursor: pointer !important; box-shadow: none !important;
    padding: 0 6px !important; border: none !important;
  }
  .bellWhite{
    display: flex !important; width: auto !important; height: auto !important;
    background: transparent !important; color: #fff !important;
    font-size: 22px !important; cursor: pointer !important; border: none !important;
    align-items: center !important; justify-content: center !important; padding: 0 8px !important;
  }
  .bellWhite svg{ width: 22px !important; height: 22px !important; stroke: #fff !important; fill: none !important; }
  .reelsTop b, .topTitle{ font-family: 'Segoe UI', system-ui, sans-serif !important; font-size: 20px !important; font-weight: 600 !important; color: #fff !important; }
  .reel-pfp-wrap{width:38px!important;height:38px!important;min-width:38px!important;border:2px solid #fff!important}
  .audioDisc{width:28px!important;height:28px!important;border:2px solid #fff!important}
  .reel-username{font-size:17px!important;font-weight:700!important}
  .followBtnRBig{background:transparent!important;color:#fff!important;border:1.2px solid #fff!important;font-size:14px!important;height:28px!important}
  .msgBtn, .messageBtn{ background: transparent !important; color: #fff !important; border: 1.2px solid #fff !important; }
  .createIco{ background: transparent !important; border: 1.2px solid #fff !important; color: #fff !important; }
  `;
  let s = document.createElement('style');
  s.innerText = css;
  document.head.appendChild(s);
  if(location.pathname.includes('index') || location.pathname.endsWith('/')) document.body.classList.add('isHome');
})();

window.getPfp = function(p){
  let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp;
  if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
  let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
  return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
};

// ===== PIXORO SECRET - Correct Add Panniten da =====
window.ME_ID = window.ME_ID || null;
window.ME_RAW = window.ME_RAW || 'giri_ceo';

function pixoroScore(post){
  let watch = JSON.parse(localStorage.getItem('pixoro_watch')||'{}');
  let likedUsers = JSON.parse(localStorage.getItem('pixoro_liked_users')||'[]');
  let score = 0;
  let hours = (Date.now() - new Date(post.created_at).getTime())/3600000;
  score += Math.max(0, 30 - hours);
  if(likedUsers.includes(String(post.user_id))) score += 50;
  if(watch[post.id] > 5) score += 40;
  if(localStorage.getItem('pixoro_saved_'+post.id)==='1') score += 60;
  return score;
}

async function getPixoroFeed(){
  let {data:all} = await window.supa.from('posts').select('*').order('created_at',{ascending:false});
  let hidden = JSON.parse(localStorage.getItem('pixoro_hidden')||'[]');
  let muted = JSON.parse(localStorage.getItem('pixoro_muted')||'[]');
  let blocked = JSON.parse(localStorage.getItem('pixoro_blocked')||'[]');
  let clean = (all||[]).filter(p=> !p.is_archived && !hidden.includes(String(p.id)) && !muted.includes(String(p.user_id)) && !blocked.includes(String(p.user_id)));
  clean.sort((a,b)=> pixoroScore(b) - pixoroScore(a));
  return clean;
}

function pixoroReelSetup(videoEl, postId, userId){
  if(!videoEl) return;
  videoEl.loop = true; videoEl.muted = true; videoEl.playsInline = true; videoEl.autoplay = true;
  let start = Date.now();
  videoEl.addEventListener('timeupdate', ()=>{
    let w = (Date.now()-start)/1000;
    let watch = JSON.parse(localStorage.getItem('pixoro_watch')||'{}');
    watch[postId] = Math.max(watch[postId]||0, w);
    localStorage.setItem('pixoro_watch', JSON.stringify(watch));
    if(w > 3 && !videoEl.dataset.counted){
      videoEl.dataset.counted='1';
      window.supa.from('views').insert({post_id:postId, user_id:window.ME_ID||null});
    }
  });
  let lastTap = 0;
  videoEl.addEventListener('click', ()=>{
    let now = Date.now();
    if(now-lastTap < 300){
      let h = document.createElement('div'); h.innerText='❤️';
      h.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:90px;z-index:99';
      videoEl.parentElement.appendChild(h); setTimeout(()=>h.remove(),600);
      pixoroLike(postId, userId);
    }
    lastTap = now;
  });
}

async function pixoroLike(postId, userId){
  let liked = JSON.parse(localStorage.getItem('pixoro_liked_users')||'[]');
  if(!liked.includes(String(userId))){ liked.push(String(userId)); localStorage.setItem('pixoro_liked_users', JSON.stringify(liked)); }
  await window.supa.from('likes').insert({post_id:postId, user_id:window.ME_ID});
}

async function pixoroSave(postId, userId){
  await window.supa.from('saves').insert({post_id:postId, user_id:window.ME_ID});
  localStorage.setItem('pixoro_saved_'+postId,'1');
  let liked = JSON.parse(localStorage.getItem('pixoro_liked_users')||'[]');
  if(!liked.includes(String(userId))){ liked.push(String(userId)); localStorage.setItem('pixoro_liked_users', JSON.stringify(liked)); }
}

function pixoroOnDMSent(toUserId){
  let liked = JSON.parse(localStorage.getItem('pixoro_liked_users')||'[]');
  if(!liked.includes(String(toUserId))){ liked.push(String(toUserId)); localStorage.setItem('pixoro_liked_users', JSON.stringify(liked)); }
}

async function getPixoroExplore(myId, myFollows){
  let {data:all} = await window.supa.from('posts').select('*').order('created_at',{ascending:false});
  return (all||[]).filter(p=> String(p.user_id)!==String(myId) && !myFollows.includes(String(p.user_id)));
}

async function pixoroSavePost(fileUrl, isReel, caption){
  let {data:{session}} = await window.supa.auth.getSession();
  await window.supa.from('posts').insert({
    user_id: session.user.id,
    username: window.ME_RAW,
    media_url: fileUrl,
    video_url: isReel ? fileUrl : null,
    image_url: !isReel ? fileUrl : null,
    media_type: isReel ? 'reel' : 'post',
    caption: caption || 'Just Pixoro'
  });
  location.href = 'reels.html';
}

window.getPixoroFeed = getPixoroFeed;
window.pixoroReelSetup = pixoroReelSetup;
window.pixoroLike = pixoroLike;
window.pixoroSave = pixoroSave;
window.pixoroOnDMSent = pixoroOnDMSent;
window.getPixoroExplore = getPixoroExplore;
window.pixoroSavePost = pixoroSavePost;
window.pixoroScore = pixoroScore;
