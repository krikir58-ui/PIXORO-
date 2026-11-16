// ===== PIXORO FEED - v1011 - EXPORT ILLA DA - AUTO RUN AAGUM DA - PHOTO VARUM DA =====
let FEED_ALL = [], FEED_MODE = 'foryou', FEED_ME_ID = '', FEED_ME_RAW = '';
let FEED_LIKES = new Set();

function feedClean(u){ if(!u) return ''; return String(u).trim().replace('@','').toLowerCase(); }
function getSupa(){ return window.supa || (window.getSupa ? window.getSupa() : null); }

// ✅ FIX 1: profiles JOIN illa da - JOIN fail aana feed empty aagidum da - thaniya edukuren da
async function getFeed(currentUserId){
  try{
    let s = getSupa(); if(!s) return [];
    let all = [];
    // Reels
    try{
      let r = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(50);
      if(r.data) all = all.concat(r.data.map(p=>({...p,_from:'reels'})));
    }catch(e){}
    // Posts - PHOTO INGA THAAN DA
    try{
      let r = await s.from('posts').select('*').order('created_at',{ascending:false}).limit(50);
      if(r.data) all = all.concat(r.data.map(p=>({...p,_from:'posts'})));
    }catch(e){}
    // Profiles thaniya
    let profMap = {};
    try{
      let r = await s.from('profiles').select('id,username,avatar_url,profile_pic,photo_url,is_verified').limit(200);
      (r.data||[]).forEach(p=>{ profMap[String(p.id)] = p; });
    }catch(e){}
    all.forEach(p=>{ if(profMap[String(p.user_id)]) p.profiles = profMap[String(p.user_id)]; });
    // Private filter
    let allowedIds = [String(currentUserId)];
    try{
      let f = await s.from('follows').select('following_id').eq('follower_id', currentUserId).eq('status','accepted');
      (f.data||[]).forEach(x=> allowedIds.push(String(x.following_id)));
    }catch(e){}
    let filtered = all.filter(r=>{
      if(r.visibility === 'private_share') return false;
      if(r.is_archived === true) return false;
      let prof = r.profiles;
      if(!prof) return true;
      if(!prof.is_private_account) return true;
      return allowedIds.includes(String(r.user_id));
    });
    // Dedup - same photo 2 vaati varathu da
    let seen = new Set(), out = [];
    for(let p of filtered){
      let url = String(p.media_url||p.video_url||p.image_url||'').split('?')[0].toLowerCase();
      if(url && seen.has(url)) continue;
      if(url) seen.add(url);
      out.push(p);
    }
    out.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at));
    return out;
  }catch(err){ console.error('Feed error da:', err); return []; }
}
window.getFeed = getFeed;

