// ===== PIXORO FEED - v1046 - THANI CODE DA - LIKE AH THODATHE DA =====
// RULE: Feed mattum thaan da - Like Pathi Onnum Illa da - like.js la mattum thaan da
let FEED_ALL = [], FEED_MODE = 'foryou', FEED_ME_ID = '', FEED_ME_RAW = '';
let FEED_LIKES = new Set();
let FEED_SAVES = new Set();
let FEED_COUNTS = {};
let MY_PFP = '';
let _feedLoading = false;
window.FEED_LIKES = FEED_LIKES;
window.FEED_SAVES = FEED_SAVES;
window.FEED_COUNTS = FEED_COUNTS;

function feedClean(u){ if(!u) return ''; return String(u).trim().replaceAll('@','').toLowerCase(); }
function getSupa(){ return window.supa || (window.getSupa ? window.getSupa() : null); }
function syncFeedSets(){ window.FEED_LIKES = FEED_LIKES; window.FEED_SAVES = FEED_SAVES; window.FEED_COUNTS = FEED_COUNTS; }

window.pixoroGetPfp = function(prof, userId, uname){
  let isMineNow = String(userId)===String(FEED_ME_ID) || feedClean(uname)===feedClean(FEED_ME_RAW);
  if(isMineNow && MY_PFP) return MY_PFP;
  return String(prof?.avatar_url || '').trim();
};

async function getFeed(currentUserId){
  try{
    let s = getSupa(); if(!s) return [];
    let all = [];
    try{ let r = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(50); if(r.data) all = all.concat(r.data.map(p=>({...p,_from:'reels'}))); }catch(e){}
    try{ let r = await s.from('posts').select('*').order('created_at',{ascending:false}).limit(50); if(r.data) all = all.concat(r.data.map(p=>({...p,_from:'posts'}))); }catch(e){}
    let profMap = {};
    try{ let r = await s.from('profiles').select('id,username,avatar_url').limit(200); (r.data||[]).forEach(p=>{ profMap[String(p.id)] = p; }); }catch(e){}
    all.forEach(p=>{ if(profMap[String(p.user_id)]) p.profiles = profMap[String(p.user_id)]; });
    let allowedIds = [String(currentUserId)];
    try{ let f = await s.from('follows').select('following_id').eq('follower_id', currentUserId).eq('status','accepted'); (f.data||[]).forEach(x=> allowedIds.push(String(x.following_id))); }catch(e){}
    let filtered = all.filter(r=>{
      if(r.visibility === 'private_share') return false;
      if(r.is_archived === true) return false;
      let prof = r.profiles; if(!prof) return true;
      if(!prof.is_private_account) return true;
      return allowedIds.includes(String(r.user_id));
    });
    let seen = new Set(), out = [];
    for(let p of filtered){
      let url = String(p.media_url||p.video_url||p.image_url||'').split('?')[0].toLowerCase();
      if(url && seen.has(url)) continue; if(url) seen.add(url); out.push(p);
    }
    out.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
    return out;
  }catch(err){ console.error('Feed error da:', err); return []; }
}
window.getFeed = getFeed;

async function loadAllCounts(){
  let s = getSupa(); if(!s) return;
  FEED_COUNTS = {};
  let ids = FEED_ALL.map(p=>String(p.id));
  if(!ids.length) return;
  try{ let {data:likes} = await s.from('likes').select('post_id').in('post_id', ids); (likes||[]).forEach(x=>{ let k=String(x.post_id); FEED_COUNTS[k]=FEED_COUNTS[k]||{like:0,comment:0,share:0}; FEED_COUNTS[k].like++; }); }catch(e){}
  try{ let {data:cmts} = await s.from('comments').select('post_id').in('post_id', ids); (cmts||[]).forEach(x=>{ let k=String(x.post_id); FEED_COUNTS[k]=FEED_COUNTS[k]||{like:0,comment:0,share:0}; FEED_COUNTS[k].comment++; }); }catch(e){}
  try{ let {data:shrs} = await s.from('shares').select('post_id').in('post_id', ids); (shrs||[]).forEach(x=>{ let k=String(x.post_id); FEED_COUNTS[k]=FEED_COUNTS[k]||{like:0,comment:0,share:0}; FEED_COUNTS[k].share++; }); }catch(e){}
  syncFeedSets();
}

