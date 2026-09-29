let posts=JSON.parse(localStorage.getItem('pixoro_posts')||'[]');
let likes=JSON.parse(localStorage.getItem('pixoro_likes')||'{}');
let follows=JSON.parse(localStorage.getItem('pixoro_follows')||'{}');
let comments=JSON.parse(localStorage.getItem('pixoro_comments')||'{}');
let viewedIds=JSON.parse(localStorage.getItem('pixoro_viewedIds')||'[]');
let deviceId=localStorage.getItem('pixoro_device')||'dev_'+Date.now(); localStorage.setItem('pixoro_device',deviceId);
let currentP='girikri', currentCommentId=null;

if(posts.length==0){posts=[{id:1,img:'https://picsum.photos/seed/pixoro1/700/700',caption:'Mass entry da @whitezzz__04 🔥',user:'girikri',likes:129,viewers:[deviceId],time:'now',shares:5},{id:2,img:'https://picsum.photos/seed/pixoro2/700/700',caption:'Lake vibes 😍',user:'whitezzz__04',likes:89,viewers:[],time:'2h',shares:2}]; localStorage.setItem('pixoro_posts',JSON.stringify(posts));}
if(!comments[1]){comments[1]=[{user:'whitezzz__04',text:'Mass da Giri 🔥'},{user:'don_deepak_k_',text:'Super da!'}];}

function init(){ renderFeed(); renderStories(); setTimeout(()=>{ const s=document.getElementById('splash'); if(s){ s.style.opacity='0'; s.style.transition='opacity.2s'; setTimeout(()=>s.remove(),200);} },350); }
if(document.readyState=='loading') document.addEventListener('DOMContentLoaded',init); else init();

function renderFeed(){
 document.getElementById('feed').innerHTML=posts.map(p=>{
  const v=p.viewers?.length||0; const l=p.likes+(likes[p.id]?1:0); const c=comments[p.id]?.length||0; const isL=likes[p.id]; const isF=follows[p.user];
  return `<div class="post" data-id="${p.id}">
  <div style="display:flex;justify-content:space-between;padding:10px 12px;align-items:center">
   <div style="display:flex;gap:8px;align-items:center" onclick="openProfilePage('${p.user}')"><div class="ring"><img src="https://i.pravatar.cc/80?u=${p.user}" style="width:32px;height:32px;border-radius:50%;padding:2px;background:#fff"></div><div><div style="font-size:14px;font-weight:700">${p.user} <span style="color:#0095f6;font-size:11px">${isF?'• Following':''}</span></div><div style="font-size:10px;color:#888">now • ${v} views • ${c} comments</div></div></div><span>⋯</span>
  </div>
  <img src="${p.img}" loading="eager" style="width:100%;aspect-ratio:1;object-fit:cover;background:#f5f5f5" ondblclick="likePost(${p.id})">
  <div style="display:flex;gap:16px;font-size:24px;padding:10px 12px;align-items:center"><span onclick="likePost(${p.id})">${isL?'❤️':'🤍'}</span><span onclick="openComment(${p.id})">💬</span><span onclick="sharePost(${p.id})">✈️</span><span style="margin-left:auto">🔖</span></div>
  <div style="padding:0 12px 12px;font-size:13px;font-weight:700;line-height:18px"><span id="like-${p.id}">${l} likes</span> • <span id="view-${p.id}">${v} views</span> • ${c} comments • ${p.shares||0} shares<br>
  <span style="font-weight:400"><b>${p.user}</b> ${p.caption}</span><br>
  <span onclick="openComment(${p.id})" style="font-weight:400;color:#888;font-size:12px">View all ${c} comments</span>
  <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><span style="background:#efefef;padding:5px 12px;border-radius:20px;font-size:11px" onclick="likePost(${p.id})">❤️ Like ${l}</span><span style="background:#efefef;padding:5px 12px;border-radius:20px;font-size:11px" onclick="openComment(${p.id})">💬 Comment ${c}</span><span style="background:#efefef;padding:5px 12px;border-radius:20px;font-size:11px" onclick="sharePost(${p.id})">✈️ Share ${p.shares||0}</span><span style="background:#efefef;padding:5px 12px;border-radius:20px;font-size:11px">👁️ Views ${v}</span></div>
  </div></div>`;
 }).join(''); observePosts();
}
function observePosts(){ const obs=new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting){ const id=parseInt(e.target.dataset.id); const p=posts.find(x=>x.id==id); if(!p.viewers) p.viewers=[]; if(!viewedIds.includes(id)&&!p.viewers.includes(deviceId)){ p.viewers.push(deviceId); viewedIds.push(id); localStorage.setItem('pixoro_posts',JSON.stringify(posts)); localStorage.setItem('pixoro_viewedIds',JSON.stringify(viewedIds)); const el=document.getElementById(`view-${id}`); if(el) el.textContent=p.viewers.length+' views'; } } }); },{threshold:0.6}); document.querySelectorAll('.post').forEach(el=>obs.observe(el)); }
function renderStories(){ document.getElementById('stories').innerHTML=['whitezzz__04','don_deepak_k_','sweety_sw'].map(u=>`<div style="display:flex;flex-direction:column;align-items:center;min-width:64px" onclick="showNoti('👁️ '+u+' story viewed')"><div class="ring"><img src="https://i.pravatar.cc/80?u=${u}" style="width:60px;height:60px;border-radius:50%;padding:3px;background:#fff"></div><span style="font-size:11px;margin-top:4px">${u.slice(0,9)}</span><span style="font-size:10px;color:#888">50 views</span></div>`).join(''); }

