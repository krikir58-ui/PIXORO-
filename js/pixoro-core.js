// ===== PIXORO CORE - v1025 - CORRECTED - FULL =====
// Like Guard + ReelSetup Conflict Fix + Photo Sync Fix da
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
window.PIXORO_URL = SUPA_URL;
window.PIXORO_KEY = SUPA_KEY;
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log("✅ Pixoro Supa Connected da!");
}
function pixoroGetSupa(){
  if(window.supa) return window.supa;
  if(window.supabase && window.supabase.createClient){
    try{ window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY); return window.supa; }catch(e){ return null; }
  }
  return null;
}
window.getSupa = pixoroGetSupa;
window.pixoroGetSupa = pixoroGetSupa;
function pixoroGetBase(){ return location.href.split('?')[0].split('#')[0].replace(/\/[^\/]*$/,'/') + ''; }
window.pixoroGetBase = pixoroGetBase;
window.getBase = pixoroGetBase;
function isGoldUser(p){
  if(!p) return false;
  if(p.is_gold === true) return true;
  if(p.is_verified === true) return true;
  if(p.gold_tick === true) return true;
  let u = String(p.username||p.name||'').toLowerCase().replace('@','').trim();
  return u === 'giri_official' || u === 'giri_ceo';
}
function goldTickHTML(p){ if(!isGoldUser(p)) return ''; return ' <span style="color:#FFD700;font-size:14px">✔</span>'; }
window.isGoldUser = isGoldUser; window.goldTickHTML = goldTickHTML; window.getTick = goldTickHTML;

(function(){
  if(document.getElementById('pixoro-speed-css')) return;
  let css = `
  *{ -webkit-tap-highlight-color:transparent!important; tap-highlight-color:transparent!important; }
  button{ touch-action:manipulation!important; }
  body{ background:#000!important; }
  .pixoro-logo, .top b, .reelsTop b, .topTitle{ font-family:'Segoe UI',system-ui,sans-serif!important; font-size:26px!important; font-weight:900!important; color:#fff!important; background:none!important; -webkit-text-fill-color:#fff!important; }
  .reel-username{font-size:15px!important;font-weight:700!important;cursor:pointer!important}
  .msgBtn, .messageBtn{ background:transparent!important;color:#fff!important;border:1.2px solid #fff!important; }
  .reel-main{ background:#000!important; }
  .reel-main.bgRemove{ object-fit:contain!important;background:#000!important; }
  .bellWrap{position:relative!important;cursor:pointer!important}
  #pixoroBellDot{position:absolute!important;top:-2px!important;right:-2px!important;width:9px!important;height:9px!important;background:#ff3040!important;border-radius:50%!important;display:none;z-index:5}
  .bottom-nav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;max-width:450px!important;margin:0 auto!important;width:100%!important;height:60px!important;background:#000!important;border-top:1px solid #222!important;display:flex!important;justify-content:space-around!important;align-items:center!important;z-index:100!important}
  .bottom-nav a{display:flex!important;flex-direction:column!important;align-items:center!important;gap:3px!important;text-decoration:none!important;color:#8e8e8e!important;font-size:10px!important;background:transparent!important;background-color:transparent!important;box-shadow:none!important}
  .bottom-nav a svg{width:22px!important;height:22px!important;fill:none!important;stroke:#8e8e8e!important;stroke-width:1.8!important;display:block!important}
  .bottom-nav a.active{color:#fff!important;background:transparent!important;background-color:transparent!important;border-radius:0!important;padding:4px 10px!important;box-shadow:none!important;border-bottom:2px solid #FF2DCC!important}
  .bottom-nav a.active svg{stroke:#fff!important;fill:none!important}
  .bottom-nav a.active span{color:#fff!important;font-weight:900!important}
  .bottom-nav span{font-size:10px!important}
  .followBtnPost,.followBtnSearch,.followBtnPerusa{ background:transparent!important;color:#fff!important;border:1.5px solid #fff!important;padding:4px 12px!important;border-radius:8px!important;font-size:12px!important;font-weight:700!important;cursor:pointer!important }
  .followBtnPost.following,.followBtnSearch.following,.followBtnPerusa.following{ border-color:#666!important;color:#aaa!important }
  #pixoroTopNote{ position:fixed!important; top:58px!important; left:0!important; right:0!important; z-index:999!important; display:flex!important; justify-content:center!important; pointer-events:none!important; background:transparent!important; }
  #pixoroTopNote div{ background:rgba(0,0,0,0.65)!important; backdrop-filter:blur(10px); color:#fff!important; font-size:12px!important; font-weight:700!important; padding:8px 14px!important; border-radius:0 0 16px 16px!important; border:1px solid rgba(255,255,255,0.15)!important; border-top:0!important; pointer-events:auto!important; cursor:pointer!important; }
  .pfpRing{ width:40px;height:40px;border-radius:50%;padding:2px;background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5); flex-shrink:0; }
  .pfpInner{ width:100%;height:100%;border-radius:50%;overflow:hidden;background:#000;display:grid;place-items:center; }
  .pfpInner img{ width:100%;height:100%;object-fit:cover; }
  /* ✅ LIKE FIX - vBar Mela da - Video Click ah Pudikka Koodathu da */
  .vBar{position:absolute!important;right:10px!important;bottom:110px!important;z-index:50!important;pointer-events:auto!important}
  .vBtn{pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important}
  .vBtn.liked svg,.vBtn.liked svg path{fill:#FF3040!important;stroke:#FF3040!important}
  .centerCtrl{display:none!important}.centerCtrl.show{display:flex!important}
  `;
  let s = document.createElement('style'); s.id='pixoro-speed-css'; s.innerText = css; document.head.appendChild(s);
  if(location.pathname.includes('index') || location.pathname.endsWith('/')){
    if(document.body) document.body.classList.add('isHome');
    else document.addEventListener('DOMContentLoaded', ()=>{ if(document.body) document.body.classList.add('isHome'); });
  }
  function addTopNote(){
    if(document.getElementById('pixoroTopNote')) return;
    if(!document.body) return;
    let n = document.createElement('div');
    n.id = 'pixoroTopNote';
    n.innerHTML = `<div id="topNoteInner">🔔 Pixoro - New Updates Paaru da › <span id="topNoteClose" style="margin-left:8px;opacity:.6;padding:0 6px;cursor:pointer">✕</span></div>`;
    document.body.appendChild(n);
    document.getElementById('topNoteInner').onclick = ()=>{ location.href='dm.html'; };
    document.getElementById('topNoteClose').onclick = (e)=>{ e.stopPropagation(); n.style.display='none'; };
    setTimeout(()=>{ if(n) n.style.display='none'; }, 5000);
  }
  if(document.readyState !== 'loading') addTopNote();
  else document.addEventListener('DOMContentLoaded', addTopNote);
})();

