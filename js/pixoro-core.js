// ===== PIXORO MAIN - NO LOCAL STORAGE - FULL SUPABASE ONLY da =====
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log("✅ Pixoro Supa Connected da!");
}

// GOLD TICK OFF - Thodatha da
function isGoldUser(p){ return false; }
function goldTickHTML(p){ return ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

// ===== STYLE - Plus / Bell / White Remove =====
(function(){
  let css = `
  .topPlus, .createBtn, .plusBtn, .topAdd{ width:auto!important;height:auto!important;background:transparent!important;background-image:none!important;color:#fff!important;border-radius:0!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:28px!important;font-weight:300!important;cursor:pointer!important;box-shadow:none!important;padding:0 6px!important;border:none!important; }
  .bellWhite{ display:flex!important;width:auto!important;height:auto!important;background:transparent!important;color:#fff!important;font-size:22px!important;cursor:pointer!important;border:none!important;align-items:center!important;justify-content:center!important;padding:0 8px!important; }
  .bellWhite svg{ width:22px!important;height:22px!important;stroke:#fff!important;fill:none!important; }
  .reelsTop b, .topTitle{ font-family:'Segoe UI',system-ui,sans-serif!important;font-size:20px!important;font-weight:600!important;color:#fff!important; }
  .reel-pfp-wrap{width:38px!important;height:38px!important;min-width:38px!important;border:2px solid #fff!important}
  .audioDisc{width:28px!important;height:28px!important;border:2px solid #fff!important}
  .reel-username{font-size:17px!important;font-weight:700!important}
  .followBtnRBig{background:transparent!important;color:#fff!important;border:1.2px solid #fff!important;font-size:14px!important;height:28px!important}
  .msgBtn, .messageBtn{ background:transparent!important;color:#fff!important;border:1.2px solid #fff!important; }
  .createIco{ background:transparent!important;border:1.2px solid #fff!important;color:#fff!important; }
  .reel-main{ background:#000!important; }
  .reel-main.bgRemove{ object-fit:contain!important;background:#000!important; }
  `;
  let s = document.createElement('style'); s.innerText = css; document.head.appendChild(s);
  if(location.pathname.includes('index') || location.pathname.endsWith('/')) document.body.classList.add('isHome');
})();

window.getPfp = function(p){
  let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp;
  if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
  let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
  return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
};

window.ME_ID = window.ME_ID || null;
window.ME_RAW = window.ME_RAW || 'giri_ceo';

// ===== REAL TABLE SECRET - posts + reels Rendum da - NO LOCAL STORAGE da =====
async function getAllPixoroPosts(){
  let all = [];
  try{ let r1 = await window.supa.from('posts').select('*').order('created_at',{ascending:false}); if(r1.data) all = all.concat(r1.data.map(p=>({...p,_from:'posts'}))); }catch(e){}
  try{ let r2 = await window.supa.from('reels').select('*').order('created_at',{ascending:false}); if(r2.data) all = all.concat(r2.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
  console.log("Pixoro Total Found:", all.length, all);
  return all;
}

function pixoroIsRealPhoto(url){
  if(!url) return false;
  if(url.includes('ui-avatars') || url.includes('placeholder') || url.includes('undefined')) return false;
  return true;
}

// ===== NO LOCAL STORAGE - Hide / Mute / Block - Supabase la mattum da =====
// Hide = posts table la is_archived = true pannu da - Vera Phone layum Hide aagum da
async function pixoroRemoveFromGrid(postId){
  await window.supa.from('posts').update({is_archived:true}).eq('id',postId);
  try{ await window.supa.from('reels').update({is_archived:true}).eq('id',postId); }catch(e){}
  location.reload();
}
// Undo = is_archived = false pannu da
async function pixoroUnhidePost(postId){
  await window.supa.from('posts').update({is_archived:false}).eq('id',postId);
  try{ await window.supa.from('reels').update({is_archived:false}).eq('id',postId); }catch(e){}
  location.reload();
}
// Mute = follows table la mute - Vera table vendaam da - Supabase la than da
async function pixoroMuteUser(userId){
  // muted_users table iruntha anga - Illana follows la note pannu da
  try{ await window.supa.from('muted_users').insert({user_id:window.ME_ID, muted_user_id:userId}); }catch(e){ console.log("Mute table illa - Supabase la muted_users table create pannu da"); }
  location.reload();
}
async function pixoroBlockUser(userId){
  try{ await window.supa.from('blocked_users').insert({user_id:window.ME_ID, blocked_user_id:userId}); }catch(e){ console.log("Block table illa - Supabase la blocked_users table create pannu da"); }
  location.reload();
}
// Hidden / Muted / Blocked List ah Supabase la irunthu Edu da - Local la illa da
async function pixoroGetHiddenIds(){
  let {data} = await window.supa.from('posts').select('id').eq('is_archived',true);
  return (data||[]).map(p=>String(p.id));
}
async function pixoroGetMutedIds(){
  try{ let {data} = await window.supa.from('muted_users').select('muted_user_id').eq('user_id',window.ME_ID); return (data||[]).map(x=>String(x.muted_user_id)); }catch(e){ return []; }
}
async function pixoroGetBlockedIds(){
  try{ let {data} = await window.supa.from('blocked_users').select('blocked_user_id').eq('user_id',window.ME_ID); return (data||[]).map(x=>String(x.blocked_user_id)); }catch(e){ return []; }
}

function pixoroScore(post, likedUserIds, watchMap, savedIds){
  let score = 0;
  let hours = (Date.now() - new Date(post.created_at).getTime())/3600000;
  score += Math.max(0, 30 - hours);
  if(likedUserIds.includes(String(post.user_id))) score += 50;
  if((watchMap[post.id]||0) > 5) score += 40;
  if(savedIds.includes(String(post.id))) score += 60;
  return score;
}

async function getPixoroFeed(){
  let all = await getAllPixoroPosts();
  let hidden = await pixoroGetHiddenIds();
  let muted = await pixoroGetMutedIds();
  let blocked = await pixoroGetBlockedIds();
  // Likes / Saves / Views - Supabase la irunthu Edu da - Local la illa da
  let {data:likes} = await window.supa.from('likes').select('*');
  let {data:saves} = await window.supa.from('saves').select('*');
  let {data:views} = await window.supa.from('views').select('*');
  let likedUserIds = [...new Set((likes||[]).filter(l=>String(l.user_id)===String(window.ME_ID)).map(l=>String(l.post_id)))];
  // Real logic - liked post oda user ah score ku use pannu da
  let likedUsers = (likes||[]).filter(l=>String(l.user_id)===String(window.ME_ID)).map(l=>l.post_id);
  let savedIds = (saves||[]).filter(s=>String(s.user_id)===String(window.ME_ID)).map(s=>String(s.post_id));
  let watchMap = {}; (views||[]).forEach(v=>{ watchMap[v.post_id]=(watchMap[v.post_id]||0)+1; });
  let clean = (all||[]).filter(p=>{
    let url = p.media_url || p.image_url || p.video_url || '';
    return !p.is_archived && pixoroIsRealPhoto(url) && !hidden.includes(String(p.id)) && !muted.includes(String(p.user_id)) && !blocked.includes(String(p.user_id));
  });
  clean.sort((a,b)=> pixoroScore(b, likedUsers, watchMap, savedIds) - pixoroScore(a, likedUsers, watchMap, savedIds));
  return clean;
}

function pixoroReelSetup(videoEl, postId, userId){
  if(!videoEl) return;
  videoEl.loop = true; videoEl.muted = true; videoEl.playsInline = true; videoEl.autoplay = true;
  videoEl.addEventListener('timeupdate', async ()=>{
    // 3 sec paatha - Views table la Save pannu da - Local la illa da
    if(!videoEl.dataset.counted && videoEl.currentTime > 3){
      videoEl.dataset.counted='1';
      await window.supa.from('views').insert({post_id:postId, user_id:window.ME_ID||null});
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
  await window.supa.from('likes').insert({post_id:postId, user_id:window.ME_ID});
}

async function pixoroSave(postId, userId){
  await window.supa.from('saves').insert({post_id:postId, user_id:window.ME_ID});
}

function pixoroOnDMSent(toUserId){
  // DM sent ah - Likes la Count pannu da - Local vendaam da
  console.log("Pixoro DM Sent to:", toUserId);
}

async function getPixoroExplore(myId, myFollows){
  let all = await getAllPixoroPosts();
  return (all||[]).filter(p=> String(p.user_id)!==String(myId) && !myFollows.includes(String(p.user_id)));
}

async function pixoroSavePost(fileUrl, isReel, caption){
  let {data:{session}} = await window.supa.auth.getSession();
  if(!session) return;
  let row = { user_id: session.user.id, username: window.ME_RAW, media_url: fileUrl, video_url: isReel ? fileUrl : null, image_url: !isReel ? fileUrl : null, media_type: isReel ? 'reel' : 'post', caption: caption || 'Just Pixoro', is_archived:false };
  await window.supa.from('posts').insert(row);
  try{ await window.supa.from('reels').insert(row); }catch(e){}
  location.href = 'reels.html';
}

async function loadProfileRealCount(){
  let all = await getAllPixoroPosts();
  let myId = window.ME_ID;
  let myRaw = (window.ME_RAW||'giri_ceo').toLowerCase().replace('@','');
  let hidden = await pixoroGetHiddenIds();
  let mine = all.filter(p=>{
    let uid = String(p.user_id)===String(myId);
    let name = String(p.username||'').toLowerCase().replace('@','')===myRaw;
    return (uid || name) && !hidden.includes(String(p.id)) && !p.is_archived;
  });
  let reels = mine.filter(p=>{
    let url = (p.video_url||p.media_url||p.image_url||'').toLowerCase();
    return url.includes('.mp4') || url.includes('.mov') || p.media_type==='reel' || p.media_type==='video' || p._from==='reels';
  });
  console.log("Pixoro Mine:", mine.length, "Reels:", reels.length);
  document.querySelectorAll('#postCount, .postCount').forEach(e=> e.innerText = mine.length);
  document.querySelectorAll('#reelCount, .reelCount').forEach(e=> e.innerText = reels.length);
  return {mine, reels};
}

async function pixoroOpenFollowList(type){
  let {data:allFollows} = await window.supa.from('follows').select('*');
  let list = [];
  if(type==='following'){ list = (allFollows||[]).filter(f=> String(f.follower_id)===String(window.ME_ID)); }
  else { list = (allFollows||[]).filter(f=> String(f.following_id)===String(window.ME_ID)); }
  let {data:profs} = await window.supa.from('profiles').select('*');
  let html = list.map(f=>{
    let pid = type==='following' ? f.following_id : f.follower_id;
    let pr = (profs||[]).find(p=> String(p.id)===String(pid));
    let uname = pr?.username || 'user';
    let pfp = pr?.avatar_url || 'https://ui-avatars.com/api/?name='+uname[0]+'&background=fff&color=000';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #222"><img src="${pfp}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"><b style="flex:1;color:#fff">${uname}</b><button onclick="location.href='profile.html?user=${uname}'" style="background:#fff;color:#000;border:0;padding:6px 14px;border-radius:20px;font-weight:700">View</button></div>`;
  }).join('') || `<div style="color:#888;text-align:center;padding:20px">No ${type} yet</div>`;
  let old = document.getElementById('followModal'); if(old) old.remove();
  let m = document.createElement('div'); m.id = 'followModal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  m.onclick = (e)=>{ if(e.target===m) m.remove(); };
  m.innerHTML = `<div style="background:#1a1a1d;width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:70vh;overflow-y:auto;padding:10px 0 30px"><div style="text-align:center;color:#fff;font-weight:800;padding:10px">${type==='following'?'Following':'Followers'} (${list.length})</div>${html}</div>`;
  document.body.appendChild(m);
}

async function pixoroLoadFollowCounts(){
  let {data:allFollows} = await window.supa.from('follows').select('*');
  let followers = (allFollows||[]).filter(f=> String(f.following_id)===String(window.ME_ID)).length;
  let following = (allFollows||[]).filter(f=> String(f.follower_id)===String(window.ME_ID)).length;
  document.querySelectorAll('#followerCount, .followerCount').forEach(e=> e.innerText = followers);
  document.querySelectorAll('#followingCount, .followingCount').forEach(e=> e.innerText = following);
  return {followers, following};
}

window.getPixoroFeed = getPixoroFeed;
window.pixoroReelSetup = pixoroReelSetup;
window.pixoroLike = pixoroLike;
window.pixoroSave = pixoroSave;
window.pixoroOnDMSent = pixoroOnDMSent;
window.getPixoroExplore = getPixoroExplore;
window.pixoroSavePost = pixoroSavePost;
window.pixoroScore = pixoroScore;
window.getAllPixoroPosts = getAllPixoroPosts;
window.pixoroRemoveFromGrid = pixoroRemoveFromGrid;
window.pixoroUnhidePost = pixoroUnhidePost;
window.pixoroMuteUser = pixoroMuteUser;
window.pixoroBlockUser = pixoroBlockUser;
window.loadProfileRealCount = loadProfileRealCount;
window.pixoroOpenFollowList = pixoroOpenFollowList;
window.pixoroLoadFollowCounts = pixoroLoadFollowCounts;