function feedGetMedia(p){
  let url = p.media_url || p.video_url || p.image_url || p.image || '';
  url = String(url||'').trim(); if(!url) return {url:'', isVid:false};
  let low = url.split('?')[0].split('#')[0].toLowerCase();
  let isVid = low.endsWith('.mp4') || low.endsWith('.mov') || low.endsWith('.webm') || low.endsWith('.m4v');
  if(low.endsWith('.jpg')||low.endsWith('.jpeg')||low.endsWith('.png')||low.endsWith('.webp')||low.endsWith('.gif')) isVid = false;
  return {url, isVid};
}
function feedTime(t){
  if(!t) return '';
  let d=new Date(t), now=new Date(), diff=Math.floor((now-d)/1000);
  if(diff<60) return 'Just now'; if(diff<3600) return Math.floor(diff/60)+'m'; if(diff<86400) return Math.floor(diff/3600)+'h';
  return d.toLocaleDateString([],{day:'numeric',month:'short'});
}
function setFeedMode(m){
  FEED_MODE = m;
  document.querySelectorAll('.feedTab').forEach(t=>t.classList.remove('active'));
  if(m==='foryou') document.getElementById('tabForYou')?.classList.add('active');
  if(m==='following') document.getElementById('tabFollowing')?.classList.add('active');
  if(m==='latest') document.getElementById('tabLatest')?.classList.add('active');
  renderFeedList();
}
window.setFeedMode = setFeedMode;