window._PIXORO_PFP_CACHE = {};
window.getPfp = function(p){
  if(!p) return 'https://ui-avatars.com/api/?name=P&background=ff5ea8&color=fff&size=200&bold=true';
  if(typeof p === 'string' && p.includes('http')) return p;
  if(p.avatar_url) return p.avatar_url;
  if(p.profile_pic) return p.profile_pic;
  if(p.photo_url) return p.photo_url;
  let n = p.username || 'P';
  return 'https://ui-avatars.com/api/?name='+String(n).charAt(0)+'&background=ff5ea8&color=fff&size=200&bold=true';
};
window.pixoroRefreshPhotos = async function(){ return; };
window.ME_ID = window.ME_ID || null;
window.ME_RAW = window.ME_RAW || '';
function pixoroIsUuid(s){ return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s||'')); }
window.pixoroIsUuid = pixoroIsUuid;
async function pixoroFixMe(){
  if(window.ME_ID && pixoroIsUuid(window.ME_ID)) return;
  try{
    let s = pixoroGetSupa(); if(!s) return;
    let {data:{session}} = await s.auth.getSession();
    if(session?.user?.id){
      window.ME_ID = session.user.id;
      let {data:pr} = await s.from('profiles').select('username').eq('id', window.ME_ID).maybeSingle();
      if(pr) window.ME_RAW = pr.username;
      pixoroLoadFollowing();
    }
  }catch(e){}
}
async function getAllPixoroPosts(){
  let s = pixoroGetSupa(); if(!s) return [];
  let all = [];
  try{ let r1 = await s.from('posts').select('*').order('created_at',{ascending:false}).limit(100); if(r1.data) all = all.concat(r1.data.map(p=>({...p,_from:'posts'}))); }catch(e){}
  try{ let r2 = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(100); if(r2.data) all = all.concat(r2.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
  let seen = new Set(), out = [];
  for(let p of all){
    let url = String(p.media_url||p.video_url||p.image_url||p.image||'').split('?')[0].toLowerCase();
    if(url && seen.has(url)) continue;
    if(url) seen.add(url);
    out.push(p);
  }
  return out;
}
async function pixoroRemoveFromGrid(postId){
  if(!pixoroIsUuid(postId)) return;
  let s = pixoroGetSupa(); if(!s) return;
  await s.from('posts').update({is_archived:true}).eq('id',postId);
  location.reload();
}
async function pixoroUnhidePost(postId){
  if(!pixoroIsUuid(postId)) return;
  let s = pixoroGetSupa(); if(!s) return;
  await s.from('posts').update({is_archived:false}).eq('id',postId);
  location.reload();
}
async function pixoroMuteUser(userId){
  if(!pixoroIsUuid(window.ME_ID) || !pixoroIsUuid(userId)) return;
  let s = pixoroGetSupa(); if(!s) return;
  try{ await s.from('muted_users').insert({user_id:window.ME_ID, muted_user_id:userId}); }catch(e){}
  location.reload();
}
async function pixoroBlockUser(target){
  let raw = String(target||'').trim(); if(!raw || raw==='null' || raw==='undefined') return;
  if(!confirm('Full ah Block Pannava da?')) return;
  let s = pixoroGetSupa(); if(!s) return;
  let {data, error} = await s.rpc('toggle_block_by_name', {target_name: raw});
  if(error) return;
  setTimeout(()=> location.reload(), 500);
}
async function pixoroGetHiddenIds(){
  let s = pixoroGetSupa(); if(!s) return [];
  try{ let {data} = await s.from('posts').select('id').eq('is_archived',true).limit(100); return (data||[]).map(p=>String(p.id)); }catch(e){ return []; }
}
async function pixoroGetMutedIds(){
  if(!pixoroIsUuid(window.ME_ID)) return [];
  let s = pixoroGetSupa(); if(!s) return [];
  try{ let {data} = await s.from('muted_users').select('muted_user_id').eq('user_id',window.ME_ID); return (data||[]).map(x=>String(x.muted_user_id)); }catch(e){ return []; }
}
async function pixoroGetBlockedIds(){
  if(!pixoroIsUuid(window.ME_ID)) return [];
  let s = pixoroGetSupa(); if(!s) return [];
  try{ let {data} = await s.from('blocked_users').select('blocked_user_id').eq('user_id',window.ME_ID); return (data||[]).map(x=>String(x.blocked_user_id)); }catch(e){ return []; }
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
  if(!all || all.length === 0) return [];
  let blocked = await pixoroGetBlockedIds();
  let clean = (all||[]).filter(p=>{
    if(p.is_archived === true) return false;
    if(p.visibility === 'private_share') return false;
    if(p.user_id && blocked.includes(String(p.user_id))) return false;
    return true;
  });
  clean.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  return clean;
}
// ✅ CORRECTED - pixoroReelSetup la Click Handler Illa da - Reels oda Touch oda Sandai Illa da
function pixoroReelSetup(videoEl, postId, userId){
  if(!videoEl) return;
  videoEl.loop = true; videoEl.muted = true; videoEl.playsInline = true; videoEl.autoplay = true;
  videoEl.addEventListener('timeupdate', async ()=>{
    if(!videoEl.dataset.counted && videoEl.currentTime > 3){
      videoEl.dataset.counted='1';
      if(!pixoroIsUuid(window.ME_ID) || !pixoroIsUuid(postId)) return;
      let s = pixoroGetSupa(); if(!s) return;
      try{ await s.from('views').insert({post_id:postId, user_id:window.ME_ID}); }catch(e){}
    }
  });
  // ❌ Pazhaya Click Double-Tap Handler ah Remove Panniten da - Reels.js Thaan Handle Pannum da
}
async function pixoroSendNotification(toUserId, type, postId, message){ return; }
window.pixoroSendNotification = pixoroSendNotification;
async function pixoroSave(postId, userId){
  await pixoroFixMe();
  if(!pixoroIsUuid(window.ME_ID) || !pixoroIsUuid(postId)) return;
  let s = pixoroGetSupa(); if(!s) return;
  try{
    let {data:ex} = await s.from('saves').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    if(ex) return;
    await s.from('saves').insert({post_id:postId, user_id:window.ME_ID});
  }catch(e){}
}
function pixoroOnDMSent(toUserId){ console.log("Pixoro DM Sent to:", toUserId); }
async function getPixoroExplore(myId, myFollows){
  let all = await getAllPixoroPosts();
  return (all||[]).filter(p=> String(p.user_id)!==String(myId) && !myFollows.includes(String(p.user_id)));
}
async function pixoroSavePost(fileUrl, isReel, caption){
  let s = pixoroGetSupa(); if(!s) return;
  let {data:{session}} = await s.auth.getSession();
  if(!session) return;
  let cap = caption || 'Just Pixoro';
  let row = { user_id: session.user.id, username: window.ME_RAW, media_url: fileUrl, video_url: isReel ? fileUrl : null, image_url: !isReel ? fileUrl : null, media_type: isReel ? 'reel' : 'post', caption: cap, is_archived:false, visibility:'public' };
  let {error} = await s.from('posts').insert(row);
  if(error){ console.log('POST SAVE FAIL', error.message); return; }
  if(isReel && window.uploadReelPixoro){ await window.uploadReelPixoro(session.user.id, fileUrl, false, null, cap); }
  location.href = isReel ? './reels.html' : './index.html';
}
async function loadProfileRealCount(){
  await pixoroFixMe();
  let all = await getAllPixoroPosts();
  let myId = window.ME_ID;
  let myRaw = (window.ME_RAW||'').toLowerCase().replace('@','');
  let mine = all.filter(p=>{
    let uid = p.user_id && String(p.user_id)===String(myId);
    let name = String(p.username||'').toLowerCase().replace('@','')===myRaw;
    return (uid || name) && p.is_archived !== true;
  });
  let reels = mine.filter(p=>{
    let url = (p.video_url||p.media_url||p.image_url||'').toLowerCase();
    return url.includes('.mp4') || url.includes('.mov') || p.media_type==='reel' || p.media_type==='video' || p._from==='reels';
  });
  document.querySelectorAll('#postCount, .postCount').forEach(e=> e.innerText = mine.length);
  document.querySelectorAll('#reelCount, .reelCount').forEach(e=> e.innerText = reels.length);
  return {mine, reels};
}
async function pixoroOpenFollowList(type){
  if(!window.ME_ID) await pixoroFixMe();
  let s = pixoroGetSupa(); if(!s) return;
  let list = [];
  if(type==='following'){ let {data} = await s.from('follows').select('*').eq('follower_id', window.ME_ID).eq('status','accepted'); list = data||[]; }
  else { let {data} = await s.from('follows').select('*').eq('following_id', window.ME_ID).eq('status','accepted'); list = data||[]; }
  let ids = list.map(f=> type==='following' ? f.following_id : f.follower_id).filter(Boolean);
  let profs = [];
  if(ids.length){ let {data} = await s.from('profiles').select('id,username,avatar_url').in('id', ids); profs = data||[]; }
  let html = list.map(f=>{
    let pid = type==='following' ? f.following_id : f.follower_id;
    let pr = (profs||[]).find(p=> String(p.id)===String(pid));
    let uname = pr?.username || f.following_name || f.follower_name || 'user';
    let pfp = pr?.avatar_url || 'https://ui-avatars.com/api/?name='+uname.charAt(0)+'&background=ff5ea8&color=fff';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #222"><img src="${pfp}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"><b style="flex:1;color:#fff;cursor:pointer" onclick="location.href='./profile.html?u=${pid}'">${uname}</b><button onclick="location.href='./profile.html?u=${pid}'" style="background:transparent;color:#fff;border:1.2px solid #fff;padding:6px 14px;border-radius:20px;font-weight:700">View</button></div>`;
  }).join('') || `<div style="color:#888;text-align:center;padding:20px">No ${type} yet</div>`;
  let old = document.getElementById('followModal'); if(old) old.remove();
  let m = document.createElement('div'); m.id = 'followModal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  m.onclick = (e)=>{ if(e.target===m) m.remove(); };
  m.innerHTML = `<div style="background:#1a1a1d;width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:70vh;overflow-y:auto;padding:10px 0 30px"><div style="text-align:center;color:#fff;font-weight:800;padding:10px">${type==='following'?'Following':'Followers'} (${list.length})</div>${html}</div>`;
  document.body.appendChild(m);
}
async function pixoroLoadFollowCounts(){
  if(!pixoroIsUuid(window.ME_ID)) return;
  let s = pixoroGetSupa(); if(!s) return;
  let {count: followers} = await s.from('follows').select('*', {count:'exact', head:true}).eq('following_id', window.ME_ID).eq('status','accepted');
  let {count: following} = await s.from('follows').select('*', {count:'exact', head:true}).eq('follower_id', window.ME_ID).eq('status','accepted');
  followers = followers||0; following = following||0;
  document.querySelectorAll('#followerCount, .followerCount').forEach(e=>{ if(String(e.innerText)!==String(followers)) e.innerText = followers; });
  document.querySelectorAll('#followingCount, .followingCount').forEach(e=>{ if(String(e.innerText)!==String(following)) e.innerText = following; });
  return {followers, following};
}
window.getPixoroFeed = getPixoroFeed;
window.pixoroReelSetup = pixoroReelSetup;
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
window.PIXORO_FOLLOWING = window.PIXORO_FOLLOWING || new Set();
window.PIXORO_FOLLOWING_NAMES = window.PIXORO_FOLLOWING_NAMES || new Set();
window.PIXORO_ID_TO_NAME = window.PIXORO_ID_TO_NAME || {};
window.PIXORO_NAME_TO_ID = window.PIXORO_NAME_TO_ID || {};
function pixoroCleanName(n){ return String(n||'').trim().replace('@','').toLowerCase(); }
function pixoroIsFollowing(check){
  check = String(check||'');
  if(!check) return false;
  if(window.PIXORO_FOLLOWING.has(check)) return true;
  if(window.PIXORO_FOLLOWING_NAMES.has(pixoroCleanName(check))) return true;
  let name = window.PIXORO_ID_TO_NAME[check];
  if(name && window.PIXORO_FOLLOWING_NAMES.has(pixoroCleanName(name))) return true;
  let id = window.PIXORO_NAME_TO_ID[pixoroCleanName(check)];
  if(id && window.PIXORO_FOLLOWING.has(String(id))) return true;
  return false;
}
function pixoroPaintAllFollowBtns(){
  document.querySelectorAll('[data-follow-user], .followBtnPost, .followBtnSearch, .followBtnPerusa, .whiteBtn').forEach(btn=>{
    let raw = String(btn.dataset.followUser || btn.dataset.followUsername || '');
    if(!raw || raw==='null' || raw==='undefined') return;
    if(btn.classList.contains('whiteBtn') && !btn.dataset.followUser && !btn.dataset.followUsername) return;
    let isFollowing = pixoroIsFollowing(raw);
    let wantText = isFollowing ? 'Following' : 'Follow';
    let cur = String(btn.innerText||'').replace(/✓|✅|✔/g,'').trim();
    if(cur.includes('Following')) cur='Following'; else if(cur.includes('Follow')) cur='Follow';
    if(cur !== wantText) btn.innerText = wantText;
    if(btn.classList.contains('following') !== isFollowing) btn.classList.toggle('following', isFollowing);
    btn.dataset.followState = isFollowing ? 'following' : 'follow';
  });
}
function pixoroLoadFollowing(){
  let s = pixoroGetSupa(); if(!s) return;
  if(!pixoroIsUuid(window.ME_ID)){
    s.auth.getSession().then(({data:{session}})=>{ if(session?.user?.id){ window.ME_ID=session.user.id; pixoroLoadFollowing(); } }).catch(()=>{});
    return;
  }
  pixoroPaintAllFollowBtns();
  s.from('follows').select('following_id').eq('follower_id', window.ME_ID).eq('status','accepted').then(({data})=>{
    window.PIXORO_FOLLOWING = new Set((data||[]).map(x=>String(x.following_id)));
    pixoroPaintAllFollowBtns();
  }).catch(()=>{});
  s.from('profiles').select('id,username').limit(200).then(({data})=>{
    (data||[]).forEach(p=>{
      window.PIXORO_ID_TO_NAME[String(p.id)] = pixoroCleanName(p.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(p.username)] = String(p.id);
    });
    window.PIXORO_FOLLOWING_NAMES = new Set([...window.PIXORO_FOLLOWING].map(id=>pixoroCleanName(window.PIXORO_ID_TO_NAME[id]||'')).filter(Boolean));
    pixoroPaintAllFollowBtns();
  }).catch(()=>{});
}
async function pixoroResolveName(raw){
  raw = pixoroCleanName(raw);
  if(!raw || raw==='null' || raw==='undefined' || raw==='nan') return {id:null, name:null};
  if(window.PIXORO_NAME_TO_ID[raw]) return {id: window.PIXORO_NAME_TO_ID[raw], name: raw};
  if(pixoroIsUuid(raw) && window.PIXORO_ID_TO_NAME[raw]) return {id: raw, name: pixoroCleanName(window.PIXORO_ID_TO_NAME[raw])};
  let s = pixoroGetSupa(); if(!s) return {id:null, name: raw};
  try{
    let {data} = await s.from('profiles').select('id,username').ilike('username', raw).maybeSingle();
    if(data && data.id){
      window.PIXORO_ID_TO_NAME[String(data.id)] = pixoroCleanName(data.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(data.username)] = String(data.id);
      return {id: String(data.id), name: pixoroCleanName(data.username)};
    }
  }catch(e){}
  try{
    let {data} = await s.from('posts').select('user_id,username').ilike('username', raw).limit(1).maybeSingle();
    if(data && data.user_id && pixoroIsUuid(data.user_id)){
      window.PIXORO_NAME_TO_ID[raw] = String(data.user_id);
      window.PIXORO_ID_TO_NAME[String(data.user_id)] = raw;
      return {id: String(data.user_id), name: raw};
    }
  }catch(e){}
  return {id:null, name: raw};
}
function pixoroToggleFollow(target, btn){
  let raw = String(target||'').trim();
  if(!raw || raw==='null' || raw==='undefined'){
    let b = btn || document.activeElement;
    raw = b?.dataset?.followUsername || b?.dataset?.followUser || '';
  }
  if(!raw || raw==='null' || raw==='undefined'){ return false; }
  let name = pixoroCleanName(raw);
  if(!name || name==='user') return false;
  if(name === pixoroCleanName(window.ME_RAW)) return false;
  let was = pixoroIsFollowing(name);
  let want = !was;
  if(want) window.PIXORO_FOLLOWING_NAMES.add(name); else window.PIXORO_FOLLOWING_NAMES.delete(name);
  pixoroPaintAllFollowBtns();
  if(btn){ btn.innerText = want ? 'Following' : 'Follow'; btn.classList.toggle('following', want); }
  window.dispatchEvent(new Event('pixoroFollowChanged'));
  (async()=>{
    try{
      let r = await pixoroResolveName(name); let id = r.id;
      let s = pixoroGetSupa(); if(!s) return;
      let {data, error} = await s.rpc('toggle_follow_by_name', {target_name: name});
      if(error){
        if(was) window.PIXORO_FOLLOWING_NAMES.add(name); else window.PIXORO_FOLLOWING_NAMES.delete(name);
        pixoroPaintAllFollowBtns();
        return;
      }
      if(id){
        if(data) window.PIXORO_FOLLOWING.add(id); else window.PIXORO_FOLLOWING.delete(id);
        if(data) window.PIXORO_FOLLOWING_NAMES.add(name); else window.PIXORO_FOLLOWING_NAMES.delete(name);
      }
      pixoroLoadFollowing();
      if(window.pixoroLoadFollowCounts) window.pixoroLoadFollowCounts();
    }catch(e){}
  })();
  return want;
}
function pixoroSyncFollowBtn(targetId, following){
  targetId = String(targetId);
  let name = window.PIXORO_ID_TO_NAME[targetId] || pixoroCleanName(targetId);
  if(following){ window.PIXORO_FOLLOWING.add(targetId); window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); }
  else { window.PIXORO_FOLLOWING.delete(targetId); window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name)); }
  pixoroPaintAllFollowBtns();
}
window.pixoroToggleFollow = pixoroToggleFollow;
window.toggleFollow = pixoroToggleFollow;
window.toggleF = pixoroToggleFollow;
window.pixoroLoadFollowing = pixoroLoadFollowing;
window.pixoroPaintAllFollowBtns = pixoroPaintAllFollowBtns;
window.pixoroSyncFollowBtn = pixoroSyncFollowBtn;
window.pixoroIsFollowing = pixoroIsFollowing;
window.pixoroResolveId = async (t)=>{ let r = await pixoroResolveName(t); return r.id; };
document.addEventListener('DOMContentLoaded', ()=>{ pixoroFixMe(); pixoroLoadFollowing(); });
if(document.readyState !== 'loading'){ pixoroFixMe(); pixoroLoadFollowing(); }
console.log('PIXORO CORE v1025 - CORRECTED DA');
const PHOTO_CONFIG = { maxSize: 5*1024*1024, allowed: ['image/jpeg','image/png','image/webp'], maxCount: 5 };
async function pixoroCleanPhoto(file){
  if(!PHOTO_CONFIG.allowed.includes(file.type)) throw new Error('JPG / PNG / WEBP mattum da');
  if(file.size > PHOTO_CONFIG.maxSize) throw new Error('Photo 5MB ku mela irukka koodathu da');
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const maxW = 1080; let w=bmp.width, h=bmp.height;
  if(w>maxW){ h=h*maxW/w; w=maxW; }
  canvas.width=w; canvas.height=h;
  canvas.getContext('2d').drawImage(bmp,0,0,w,h);
  const blob = await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.85));
  return new File([blob], 'photo_'+Date.now()+'.jpg', {type:'image/jpeg'});
}
async function pixoroUploadPhoto(file, chatId){
  const clean = await pixoroCleanPhoto(file);
  const path = `${window.ME_ID}/${chatId}/${Date.now()}_${clean.name}`;
  let s = pixoroGetSupa(); if(!s) throw new Error('Supabase illa da');
  const {error} = await s.storage.from('dms').upload(path, clean, {upsert:false});
  if(error) throw error;
  return path;
}
async function pixoroGetPhotoUrl(path){
  if(!path) return '';
  if(path.includes('http')) return path;
  let s = pixoroGetSupa(); if(!s) return '';
  let {data} = s.storage.from('dms').getPublicUrl(path);
  return data?.publicUrl || '';
}
async function pixoroCanSendPhotoTo(otherId){
  if(!pixoroIsUuid(window.ME_ID) || !pixoroIsUuid(otherId)) return {ok:false, msg:'Invalid user da'};
  let s = pixoroGetSupa(); if(!s) return {ok:false, msg:'Supabase illa da'};
  try{
    const {data} = await s.from('blocked_users').select('*').or(`and(user_id.eq.${otherId},blocked_user_id.eq.${window.ME_ID}),and(user_id.eq.${window.ME_ID},blocked_user_id.eq.${otherId})`);
    if(data && data.length) return {ok:false, msg:'Blocked user da'};
  }catch(e){}
  try{
    const {data:priv} = await s.from('privacy_settings').select('*').eq('user_id',otherId).maybeSingle();
    if(priv && priv.photo_from==='nobody') return {ok:false, msg:'Avanga photo receive panna maataanga da'};
    if(priv && priv.photo_from==='followers' && !pixoroIsFollowing(otherId)) return {ok:false, msg:'Followers mattum photo anuppa mudiyum da'};
  }catch(e){}
  return {ok:true};
}
async function pixoroUnsendPhoto(msgId, mediaPath){
  if(!pixoroIsUuid(window.ME_ID)) return;
  let s = pixoroGetSupa(); if(!s) return;
  if(mediaPath) await s.storage.from('dms').remove([mediaPath]);
  await s.from('messages').delete().eq('id',msgId).eq('sender_id',window.ME_ID);
}
async function pixoroReportPhoto(otherId, msgId, reason){
  if(!pixoroIsUuid(window.ME_ID)) return;
  let s = pixoroGetSupa(); if(!s) return;
  await s.from('reports').insert({reported_by: window.ME_ID, reported_id: otherId, message_id: msgId, reason: reason||'Unsafe photo'});
}
async function pixoroSavePhoto(mediaPath){ return; }
function pixoroPreviewText(m){
  if(!m) return '';
  if(m.type==='image' || m.media_type==='image' || m.media_path) return 'Photo';
  if(m.type==='video' || m.media_type==='video') return 'Video';
  if(m.type==='voice') return 'Voice';
  return 'Message';
}
window.pixoroCleanPhoto = pixoroCleanPhoto;
window.pixoroUploadPhoto = pixoroUploadPhoto;
window.pixoroGetPhotoUrl = pixoroGetPhotoUrl;
window.pixoroCanSendPhotoTo = pixoroCanSendPhotoTo;
window.pixoroUnsendPhoto = pixoroUnsendPhoto;
window.pixoroReportPhoto = pixoroReportPhoto;
window.pixoroSavePhoto = pixoroSavePhoto;
window.pixoroPreviewText = pixoroPreviewText;
async function pixoroCheckBell(){
  try{
    let s = pixoroGetSupa(); if(!s) return;
    if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session?.user?.id) window.ME_ID = session.user.id; else return; }
    let {data} = await s.from('notifications').select('id').eq('to_user_id', window.ME_ID).eq('is_read', false).limit(1);
    let dot = document.getElementById('pixoroBellDot');
    if(dot) dot.style.display = (data && data.length) ? 'block' : 'none';
  }catch(e){}
}
window.pixoroCheckBell = pixoroCheckBell;
setInterval(pixoroCheckBell, 15000);
setTimeout(pixoroCheckBell, 3000);
window.MY_PFP = window.MY_PFP || '';
async function syncMyPhotoEverywhere(){
  let photo = window.MY_PFP || window.ME_PFP || '';
  if(!photo){
    let nav = document.getElementById('navPfp');
    if(nav && nav.src && nav.src.length > 20 && !nav.src.includes('ui-avatars')) photo = nav.src;
  }
  if(!photo){
    let postImg = document.querySelector('.post .pfpInner img');
    if(postImg && postImg.src && postImg.src.length > 20 && !postImg.src.includes('ui-avatars')) photo = postImg.src;
  }
  if(!photo){
    try{
      let s = pixoroGetSupa();
      if(s){
        let {data:{session}} = await s.auth.getSession();
        let uid = window.ME_ID || session?.user?.id;
        if(uid){
          window.ME_ID = uid;
          let {data:prof} = await s.from('profiles').select('avatar_url').eq('id', uid).maybeSingle();
          if(prof && prof.avatar_url && String(prof.avatar_url).length > 20) photo = String(prof.avatar_url);
        }
      }
    }catch(e){}
  }
  if(!photo) return;
  window.MY_PFP = photo; window.ME_PFP = photo;
  document.querySelectorAll('.myPfp, #navPfp, #myStoryImg, #myCommentPfpWrap img, #storyViewerPfp').forEach(function(img){
    if(img && img.tagName === 'IMG' && img.src !== photo){ img.src = photo; img.style.display = 'block'; }
  });
  let myLetter = document.getElementById('myStoryLetter');
  if(myLetter) myLetter.style.display = 'none';
}
window.syncMyPhotoEverywhere = syncMyPhotoEverywhere;
setInterval(syncMyPhotoEverywhere, 2000);
if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', syncMyPhotoEverywhere); } else { syncMyPhotoEverywhere(); }