function feedGetMedia(p){
  let url = p.media_url || p.video_url || p.image_url || p.image || '';
  url = String(url||'').trim();
  if(!url) return {url:'', isVid:false};
  let low = url.split('?')[0].split('#')[0].toLowerCase();
  let isVid = low.endsWith('.mp4') || low.endsWith('.mov') || low.endsWith('.webm') || low.endsWith('.m4v');
  if(low.endsWith('.jpg')||low.endsWith('.jpeg')||low.endsWith('.png')||low.endsWith('.webp')||low.endsWith('.gif')) isVid = false;
  return {url, isVid};
}
function feedTime(t){
  if(!t) return '';
  let d=new Date(t), now=new Date(), diff=Math.floor((now-d)/1000);
  if(diff<60) return 'Just now';
  if(diff<3600) return Math.floor(diff/60)+'m';
  if(diff<86400) return Math.floor(diff/3600)+'h';
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
  let box = document.getElementById('feed');
  if(!box) return;
  let list = [...FEED_ALL];
  if(FEED_MODE==='following'){
    list = list.filter(p => window.pixoroIsFollowing ? window.pixoroIsFollowing(p.user_id||p.username) : false);
  }
  list = list.filter(p=>{ let m=feedGetMedia(p); return m.url && m.url.includes('http'); });
  if(!list.length){
    box.innerHTML = `<div style="padding:40px;text-align:center;color:#888">No posts yet da<br><button onclick="location.href='./post-create.html'" style="margin-top:12px;background:#FF2DCC;color:#fff;border:0;padding:10px 18px;border-radius:20px;font-weight:800">+ Post Pannu da</button></div>`;
    return;
  }
  box.innerHTML = list.map(p=>{
    let prof = p.profiles || {};
    let uname = feedClean(prof.username || p.username || 'user');
    let pfp = prof.avatar_url || prof.profile_pic || prof.photo_url || ('https://ui-avatars.com/api/?name='+uname.charAt(0)+'&background=ff5ea8&color=fff');
    let tick = window.goldTickHTML ? window.goldTickHTML(prof.username ? prof : p) : '';
    let m = feedGetMedia(p);
    let mediaHtml = m.isVid
      ? `<video src="${m.url}" muted playsinline loop preload="metadata" onclick="this.paused?this.play():this.pause()" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#000"></video>`
      : `<img src="${m.url}" loading="lazy" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#111" onerror="this.parentElement.style.display='none'">`;
    let isMine = String(p.user_id)===String(FEED_ME_ID);
    let isFollowing = window.pixoroIsFollowing ? window.pixoroIsFollowing(uname) : false;
    return `<div class="reel-card" style="background:#151515;border-radius:20px;margin:0 12px 16px;padding:12px;border:1px solid #222">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <img src="${pfp}" onclick="location.href='./profile.html?u=${p.user_id}'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer">
        <b style="color:#fff;flex:1;cursor:pointer" onclick="location.href='./profile.html?u=${p.user_id}'">@${uname}${tick}</b>
        <span style="color:#888;font-size:12px">${feedTime(p.created_at)}</span>
        ${!isMine ? `<button data-follow-user="${uname}" onclick="pixoroToggleFollow('${uname}',this)" style="background:transparent;color:#fff;border:1.2px solid #fff;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700">${isFollowing?'Following':'Follow'}</button>` : ''}
      </div>
      ${mediaHtml}
      <div style="display:flex;gap:16px;font-size:22px;margin-top:10px"><span onclick="pixoroToggleLike('${p.id}',this)" style="cursor:pointer">❤️</span><span onclick="openComment('${p.id}')" style="cursor:pointer">💬</span><span onclick="sharePost('${p.id}')" style="cursor:pointer">↗️</span></div>
      <p style="color:#fff;margin-top:8px;font-size:14px"><b>@${uname}</b> ${p.caption||''}</p>
    </div>`;
  }).join('');
  if(window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
}

// ✅ FIX 2: ithu thaan da renderFeed - index.html la irunthu koopida koodiya peru da
async function renderFeed(currentUserId){
  let box = document.getElementById('feed');
  if(!box) return;
  box.innerHTML = '<p style="color:#888;text-align:center;padding:20px">Loading da... ⏳</p>';
  if(!currentUserId){
    let s = getSupa();
    if(s){ let {data:{session}} = await s.auth.getSession(); currentUserId = session?.user?.id; }
  }
  if(!currentUserId){ box.innerHTML = '<p style="color:#888;text-align:center">Login pannu da</p>'; return; }
  FEED_ALL = await getFeed(currentUserId);
  renderFeedList();
}
window.renderFeed = renderFeed;

async function loadFeed(){
  let s = getSupa();
  for(let i=0;i<20 && !s;i++){ await new Promise(r=>setTimeout(r,200)); s = getSupa(); }
  if(!s){ let b=document.getElementById('feed'); if(b) b.innerHTML='<p style="padding:30px;text-align:center;color:#888">Supabase Connect Aagala da</p>'; return; }
  let {data:{session}} = await s.auth.getSession();
  if(!session){ location.href='login.html'; return; }
  FEED_ME_ID = session.user.id; window.ME_ID = FEED_ME_ID;
  let {data:myProf} = await s.from('profiles').select('*').eq('id', FEED_ME_ID).maybeSingle();
  FEED_ME_RAW = feedClean(myProf?.username || session.user.email.split('@')[0]); window.ME_RAW = FEED_ME_RAW;
  let navPfp = document.getElementById('navPfp');
  if(navPfp && myProf?.avatar_url) navPfp.src = myProf.avatar_url;
  if(window.pixoroLoadFollowing) window.pixoroLoadFollowing();
  FEED_ALL = await getFeed(FEED_ME_ID);
  try{
    let {data:likes} = await s.from('likes').select('post_id').eq('user_id', FEED_ME_ID);
    FEED_LIKES = new Set((likes||[]).map(x=>String(x.post_id)));
  }catch(e){}
  let pid = new URLSearchParams(location.search).get('id');
  if(pid){
    let single = FEED_ALL.find(p=>String(p.id)===String(pid));
    if(single){ FEED_ALL = [single, ...FEED_ALL.filter(p=>String(p.id)!==String(pid))]; let b=document.getElementById('singleBanner'); if(b) b.style.display='block'; }
  }
  renderFeedList();
  loadStories();
}
async function loadStories(){
  try{
    let s=getSupa(); if(!s) return;
    let {data}=await s.from('stories').select('*').order('created_at',{ascending:false}).limit(20);
    let bar=document.getElementById('storyBar'); if(!bar) return;
    if(!data||!data.length){ bar.style.display='none'; return; }
    bar.innerHTML = data.map(st=>`<div onclick="location.href='./story.html?id=${st.id}'" style="text-align:center;cursor:pointer;flex:0 0 62px"><div style="width:56px;height:56px;border-radius:50%;padding:2px;border:2px solid #FF2DCC;margin:0 auto;overflow:hidden"><img src="${st.media_url||st.image_url||''}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"></div><div style="font-size:10px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${feedClean(st.username||'user')}</div></div>`).join('');
  }catch(e){}
}
function showChoice(){ let c=document.getElementById('choice'); if(c) c.style.display='flex'; }
function hideChoice(){ let c=document.getElementById('choice'); if(c) c.style.display='none'; }
window.showChoice=showChoice; window.hideChoice=hideChoice;
function sharePost(id){ let u=location.origin+'/index.html?id='+id; if(navigator.share){ navigator.share({title:'Pixoro',url:u}); } else { navigator.clipboard.writeText(u); showToast('Link Copy Aachu da'); } }
window.sharePost=sharePost;
function showToast(m){ let t=document.getElementById('toast'); if(!t) return; t.innerText=m; t.style.display='block'; setTimeout(()=>t.style.display='none',1500); }
window.showToast=showToast;
function openComment(id){ window.CURRENT_COMMENT_POST=id; let m=document.getElementById('commentModal'); if(m) m.style.display='flex'; loadComments(id); }
function closeComment(){ let m=document.getElementById('commentModal'); if(m) m.style.display='none'; }
window.openComment=openComment; window.closeComment=closeComment;
async function loadComments(postId){
  try{
    let s=getSupa(); let {data}=await s.from('comments').select('*').eq('post_id',postId).order('created_at',{ascending:true});
    let box=document.getElementById('commentList'); if(!box) return;
    box.innerHTML=(data||[]).map(c=>`<div style="padding:8px 0;border-bottom:1px solid #222"><b>@${feedClean(c.username||'user')}</b> <span>${c.text||c.content||''}</span></div>`).join('') || '<p style="color:#888">No comments yet da</p>';
  }catch(e){}
}
async function addComment(){
  let inp=document.getElementById('commentInput'); let txt=inp.value.trim(); if(!txt) return;
  let s=getSupa(); await s.from('comments').insert({post_id: window.CURRENT_COMMENT_POST, user_id: FEED_ME_ID, username: FEED_ME_RAW, text: txt});
  inp.value=''; loadComments(window.CURRENT_COMMENT_POST);
}
window.addComment=addComment;
// ✅ FIX 3: AUTO RUN DA - yaarum koopida vendaam da
if(document.readyState !== 'loading') loadFeed();
else document.addEventListener('DOMContentLoaded', loadFeed);
