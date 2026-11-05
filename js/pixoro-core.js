// ===== PIXORO MAIN - NO LOCAL STORAGE - FULL SUPABASE ONLY da =====
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

async function getAllPixoroPosts(){
  let all = [];
  try{ let r1 = await window.supa.from('posts').select('*').order('created_at',{ascending:false}); if(r1.data) all = all.concat(r1.data.map(p=>({...p,_from:'posts'}))); }catch(e){}
  try{ let r2 = await window.supa.from('reels').select('*').order('created_at',{ascending:false}); if(r2.data) all = all.concat(r2.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
  return all;
}
function pixoroIsRealPhoto(url){
  if(!url) return false;
  if(url.includes('ui-avatars') || url.includes('placeholder') || url.includes('undefined')) return false;
  return true;
}
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
async function pixoroBlockUser(userId){
  try{ await window.supa.from('blocked_users').insert({user_id:window.ME_ID, blocked_user_id:userId}); }catch(e){}
  location.reload();
}
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
  let {data:likes} = await window.supa.from('likes').select('*');
  let {data:saves} = await window.supa.from('saves').select('*');
  let {data:views} = await window.supa.from('views').select('*');
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

// ===== PIXORO FOLLOW - ORU EDAM MATTUM DA - ID + USERNAME RENDUM CHECK PANNUVOM DA =====
window.PIXORO_FOLLOWING = window.PIXORO_FOLLOWING || new Set();
window.PIXORO_FOLLOWING_NAMES = window.PIXORO_FOLLOWING_NAMES || new Set();
window.PIXORO_ID_TO_NAME = window.PIXORO_ID_TO_NAME || {};
window.PIXORO_NAME_TO_ID = window.PIXORO_NAME_TO_ID || {};
let _pixoroFollowBusy = {};
let _pixoroLoadingFollow = false;

function pixoroCleanName(n){ return String(n||'').trim().replace('@','').toLowerCase(); }

function pixoroIsFollowing(checkId){
  checkId = String(checkId||'');
  if(!checkId) return false;
  if(window.PIXORO_FOLLOWING.has(checkId)) return true;
  // ID kodutha - Name la check pannu da - Name kodutha - ID la check pannu da - Ithu than Sam ah Irukka Vaikkum da
  let name = window.PIXORO_ID_TO_NAME[checkId] || pixoroCleanName(checkId);
  if(window.PIXORO_FOLLOWING_NAMES.has(pixoroCleanName(name))) return true;
  let idFromName = window.PIXORO_NAME_TO_ID[pixoroCleanName(checkId)];
  if(idFromName && window.PIXORO_FOLLOWING.has(String(idFromName))) return true;
  return false;
}

function pixoroPaintAllFollowBtns(){
  document.querySelectorAll('[data-follow-user]').forEach(btn=>{
    let id = String(btn.dataset.followUser || '');
    if(!id) return;
    let isFollowing = pixoroIsFollowing(id);
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

async function pixoroResolveId(targetId){
  targetId = String(targetId||'').trim();
  if(!targetId) return null;
  if(targetId.includes('-') && targetId.length > 20) return targetId;
  // Username vantha - ID ah Edu da
  if(window.PIXORO_NAME_TO_ID[pixoroCleanName(targetId)]) return window.PIXORO_NAME_TO_ID[pixoroCleanName(targetId)];
  try{
    let {data} = await window.supa.from('profiles').select('id,username').eq('username', pixoroCleanName(targetId)).single();
    if(data){
      window.PIXORO_ID_TO_NAME[String(data.id)] = pixoroCleanName(data.username);
      window.PIXORO_NAME_TO_ID[pixoroCleanName(data.username)] = String(data.id);
      return String(data.id);
    }
  }catch(e){}
  return targetId;
}

async function pixoroToggleFollow(targetId, btn){
  let raw = String(targetId||'');
  if(!raw || raw === String(window.ME_ID)) return false;
  if(_pixoroFollowBusy[raw]) return false;
  _pixoroFollowBusy[raw] = true;

  // 1. ID ah Resolve Pannu da - Username / UUID - Ethu Vanthalum ORE ID aakkidu da
  let resolvedId = await pixoroResolveId(raw);
  if(!resolvedId || resolvedId === String(window.ME_ID)){ _pixoroFollowBusy[raw] = false; return false; }

  let wasFollowing = pixoroIsFollowing(resolvedId);
  let wantFollowing = !wasFollowing;

  // 2. Muthalla DB la Save Pannu da - UI ah Aprom Maathu da - Poi Solla Koodathu da
  try{
    if(wantFollowing){
      let {error} = await window.supa.from('follows').insert({follower_id: window.ME_ID, following_id: resolvedId});
      if(error && error.code !== '23505'){
        console.log('FOLLOW FAIL - RLS PAARU DA:', error.message);
        alert('Follow Save Aagala da - Supabase follows la Policy Paaru da - ' + error.message);
        _pixoroFollowBusy[raw] = false;
        return false;
      }
    } else {
      let {error} = await window.supa.from('follows').delete().eq('follower_id', window.ME_ID).eq('following_id', resolvedId);
      if(error){ console.log('UNFOLLOW FAIL:', error.message); _pixoroFollowBusy[raw] = false; return false; }
    }
    // 3. DB la Save Aana Aprom than UI ah Maathu da - ID + Name Rendum Update Pannu da
    if(wantFollowing){
      window.PIXORO_FOLLOWING.add(String(resolvedId));
      let nm = window.PIXORO_ID_TO_NAME[String(resolvedId)] || pixoroCleanName(raw);
      if(nm) window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(nm));
    } else {
      window.PIXORO_FOLLOWING.delete(String(resolvedId));
      let nm = window.PIXORO_ID_TO_NAME[String(resolvedId)] || pixoroCleanName(raw);
      if(nm) window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(nm));
    }
    pixoroPaintAllFollowBtns();
    try{ localStorage.setItem('pixoro_follow_sync', JSON.stringify({targetId: resolvedId, following: wantFollowing, t: Date.now()})); }catch(e){}
    pixoroLoadFollowCounts();
    // 4. Confirm - DB la Irundhu Thirumba Edu da - Home / Reels Sam ah Irukkanum da
    setTimeout(()=>{ pixoroLoadFollowing(); }, 500);
  }catch(e){ console.log('FOLLOW CATCH', e); }
  setTimeout(()=>{ _pixoroFollowBusy[raw] = false; }, 800);
  return wantFollowing;
}

function pixoroSyncFollowBtn(targetId, following){
  targetId = String(targetId);
  if(following){
    window.PIXORO_FOLLOWING.add(targetId);
    let nm = window.PIXORO_ID_TO_NAME[targetId];
    if(nm) window.PIXORO_FOLLOWING_NAMES.add(pixoroCleanName(nm));
  } else {
    window.PIXORO_FOLLOWING.delete(targetId);
    let nm = window.PIXORO_ID_TO_NAME[targetId];
    if(nm) window.PIXORO_FOLLOWING_NAMES.delete(pixoroCleanName(nm));
  }
  pixoroPaintAllFollowBtns();
}

window.pixoroToggleFollow = pixoroToggleFollow;
window.toggleFollow = pixoroToggleFollow;
window.toggleF = pixoroToggleFollow;
window.pixoroLoadFollowing = pixoroLoadFollowing;
window.pixoroPaintAllFollowBtns = pixoroPaintAllFollowBtns;
window.pixoroSyncFollowBtn = pixoroSyncFollowBtn;
window.pixoroIsFollowing = pixoroIsFollowing;
window.pixoroResolveId = pixoroResolveId;

window.addEventListener('storage', (e)=>{
  if(e.key === 'pixoro_follow_sync' && e.newValue){
    try{ let d = JSON.parse(e.newValue); pixoroSyncFollowBtn(d.targetId, d.following); }catch(err){}
  }
});

document.addEventListener('DOMContentLoaded', ()=>{ pixoroLoadFollowing(); });
if(document.readyState !== 'loading') pixoroLoadFollowing();