// ===== ✅ V1025 CORRECT ADD - LIKE FINAL GUARD - Kadasiya Irukkanum da =====
(function(){
  "use strict";
  if(window.PIXORO_LIKE_GUARD) return;
  window.PIXORO_LIKE_GUARD = true;
  function corePaint(btn, liked){
    if(!btn) return;
    btn.classList.toggle("liked", liked);
    let svg = btn.querySelector("svg");
    if(svg){ svg.setAttribute("fill", liked ? "#FF3040" : "none"); svg.setAttribute("stroke", liked ? "#FF3040" : "#fff"); svg.style.fill = liked ? "#FF3040" : "none"; }
    let path = btn.querySelector("svg path");
    if(path){ path.setAttribute("fill", liked ? "#FF3040" : "none"); path.style.fill = liked ? "#FF3040" : "none"; }
  }
  function coreLike(id, btn){
    if(!btn) return;
    let clean = String(id || btn.closest(".reel")?.dataset?.id || "").replace("reel-","");
    if(!clean) return;
    try{
      if(!window.FEED_LIKES) window.FEED_LIKES = new Set(JSON.parse(localStorage.getItem("pixoro_likes")||"[]").map(String));
      if(!window.FEED_COUNTS) window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts")||"{}");
    }catch(_){ window.FEED_LIKES = window.FEED_LIKES || new Set(); window.FEED_COUNTS = window.FEED_COUNTS || {}; }
    let liked = !window.FEED_LIKES.has(clean);
    if(liked) window.FEED_LIKES.add(clean); else window.FEED_LIKES.delete(clean);
    let oldC = Number(window.FEED_COUNTS[clean] ?? btn.querySelector(".rCount")?.textContent ?? 0);
    let newC = liked ? oldC + 1 : Math.max(0, oldC - 1);
    window.FEED_COUNTS[clean] = newC;
    try{ localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES])); localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS)); }catch(_){}
    corePaint(btn, liked);
    let cnt = btn.querySelector(".rCount"); if(cnt) cnt.textContent = newC;
    try{ btn.getAnimations().forEach(a=>a.cancel()); }catch(_){}
    btn.animate([{transform:"scale(1)"},{transform:"scale(1.5)"},{transform:"scale(1)"}],{duration:400});
    try{
      let supa = window.getSupa ? window.getSupa() : window.supa;
      if(supa && /^[0-9a-f-]{36}$/i.test(clean)){
        supa.auth.getSession().then(r=>{
          let uid = r.data?.session?.user?.id; if(!uid) return;
          if(liked) supa.from("likes").insert({post_id:clean, user_id:uid}).then(()=>{});
          else supa.from("likes").delete().eq("post_id",clean).eq("user_id",uid).then(()=>{});
        });
      }
    }catch(_){}
  }
  window.likeReel = function(id, el, e){ if(e){ e.stopPropagation(); e.preventDefault(); } coreLike(id, el); };
  window.pixoroLikeReel = window.likeReel;
  document.addEventListener("touchend", e=>{
    let btn = e.target.closest('[data-action="like"]');
    if(!btn || !btn.closest(".reel")) return;
    e.stopPropagation(); e.preventDefault();
    btn.dataset.coreTouched = "1";
    setTimeout(()=>{ btn.dataset.coreTouched = ""; }, 600);
    coreLike(btn.closest(".reel")?.dataset?.id, btn);
  }, { passive:false, capture:true });
  document.addEventListener("click", e=>{
    let btn = e.target.closest('[data-action="like"]');
    if(!btn || !btn.closest(".reel")) return;
    if(btn.dataset.coreTouched === "1") return;
    e.stopPropagation(); e.preventDefault();
    coreLike(btn.closest(".reel")?.dataset?.id, btn);
  }, { capture:true });
  function corePaintSaved(){
    try{
      if(!window.FEED_LIKES) window.FEED_LIKES = new Set(JSON.parse(localStorage.getItem("pixoro_likes")||"[]").map(String));
      if(!window.FEED_COUNTS) window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts")||"{}");
    }catch(_){}
    document.querySelectorAll('.reel [data-action="like"]').forEach(btn=>{
      let clean = String(btn.closest(".reel")?.dataset?.id || "").replace("reel-","");
      if(!clean) return;
      corePaint(btn, window.FEED_LIKES.has(clean));
      let cnt = btn.querySelector(".rCount");
      if(cnt && window.FEED_COUNTS[clean] !== undefined) cnt.textContent = window.FEED_COUNTS[clean];
    });
  }
  setInterval(corePaintSaved, 1000);
  console.log("✅ PIXORO CORE LIKE GUARD LOADED da");
})();
