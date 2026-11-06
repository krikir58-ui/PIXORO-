// ===== PIXORO MAIN - SERVER ONLY - v115 - PHOTO DM SAFE DA =====
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

if(!window.supa && window.supabase && window.supabase.createClient){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
  console.log("✅ Pixoro Supa Connected da!");
}

function isGoldUser(p){ return false; }
function goldTickHTML(p){ return ''; }
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;
window.getTick = goldTickHTML;

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
  if(typeof p === 'string'){
    let name = p.replace('@','').trim() || 'G';
    return 'https://ui-avatars.com/api/?name=' + name.charAt(0).toUpperCase() + '&background=111&color=fff&size=300&bold=true';
  }
  let url = p?.avatar_url || p?.avatar || p?.profile_pic || p?.pfp;
  if(url && String(url).startsWith('http') && !String(url).includes('undefined')) return url;
  let name = (p?.username || p?.name || 'G').toString().replace('@','').trim() || 'G';
  return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
};

window.ME_ID = window.ME_ID || null;
window.ME_RAW = window.ME_RAW || 'giri_ceo';

async function pixoroFixMe(){
  if(window.ME_ID) return;
  try{
    let {data:{session}} = await window.supa.auth.getSession();
    if(session?.user?.id){
      window.ME_ID = session.user.id;
      let {data:pr} = await window.supa.from('profiles').select('username').eq('id', window.ME_ID).single();
      if(pr) window.ME_RAW = pr.username;
      pixoroLoadFollowing();
    }
  }catch(e){}
}