// LIKE - 1 time only
window.likePost=(id)=>{ if(likes[id]){ showNoti('Already liked ❤️ - 1 time only da!'); return; } likes[id]=true; localStorage.setItem('pixoro_likes',JSON.stringify(likes)); posts.find(p=>p.id==id).likes++; localStorage.setItem('pixoro_posts',JSON.stringify(posts)); renderFeed(); showNoti('❤️ +1 Like mass da!'); };

// COMMENT
window.openComment=(id)=>{ currentCommentId=id; document.getElementById('commentModal').classList.add('on'); renderComments(); };
window.closeComment=()=>document.getElementById('commentModal').classList.remove('on');
function renderComments(){ const list=comments[currentCommentId]||[]; document.getElementById('commentList').innerHTML=list.map(c=>`<div style="display:flex;gap:8px;margin-bottom:10px"><img src="https://i.pravatar.cc/40?u=${c.user}" style="width:32px;height:32px;border-radius:50%"><div><b style="font-size:13px">${c.user}</b> <span style="font-size:13px">${c.text}</span><div style="font-size:10px;color:#888;margin-top:2px">${c.likes||1} likes • Reply</div></div><span style="margin-left:auto;font-size:12px">❤️</span></div>`).join('')||'<p style="color:#999;text-align:center;margin-top:20px">No comments yet. Be first!</p>'; }
window.postComment=()=>{ const input=document.getElementById('commentInput'); const text=input.value.trim(); if(!text) return; if(!comments[currentCommentId]) comments[currentCommentId]=[]; comments[currentCommentId].push({user:'girikri',text}); localStorage.setItem('pixoro_comments',JSON.stringify(comments)); input.value=''; renderComments(); renderFeed(); showNoti('💬 Comment +1 added!'); };

// SHARE
window.sharePost=(id)=>{ const p=posts.find(x=>x.id==id); p.shares=(p.shares||0)+1; localStorage.setItem('pixoro_posts',JSON.stringify(posts)); navigator.clipboard.writeText(location.href); renderFeed(); showNoti(`✈️ Shared • ${p.shares} shares`); };

// FOLLOW
window.toggleFollow=(u)=>{ if(follows[u]){ follows[u]=false; localStorage.setItem('pixoro_follows',JSON.stringify(follows)); showNoti('Unfollowed'); } else { follows[u]=true; localStorage.setItem('pixoro_follows',JSON.stringify(follows)); showNoti(`Follow +1 • Following ${u}`); } renderFeed(); openProfilePage(u); };

