// ===== PIXORO MAIN - SERVER ONLY - v213 - CORRECTED DA =====
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllY3BsdG5kaGx6ZmpwbHpoY3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTkzODksImV4cCI6MjEwNTIzNTM4OX0.I5icBkP7A-Lpt-EJhrOrBDZYG-G9fW8qKbbaQbnQHSM';
if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log("✅ Pixoro Supa Connected da!");
}

// ===== GITHUB BASE FIX - ITHU THAAN 404 FIX DA 🔥 =====
function pixoroGetBase(){
  return location.href.split('?')[0].split('#')[0].replace(/\/[^\/]*$/,'/') + '';
}
window.pixoroGetBase = pixoroGetBase;
window.getBase = pixoroGetBase;

// ===== GOLD TICK - CORRECTED DA =====
function isGoldUser(p){
  if(!p) return false;
  if(p.is_gold === true) return true;
  if(p.is_verified === true) return true;
  if(p.gold_tick === true) return true;
  let u = String(p.username||p.name||'').toLowerCase().replace('@','').trim();
  return u === 'giri_official' || u === 'giri_ceo';
}
function goldTickHTML(p){
  if(!isGoldUser(p)) return '';
  return ' <span style="color:#FFD700;font-size:14px">✔</span>';
}
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

(function(){
  if(document.getElementById('pixoro-speed-css')) return;
  let css = `
  *{ -webkit-tap-highlight-color:transparent!important; tap-highlight-color:transparent!important; }
  button, a, div, img, video{ -webkit-tap-highlight-color:transparent!important; outline:none!important; -webkit-touch-callout:none!important; }
  button:active, a:active{ box-shadow:none!important; outline:none!important; transform:none!important; }
  button{ touch-action:manipulation!important; }
  .topPlus, .createBtn, .plusBtn, .topAdd{ width:auto!important;height:auto!important;background:transparent!important;background-image:none!important;color:#fff!important;border-radius:0!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:28px!important;font-weight:300!important;cursor:pointer!important;box-shadow:none!important;padding:0 6px!important;border:none!important; }
  .bellWhite{ display:flex!important;width:auto!important;height:auto!important;background:transparent!important;color:#fff!important;font-size:22px!important;cursor:pointer!important;border:none!important;align-items:center!important;justify-content:center!important;padding:0 8px!important; }
  .bellWhite svg{ width:22px!important;height:22px!important;stroke:#fff!important;fill:none!important; }
  .reelsTop b, .topTitle{ font-family:'Segoe UI',system-ui,sans-serif!important;font-size:20px!important;font-weight:600!important;color:#fff!important; }
  .reel-pfp-wrap{width:40px!important;height:40px!important;min-width:40px!important;border:2px solid #fff!important}
  .audioDisc{width:28px!important;height:28px!important;border:2px solid #fff!important}
  .reel-username{font-size:15px!important;font-weight:700!important;cursor:pointer!important}
  .msgBtn, .messageBtn{ background:transparent!important;color:#fff!important;border:1.2px solid #fff!important; }
  .createIco{ background:transparent!important;border:1.2px solid #fff!important;color:#fff!important; }
  .reel-main{ background:#000!important; }
  .reel-main.bgRemove{ object-fit:contain!important;background:#000!important; }
  `;
  let s = document.createElement('style'); s.id='pixoro-speed-css'; s.innerText = css; document.head.appendChild(s);
  if(location.pathname.includes('index') || location.pathname.endsWith('/')) document.body.classList.add('isHome');
})();
window._PIXORO_PFP_CACHE = window._PIXORO_PFP_CACHE || {};
window.getPfp = function(p){
  if(p && typeof p === 'object'){
    let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp || p?.photo_url;
    if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
    let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
    let cached = window._PIXORO_PFP_CACHE[name.toLowerCase()];
    if(cached) return cached;
    return 'https://ui-avatars.com/api/?name=' + name.charAt(0).toUpperCase() + '&background=111&color=fff&size=300&bold=true';
  }
  if(typeof p === 'string'){
    let name = p.replace('@','').trim() || 'G';
    let cached = window._PIXORO_PFP_CACHE[name.toLowerCase()];
    if(cached) return cached;
    return 'https://ui-avatars.com/api/?name=' + name.charAt(0).toUpperCase() + '&background=111&color=fff&size=300&bold=true';
  }
  return 'https://ui-avatars.com/api/?name=G&background=111&color=fff&size=300&bold=true';
};
window.pixoroRefreshPhotos = async function(){
  try{
    if(!window.supa) return;
    let {data:profs} = await window.supa.from('profiles').select('id,username,avatar_url,profile_pic,photo_url').limit(200);
    (profs||[]).forEach(pr=>{
      let url = pr.avatar_url || pr.profile_pic || pr.photo_url;
      if(!url) return;
      let uname = String(pr.username||'').toLowerCase().replace('@','');
      window._PIXORO_PFP_CACHE[uname] = url;
      window._PIXORO_PFP_CACHE[String(pr.id)] = url;
    });
    document.querySelectorAll('img[data-pfp-for], img[data-user-id], .reel-pfp-wrap img, .post-pfp img').forEach(img=>{
      let key = String(img.dataset.pfpFor || img.dataset.userId || img.alt || '').toLowerCase().replace('@','');
      let cached = window._PIXORO_PFP_CACHE[key];
      if(cached && img.src !== cached && !img.src.includes(cached.split('?')[0])) img.src = cached;
    });
  }catch(e){}
};
window.ME_ID = window.ME_ID || null;
window.ME_RAW = window.ME_RAW || 'giri_ceo';
async function pixoroFixMe(){
  if(window.ME_ID) return;
  try{
    let {data:{session}} = await window.supa.auth.getSession();
    if(session?.user?.id){
      window.ME_ID = session.user.id;
      let {data:pr} = await window.supa.from('profiles').select('username').eq('id', window.ME_ID).maybeSingle();
      if(pr) window.ME_RAW = pr.username;
      pixoroLoadFollowing();
    }
  }catch(e){}
}
async function getAllPixoroPosts(){
  let all = [];
  try{ let r1 = await window.supa.from('posts').select('*').order('created_at',{ascending:false}); if(r1.data) all = all.concat(r1.data.map(p=>({...p,_from:'posts'}))); }catch(e){ console.log('posts fetch fail', e.message); }
  try{ let r2 = await window.supa.from('reels').select('*').order('created_at',{ascending:false}); if(r2.data) all = all.concat(r2.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
  let seen = new Set(), out = [];
  for(let p of all){
    let url = String(p.media_url||p.video_url||'').split('?')[0].toLowerCase();
    if(url && seen.has(url)) continue;
    if(url) seen.add(url);
    out.push(p);
  }
  return out;
}
function pixoroIsRealPhoto(url){ return true; }
async function pixoroRemoveFromGrid(postId){
  await window.supa.from('posts').update({is_archived:true}).eq('id',postId);
  location.reload();
}
async function pixoroUnhidePost(postId){
  await window.supa.from('posts').update({is_archived:false}).eq('id',postId);
  location.reload();
}
async function pixoroMuteUser(userId){
  try{ await window.supa.from('muted_users').insert({user_id:window.ME_ID, muted_user_id:userId}); }catch(e){}
  location.reload();
}
async function pixoroBlockUser(target){
  let raw = String(target||'').trim(); if(!raw || raw==='null' || raw==='undefined') return;
  if(!confirm('Full ah Block Pannava da?')) return;
  let {data, error} = await window.supa.rpc('toggle_block_by_name', {target_name: raw});
  if(error){ return; }
  setTimeout(()=> location.reload(), 500);
}
async function pixoroGetHiddenIds(){
  try{ let {data} = await window.supa.from('posts').select('id').eq('is_archived',true); return (data||[]).map(p=>String(p.id)); }catch(e){ return []; }
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
  console.log('TOTAL POSTS da:', all.length);
  if(!all || all.length === 0) return [];
  let blocked = await pixoroGetBlockedIds();
  let clean = (all||[]).filter(p=>{
    if(p.is_archived === true) return false;
    if(p.user_id && blocked.includes(String(p.user_id))) return false;
    return true;
  });
  clean.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  return clean;
}
function pixoroReelSetup(videoEl, postId, userId){
  if(!videoEl) return;
  videoEl.loop = true; videoEl.muted = true; videoEl.playsInline = true; videoEl.autoplay = true;
  videoEl.addEventListener('timeupdate', async ()=>{
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
// ===== PIXORO NOTIFY - SERVER ONLY - CORRECTED v213 DA =====
async function pixoroSendNotification(toUserId, type, postId, message){
  try{
    if(!window.supa) return;
    if(!window.ME_ID){
      let {data:{session}} = await window.supa.auth.getSession();
      if(session?.user?.id) window.ME_ID = session.user.id;
      else return;
    }
    if(!toUserId) return;
    if(String(toUserId) === String(window.ME_ID)) return;
    // Duplicate check da
    if(type==='like' && postId){
      let {data:ex} = await window.supa.from('notifications').select('id').eq('to_user_id',toUserId).eq('from_user_id',window.ME_ID).eq('type','like').eq('post_id',postId).limit(1);
      if(ex && ex.length) return;
    }
    if(type==='follow'){
      let {data:ex2} = await window.supa.from('notifications').select('id').eq('to_user_id',toUserId).eq('from_user_id',window.ME_ID).eq('type','follow').limit(1);
      if(ex2 && ex2.length) return;
    }
    let {error} = await window.supa.from('notifications').insert({
      to_user_id: toUserId,
      from_user_id: window.ME_ID,
      from_username: window.ME_RAW || 'giri_ceo',
      type: type,
      post_id: postId || null,
      message: message || '',
      is_read: false
    });
    if(error) console.log('NOTIFY SAVE FAIL da', error.message);
    else console.log('NOTIFY SAVE OK da', type);
  }catch(e){}
}
window.pixoroSendNotification = pixoroSendNotification;
async function pixoroLike(postId, userId){
  // Duplicate like check da
  let {data:ex} = await window.supa.from('likes').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).limit(1);
  if(ex && ex.length) return;
  let {error} = await window.supa.from('likes').insert({post_id:postId, user_id:window.ME_ID});
  if(error) return;
  if(userId){ await pixoroSendNotification(userId, 'like', postId, 'liked your post'); }
}
async function pixoroSave(postId, userId){ await window.supa.from('saves').insert({post_id:postId, user_id:window.ME_ID}); }
function pixoroOnDMSent(toUserId){ console.log("Pixoro DM Sent to:", toUserId); }
async function getPixoroExplore(myId, myFollows){
  let all = await getAllPixoroPosts();
  return (all||[]).filter(p=> String(p.user_id)!==String(myId) && !myFollows.includes(String(p.user_id)));
}
// ===== SAVE POST - CORRECTED DA =====
async function pixoroSavePost(fileUrl, isReel, caption){
  let {data:{session}} = await window.supa.auth.getSession();
  if(!session) return;
  let row = { user_id: session.user.id, username: window.ME_RAW, media_url: fileUrl, video_url: isReel ? fileUrl : null, image_url: !isReel ? fileUrl : null, media_type: isReel ? 'reel' : 'post', caption: caption || 'Just Pixoro', is_archived:false };
  let {error} = await window.supa.from('posts').insert(row);
  if(error){ console.log('POST SAVE FAIL', error.message); return; }
  if(isReel){
    await window.supa.from('reels').insert({ username: window.ME_RAW, video_url: fileUrl, caption: caption || 'Just Pixoro', likes: 0 });
  }
  location.href = './reels.html';
}
async function loadProfileRealCount(){
  await pixoroFixMe();
  let all = await getAllPixoroPosts();
  let myId = window.ME_ID;
  let myRaw = (window.ME_RAW||'giri_ceo').toLowerCase().replace('@','');
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
  let {data:allFollows} = await window.supa.from('follows').select('*');
  let list = [];
  if(type==='following'){ list = (allFollows||[]).filter(f=> String(f.follower_id)===String(window.ME_ID)); }
  else { list = (allFollows||[]).filter(f=> String(f.following_id)===String(window.ME_ID)); }
  let {data:profs} = await window.supa.from('profiles').select('*');
  let html = list.map(f=>{
    let pid = type==='following' ? f.following_id : f.follower_id;
    let pr = (profs||[]).find(p=> String(p.id)===String(pid));
    let uname = pr?.username || f.following_name || f.follower_name || 'user';
    let pfp = pr?.avatar_url || pr?.profile_pic || 'https://ui-avatars.com/api/?name='+uname[0]+'&background=fff&color=000';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #222"><img src="${pfp}" onclick="location.href='./profile.html?u=${pid}'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer"><b style="flex:1;color:#fff;cursor:pointer" onclick="location.href='./profile.html?u=${pid}'">${uname}</b><button onclick="location.href='./profile.html?u=${pid}'" style="background:#fff;color:#000;border:0;padding:6px 14px;border-radius:20px;font-weight:700">View</button></div>`;
  }).join('') || `<div style="color:#888;text-align:center;padding:20px">No ${type} yet</div>`;
  let old = document.getElementById('followModal'); if(old) old.remove();
  let m = document.createElement('div'); m.id = 'followModal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  m.onclick = (e)=>{ if(e.target===m) m.remove(); };
  m.innerHTML = `<div style="background:#1a1a1d;width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:70vh;overflow-y:auto;padding:10px 0 30px"><div style="text-align:center;color:#fff;font-weight:800;padding:10px">${type==='following'?'Following':'Followers'} (${list.length})</div>${html}</div>`;
  document.body.appendChild(m);
}
async function pixoroLoadFollowCounts(){
  if(!window.ME_ID) return;
  let {data:allFollows} = await window.supa.from('follows').select('*');
  let followers = (allFollows||[]).filter(f=> String(f.following_id)===String(window.ME_ID)).length;
  let following = (allFollows||[]).filter(f=> String(f.follower_id)===String(window.ME_ID)).length;
  document.querySelectorAll('#followerCount, .followerCount').forEach(e=>{ if(String(e.innerText)!==String(followers)) e.innerText = followers; });
  document.querySelectorAll('#followingCount, .followingCount').forEach(e=>{ if(String(e.innerText)!==String(following)) e.innerText = following; });
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
window.PIXORO_FOLLOWING = window.PIXORO_FOLLOWING || new Set();
window.PIXORO_FOLLOWING_NAMES = window.PIXORO_FOLLOWING_NAMES || new Set();
window.PIXORO_ID_TO_NAME = window.PIXORO_ID_TO_NAME || {};
window.PIXORO_NAME_TO_ID = window.PIXORO_NAME_TO_ID || {};
function pixoroCleanName(n){ return String(n||'').trim().replace('@','').toLowerCase(); }
function pixoroIsUuid(s){ return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s||'')); }
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
  if(!window.supa) return;
  if(!window.ME_ID){
    window.supa.auth.getSession().then(({data:{session}})=>{ if(session?.user?.id){ window.ME_ID=session.user.id; pixoroLoadFollowing(); } }).catch(()=>{});
    return;
  }
  pixoroPaintAllFollowBtns();
  window.supa.from('follows').select('following_id').eq('follower_id', window.ME_ID).then(({data})=>{
    window.PIXORO_FOLLOWING = new Set((data||[]).map(x=>String(x.following_id)));
    pixoroPaintAllFollowBtns();
  }).catch(()=>{});
  window.supa.from('profiles').select('id,username,avatar_url,profile_pic,photo_url').limit(200).then(({data})=>{
    (data||[]).forEach(p=>{
      window.PIXORO_ID_TO_NAME[String(p.id)] = pixoroCleanName(p.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(p.username)] = String(p.id);
      let url = p.avatar_url || p.profile_pic || p.photo_url;
      if(url && String(url).includes('http')){ window._PIXORO_PFP_CACHE[pixoroCleanName(p.username)] = url; window._PIXORO_PFP_CACHE[String(p.id)] = url; }
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
  try{
    let {data} = await window.supa.from('profiles').select('id,username').ilike('username', raw).maybeSingle();
    if(data && data.id){
      window.PIXORO_ID_TO_NAME[String(data.id)] = pixoroCleanName(data.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(data.username)] = String(data.id);
      return {id: String(data.id), name: pixoroCleanName(data.username)};
    }
  }catch(e){}
  try{
    let {data} = await window.supa.from('posts').select('user_id,username').ilike('username', raw).limit(1).maybeSingle();
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
      let {data, error} = await window.supa.rpc('toggle_follow_by_name', {target_name: name});
      if(error){
        if(was) window.PIXORO_FOLLOWING_NAMES.add(name); else window.PIXORO_FOLLOWING_NAMES.delete(name);
        pixoroPaintAllFollowBtns();
        return;
      }
      if(id){
        if(data) window.PIXORO_FOLLOWING.add(id); else window.PIXORO_FOLLOWING.delete(id);
        if(data) window.PIXORO_FOLLOWING_NAMES.add(name); else window.PIXORO_FOLLOWING_NAMES.delete(name);
        if(data === true){ await pixoroSendNotification(id, 'follow', null, 'started following you'); }
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
console.log('PIXORO CORE v213 SERVER ONLY LOADED');
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
  const {error} = await window.supa.storage.from('dms').upload(path, clean, {upsert:false});
  if(error) throw error;
  return path;
}
async function pixoroGetPhotoUrl(path){
  if(!path) return '';
  if(path.startsWith('http')) return path;
  const {data,error} = await window.supa.storage.from('dms').createSignedUrl(path, 3600);
  if(error) return '';
  return data.signedUrl;
}
async function pixoroCanSendPhotoTo(otherId){
  try{
    const {data} = await window.supa.from('blocked_users').select('*').or(`and(user_id.eq.${otherId},blocked_user_id.eq.${window.ME_ID}),and(user_id.eq.${window.ME_ID},blocked_user_id.eq.${otherId})`);
    if(data && data.length) return {ok:false, msg:'Blocked user da'};
  }catch(e){}
  try{
    const {data:priv} = await window.supa.from('privacy_settings').select('*').eq('user_id',otherId).maybeSingle();
    if(priv && priv.photo_from==='nobody') return {ok:false, msg:'Avanga photo receive panna maataanga da'};
    if(priv && priv.photo_from==='followers' && !pixoroIsFollowing(otherId)) return {ok:false, msg:'Followers mattum photo anuppa mudiyum da'};
  }catch(e){}
  return {ok:true};
}
async function pixoroUnsendPhoto(msgId, mediaPath){
  if(mediaPath) await window.supa.storage.from('dms').remove([mediaPath]);
  await window.supa.from('messages').delete().eq('id',msgId).eq('sender_id',window.ME_ID);
}
async function pixoroReportPhoto(otherId, msgId, reason){
  await window.supa.from('reports').insert({reported_by: window.ME_ID, reported_id: otherId, message_id: msgId, reason: reason||'Unsafe photo'});
}
async function pixoroSavePhoto(mediaPath){
  const url = await pixoroGetPhotoUrl(mediaPath);
  if(!url) return;
  const a=document.createElement('a'); a.href=url; a.download='pixoro_photo.jpg'; a.click();
}
function pixoroPreviewText(m){
  if(!m) return '';
  if(m.type==='image' || m.media_type==='image' || m.media_path) return '📷 Photo';
  if(m.type==='video' || m.media_type==='video') return '🎬 Video';
  if(m.type==='voice') return '🎙️ Voice';
  return '💬 Message';
}
window.pixoroCleanPhoto = pixoroCleanPhoto;
window.pixoroUploadPhoto = pixoroUploadPhoto;
window.pixoroGetPhotoUrl = pixoroGetPhotoUrl;
window.pixoroCanSendPhotoTo = pixoroCanSendPhotoTo;
window.pixoroUnsendPhoto = pixoroUnsendPhoto;
window.pixoroReportPhoto = pixoroReportPhoto;
window.pixoroSavePhoto = pixoroSavePhoto;
window.pixoroPreviewText = pixoroPreviewText;