async function getAllPixoroPosts(){
  let all = [];
  try{ let r1 = await window.supa.from('posts').select('*').order('created_at',{ascending:false}); if(r1.data) all = all.concat(r1.data.map(p=>({...p,_from:'posts'}))); }catch(e){ console.log('posts fetch fail', e.message); }
  try{ let r2 = await window.supa.from('reels').select('*').order('created_at',{ascending:false}); if(r2.data) all = all.concat(r2.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
  return all;
}
function pixoroIsRealPhoto(url){ return true; }

async function pixoroRemoveFromGrid(postId){
  await window.supa.from('posts').update({is_archived:true}).eq('id',postId);
  try{ await window.supa.from('reels').update({is_archived:true}).eq('id',postId); }catch(e){}
  location.reload();
}
async function pixoroUnhidePost(postId){
  await window.supa.from('posts').update({is_archived:false}).eq('id',postId);
  try{ await window.supa.from('reels').update({is_archived:false}).eq('id',postId); }catch(e){}
  location.reload();
}
async function pixoroMuteUser(userId){
  try{ await window.supa.from('muted_users').insert({user_id:window.ME_ID, muted_user_id:userId}); }catch(e){}
  location.reload();
}
// FIXED v115 - alert illa da - confirm mattum da
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
    if(blocked.includes(String(p.user_id))) return false;
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
async function pixoroLike(postId, userId){ await window.supa.from('likes').insert({post_id:postId, user_id:window.ME_ID}); }
async function pixoroSave(postId, userId){ await window.supa.from('saves').insert({post_id:postId, user_id:window.ME_ID}); }
function pixoroOnDMSent(toUserId){ console.log("Pixoro DM Sent to:", toUserId); }
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
  await pixoroFixMe();
  let all = await getAllPixoroPosts();
  let myId = window.ME_ID;
  let myRaw = (window.ME_RAW||'giri_ceo').toLowerCase().replace('@','');
  let mine = all.filter(p=>{
    let uid = String(p.user_id)===String(myId);
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
let _pixoroFollowBusy = {};
let _pixoroLoadingFollow = false;
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
  document.querySelectorAll('[data-follow-user]').forEach(btn=>{
    let raw = String(btn.dataset.followUser || btn.dataset.followUsername || '');
    if(!raw || raw==='null' || raw==='undefined') return;
    let isFollowing = pixoroIsFollowing(raw);
    let wantText = isFollowing ? 'Following ✓' : 'Follow';
    if(btn.innerText !== wantText) btn.innerText = wantText;
    if(btn.classList.contains('following') !== isFollowing) btn.classList.toggle('following', isFollowing);
    btn.dataset.followState = isFollowing ? 'following' : 'follow';
  });
}
async function pixoroLoadFollowing(){
  if(!window.supa || !window.ME_ID) return;
  if(_pixoroLoadingFollow) return;
  _pixoroLoadingFollow = true;
  try{
    let {data:profs} = await window.supa.from('profiles').select('id,username');
    (profs||[]).forEach(p=>{
      window.PIXORO_ID_TO_NAME[String(p.id)] = pixoroCleanName(p.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(p.username)] = String(p.id);
    });
    let {data} = await window.supa.from('follows').select('following_id').eq('follower_id', window.ME_ID);
    window.PIXORO_FOLLOWING = new Set((data||[]).map(x=>String(x.following_id)));
    window.PIXORO_FOLLOWING_NAMES = new Set([...window.PIXORO_FOLLOWING].map(id=>pixoroCleanName(window.PIXORO_ID_TO_NAME[id]||'')));
    pixoroPaintAllFollowBtns();
  }catch(e){}
  _pixoroLoadingFollow = false;
}
async function pixoroResolveName(raw){
  raw = pixoroCleanName(raw);
  if(!raw || raw==='null' || raw==='undefined' || raw==='nan') return {id:null, name:null};
  if(window.PIXORO_NAME_TO_ID[raw]) return {id: window.PIXORO_NAME_TO_ID[raw], name: raw};
  if(pixoroIsUuid(raw) && window.PIXORO_ID_TO_NAME[raw]) return {id: raw, name: pixoroCleanName(window.PIXORO_ID_TO_NAME[raw])};
  try{
    let {data} = await window.supa.from('profiles').select('id,username').ilike('username', raw).single();
    if(data && data.id){
      window.PIXORO_ID_TO_NAME[String(data.id)] = pixoroCleanName(data.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(data.username)] = String(data.id);
      return {id: String(data.id), name: pixoroCleanName(data.username)};
    }
  }catch(e){}
  try{
    let {data} = await window.supa.from('posts').select('user_id,username').ilike('username', raw).limit(1).single();
    if(data && data.user_id && pixoroIsUuid(data.user_id)){
      window.PIXORO_NAME_TO_ID[raw] = String(data.user_id);
      window.PIXORO_ID_TO_NAME[String(data.user_id)] = raw;
      return {id: String(data.user_id), name: raw};
    }
  }catch(e){}
  return {id:null, name: raw};
}
async function pixoroToggleFollow(target, btn){
  let raw = String(target||'').trim();
  if(!raw || raw==='null' || raw==='undefined'){
    let b = btn || document.activeElement;
    raw = b?.dataset?.followUsername || b?.dataset?.followUser || '';
  }
  if(!raw || raw==='null' || raw==='undefined'){ return false; }
  let {id, name} = await pixoroResolveName(raw);
  if(!name){ return false; }
  if(id && id === String(window.ME_ID)) return false;
  let busyKey = id || name;
  if(_pixoroFollowBusy[busyKey]) return false;
  _pixoroFollowBusy[busyKey] = true;
  let was = id ? pixoroIsFollowing(id) : pixoroIsFollowing(name);
  let want = !was;
  if(id){ if(want){ window.PIXORO_FOLLOWING.add(id); window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); } else { window.PIXORO_FOLLOWING.delete(id); window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name)); } }
  else { if(want) window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); else window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name)); }
  pixoroPaintAllFollowBtns();
  try{
    let {data, error} = await window.supa.rpc('toggle_follow_by_name', {target_name: name});
    if(error){
      if(was){ if(id) window.PIXORO_FOLLOWING.add(id); window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); }
      else { if(id) window.PIXORO_FOLLOWING.delete(id); window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name)); }
      pixoroPaintAllFollowBtns();
      _pixoroFollowBusy[busyKey] = false;
      return false;
    }
    if(!id){ let r = await pixoroResolveName(name); id = r.id; }
    if(id){
      if(data){ window.PIXORO_FOLLOWING.add(id); window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); }
      else { window.PIXORO_FOLLOWING.delete(id); window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name)); }
    } else {
      if(data) window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(name)); else window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(name));
    }
    pixoroPaintAllFollowBtns();
    try{ localStorage.setItem('pixoro_follow_sync', JSON.stringify({targetId: id, targetName: name, following: data, t: Date.now()})); }catch(e){}
    pixoroLoadFollowCounts();
    setTimeout(()=>{ _pixoroLoadingFollow = false; pixoroLoadFollowing(); }, 500);
  }catch(e){ pixoroPaintAllFollowBtns(); }
  setTimeout(()=>{ _pixoroFollowBusy[busyKey] = false; }, 800);
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
window.addEventListener('storage', (e)=>{
  if(e.key === 'pixoro_follow_sync' && e.newValue){
    try{ let d = JSON.parse(e.newValue); pixoroSyncFollowBtn(d.targetId, d.following); }catch(err){}
  }
});
document.addEventListener('DOMContentLoaded', ()=>{ pixoroFixMe(); pixoroLoadFollowing(); });
if(document.readyState !== 'loading'){ pixoroFixMe(); pixoroLoadFollowing(); }

// ===== PIXORO PHOTO DM v115 - SAFE - ADD PANNAPATTATHU DA =====
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