// PROFILE
window.openProfilePage=(u)=>{ currentP=u; document.getElementById('profilePage').classList.add('on'); document.getElementById('pUser').innerText=u; document.getElementById('pImg').src=`https://i.pravatar.cc/150?u=${u}`; const up=posts.filter(p=>p.user==u); document.getElementById('pPosts').innerText=up.length; let tv=0,tl=0,tc=0; up.forEach(p=>{ tv+=p.viewers?.length||0; tl+=p.likes+(likes[p.id]?1:0); tc+=comments[p.id]?.length||0; }); document.getElementById('pViews').innerText=tv; document.getElementById('pLikes').innerText=tl; document.getElementById('pComments').innerText=tc; document.getElementById('pFollowing').innerText=Object.keys(follows).length; document.getElementById('pFollowers').innerText=128+(follows[u]?1:0); document.getElementById('pGrid').innerHTML=up.map(p=>`<img src="${p.img}" style="width:100%;aspect-ratio:1;object-fit:cover">`).join('')||'<p style="grid-column:1/4;text-align:center;padding:20px;color:#999">No posts</p>'; document.getElementById('followBtn').innerText=follows[u]?'Following':'Follow'; document.getElementById('followReq').style.display=u=='girikri'?'block':'none'; };
window.closeProfilePage=()=>document.getElementById('profilePage').classList.remove('on');

// FOLLOWERS LIST - yaaru follow panranga nu paarkalam
window.openFollowers=()=>{ document.getElementById('followListModal').classList.add('on'); document.getElementById('followListTitle').innerText='Followers • 129'; document.getElementById('followList').innerHTML=['whitezzz__04','don_deepak_k_','sweety_sw','girikri','arjun_99','priya_official'].map(u=>`<div class="listItem"><div style="display:flex;gap:10px;align-items:center"><img src="https://i.pravatar.cc/40?u=${u}" style="width:40px;height:40px;border-radius:50%"><div><div style="font-weight:700;font-size:13px">${u}</div><div style="font-size:11px;color:#888">Followed you • 2h ago</div></div></div><button style="background:#000;color:#fff;border:0;padding:6px 14px;border-radius:6px;font-size:12px">Remove</button></div>`).join(''); };
window.openFollowing=()=>{ document.getElementById('followListModal').classList.add('on'); document.getElementById('followListTitle').innerText='Following • '+Object.keys(follows).length; const list=Object.keys(follows).length?Object.keys(follows):['whitezzz__04']; document.getElementById('followList').innerHTML=list.map(u=>`<div class="listItem"><div style="display:flex;gap:10px;align-items:center"><img src="https://i.pravatar.cc/40?u=${u}" style="width:40px;height:40px;border-radius:50%"><div><div style="font-weight:700;font-size:13px">${u}</div><div style="font-size:11px;color:#888">Following</div></div></div><button style="background:#efefef;border:0;padding:6px 14px;border-radius:6px;font-size:12px">Unfollow</button></div>`).join(''); };
window.closeFollowList=()=>document.getElementById('followListModal').classList.remove('on');
window.acceptReq=()=>{ document.getElementById('followReq').innerHTML='✅ Accepted • whitezzz__04 is now follower'; document.getElementById('pFollowers').innerText=130; showNoti('✅ Follow request accepted - Followers +1'); };
window.rejectReq=()=>{ document.getElementById('followReq').style.display='none'; showNoti('Request rejected'); };

// ZOOM
window.openZoom=(src)=>{ document.getElementById('zoomImg').src=src; document.getElementById('zoomModal').classList.add('on'); };
window.closeZoom=()=>document.getElementById('zoomModal').classList.remove('on');
window.openUpload=()=>document.getElementById('uploadModal').classList.add('on');
window.closeUpload=()=>document.getElementById('uploadModal').classList.remove('on');
document.getElementById('fileInput')?.addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ window._img=ev.target.result; document.getElementById('previewImg').src=ev.target.result; document.getElementById('previewBox').style.display='block'; document.getElementById('noPhoto').style.display='none'; openUpload(); }; r.readAsDataURL(f); });
window.shareNow=()=>{ const cap=document.getElementById('captionInput').value||document.getElementById('quickCap').value||'Mass post 🔥'; if(!window._img) return alert('Photo select pannu da!'); posts.unshift({id:Date.now(),img:window._img,caption:cap,user:'girikri',likes:0,viewers:[],shares:0,time:'now'}); localStorage.setItem('pixoro_posts',JSON.stringify(posts)); closeUpload(); renderFeed(); showNoti('Posted 🚀'); window._img=null; document.getElementById('previewBox').style.display='none'; document.getElementById('noPhoto').style.display='block'; };
function showNoti(t){ const n=document.getElementById('noti'); n.textContent=t; n.style.display='block'; setTimeout(()=>n.style.display='none',2000); }