function renderFeedList(){
  let box = document.getElementById('feed'); if(!box) return;
  let list = [...FEED_ALL];
  if(FEED_MODE==='following'){ list = list.filter(p => window.pixoroIsFollowing ? window.pixoroIsFollowing(p.user_id||p.username) : false); }
  list = list.filter(p=>{ let m=feedGetMedia(p); return m.url && m.url.includes('http'); });
  if(!list.length){ box.innerHTML = `<div style="padding:40px;text-align:center;color:#888">No posts yet da<br><button onclick="location.href='./create.html'" style="margin-top:12px;background:#FF2DCC;color:#fff;border:0;padding:10px 18px;border-radius:20px;font-weight:800">+ Post Pannu da</button></div>`; return; }
  box.innerHTML = list.map(p=>{
    let prof = p.profiles || {};
    let uname = feedClean(prof.username || p.username || 'user');
    let pfp = String(prof?.avatar_url || '').trim();
    if(!pfp && String(p.user_id)===String(FEED_ME_ID) && MY_PFP) pfp = MY_PFP;
    let avatarHtml = pfp ? `<img src="${pfp}" onerror="this.remove();this.parentElement.querySelector('.avaLetterHome').style.display='grid'">` : '';
    let letterHtml = `<div class="avaLetterHome" style="display:${pfp ? 'none' : 'grid'}">${uname.charAt(0).toUpperCase()}</div>`;
    let m = feedGetMedia(p);
    let mediaHtml = m.isVid
      ? `<div class="postMedia" onclick="pixoroFeedTap('${p.id}', this, event)"><video class="main" src="${m.url}" muted playsinline loop preload="metadata"></video></div>`
      : `<div class="postMedia" onclick="pixoroFeedTap('${p.id}', this, event)"><img class="main" src="${m.url}" loading="lazy" onerror="this.closest('.post').style.display='none'"></div>`;
    let isMine = String(p.user_id)===String(FEED_ME_ID) || uname === feedClean(FEED_ME_RAW) || uname === feedClean(window.ME_RAW||'');
    let isFollowing = window.pixoroIsFollowing ? window.pixoroIsFollowing(uname) : false;
    let cnt = FEED_COUNTS[String(p.id)] || {like:0,comment:0,share:0};
    let liked = '';
    let saved = FEED_SAVES.has(String(p.id)) ? 'saved' : '';
    return `<div class="post">
      <div class="postTop">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="pfpRing" onclick="location.href='./profile.html?u=${p.user_id}'"><div class="pfpInner">${avatarHtml}${letterHtml}</div></div>
          <div><b onclick="location.href='./profile.html?u=${p.user_id}'">${uname}</b><div style="font-size:11px;color:#888">${feedTime(p.created_at)}</div></div>
        </div>
        ${!isMine ? `<button data-follow-user="${uname}" class="followBtnPost ${isFollowing?'following':''}" onclick="pixoroToggleFollow('${uname}',this)">${isFollowing?'Following':'Follow'}</button>` : '<span>⋯</span>'}
      </div>
      ${mediaHtml}
      <div class="actions">
        <div class="left" style="display:flex;gap:14px;align-items:center">
          <button data-like-btn="${p.id}" class="act ${liked}" onclick="pixoroToggleLike('${p.id}',this)" style="display:flex;gap:6px;align-items:center;background:none;border:0;color:#fff"><svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke-width:1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg><span data-like-count="${p.id}">${cnt.like}</span></button>
          <button class="act" onclick="openComment('${p.id}')" style="display:flex;gap:6px;align-items:center;background:none;border:0;color:#fff"><svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#fff;fill:none;stroke-width:1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span data-comment-count="${p.id}">${cnt.comment}</span></button>
          <button class="act" onclick="sharePost('${p.id}')" style="display:flex;gap:6px;align-items:center;background:none;border:0;color:#fff"><svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#fff;fill:none;stroke-width:1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 22 15 22 11 13 2 9 22 2"/></svg><span data-share-count="${p.id}">${cnt.share}</span></button>
        </div>
        <button data-save-btn="${p.id}" class="act ${saved}" onclick="pixoroToggleSave('${p.id}',this)" style="margin-left:auto;background:none;border:0;color:#fff"><svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke-width:1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
      </div>
      <div style="padding:0 12px;font-size:14px"><b>${uname}</b> ${p.caption||''}</div>
    </div>`;
  }).join('');
  let hideMyFollow = ()=>{
    document.querySelectorAll('.post').forEach((postEl, idx)=>{
      let p = list[idx]; if(!p) return;
      let uname2 = feedClean(p.profiles?.username || p.username || 'user');
      let isMine2 = String(p.user_id)===String(FEED_ME_ID) || uname2 === feedClean(FEED_ME_RAW);
      if(isMine2){ let btn = postEl.querySelector('[data-follow-user]'); if(btn) btn.outerHTML = '<span>⋯</span>'; }
    });
  };
  hideMyFollow();
  if(window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
  hideMyFollow();
  // ✅ FIX - Feed Mudinjathum - Like ah Koopidu da - Observer Illa da - Ithu thaan Thani Code da
  if(window.pixoroPaintAllLikes) window.pixoroPaintAllLikes();
}

async function renderFeed(currentUserId){
  if(_feedLoading) return;
  let box = document.getElementById('feed'); if(!box) return;
  box.innerHTML = '<p style="color:#888;text-align:center;padding:20px">Loading da...</p>';
  if(!currentUserId){ let s = getSupa(); if(s){ let {data:{session}} = await s.auth.getSession(); currentUserId = session?.user?.id; } }
  if(!currentUserId){ box.innerHTML = '<p style="color:#888;text-align:center">Login pannu da</p>'; return; }
  FEED_ALL = await getFeed(currentUserId);
  await loadAllCounts();
  renderFeedList();
}
window.renderFeed = renderFeed;

async function loadFeed(){
  if(_feedLoading) return;
  _feedLoading = true;
  try{
    let s = getSupa();
    for(let i=0;i<20 && !s;i++){ await new Promise(r=>setTimeout(r,200)); s = getSupa(); }
    if(!s){ let b=document.getElementById('feed'); if(b) b.innerHTML='<p style="padding:30px;text-align:center;color:#888">Supabase Connect Aagala da</p>'; return; }
    let {data:{session}} = await s.auth.getSession();
    if(!session){ location.href='login.html'; return; }
    FEED_ME_ID = session.user.id; window.ME_ID = FEED_ME_ID;
    let {data:myProf} = await s.from('profiles').select('*').eq('id', FEED_ME_ID).maybeSingle();
    FEED_ME_RAW = feedClean(myProf?.username || session.user.email.split('@')[0]); window.ME_RAW = FEED_ME_RAW;
    MY_PFP = String(myProf?.avatar_url || '').trim();
    window.MY_PFP = MY_PFP; window.ME_PFP = MY_PFP; window.ME_AVATAR = MY_PFP;
    let navPfp = document.getElementById('navPfp'); if(navPfp && MY_PFP) navPfp.src = MY_PFP;
    if(window.pixoroLoadFollowing) window.pixoroLoadFollowing();
    FEED_ALL = await getFeed(FEED_ME_ID);
    FEED_LIKES = new Set(); FEED_SAVES = new Set();
    try{ let {data:likes} = await s.from('likes').select('post_id').eq('user_id', FEED_ME_ID); FEED_LIKES = new Set((likes||[]).map(x=>String(x.post_id))); }catch(e){}
    try{ let {data:saves} = await s.from('saves').select('post_id').eq('user_id', FEED_ME_ID); FEED_SAVES = new Set((saves||[]).map(x=>String(x.post_id))); }catch(e){}
    syncFeedSets();
    await loadAllCounts();
    let pid = new URLSearchParams(location.search).get('id');
    if(pid){ let single = FEED_ALL.find(p=>String(p.id)===String(pid)); if(single){ FEED_ALL = [single, ...FEED_ALL.filter(p=>String(p.id)!==String(pid))]; let b=document.getElementById('singleBanner'); if(b) b.style.display='block'; } }
    renderFeedList();
    if(window.loadStories) window.loadStories();
  } finally { setTimeout(()=>{ _feedLoading = false; }, 2000); }
}
window.loadFeed = loadFeed;

function showChoice(){ location.href = './create.html'; }
function hideChoice(){ let c=document.getElementById('choice'); if(c) c.classList.remove('show'); }
window.showChoice=showChoice; window.hideChoice=hideChoice;

document.addEventListener('click', function(e){
  let w = e.target.closest('.sAddWrap'); if(!w) return; location.href = './create.html';
});

if(!window._pixoroFeedStarted){
  window._pixoroFeedStarted = true;
  if(document.readyState !== 'loading') loadFeed();
  else document.addEventListener('DOMContentLoaded', loadFeed);
}
