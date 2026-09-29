// PIXORO FINAL MASS SPEED + ONE TIME LOGIC 🔥
console.log('PIXORO MASS ON da Giri!');
let posts = JSON.parse(localStorage.getItem('pixoro_posts')||'[]');
let likes = JSON.parse(localStorage.getItem('pixoro_likes')||'{}');
let follows = JSON.parse(localStorage.getItem('pixoro_follows')||'{}');
let viewedIds = JSON.parse(localStorage.getItem('pixoro_viewedIds')||'[]');
let deviceId = localStorage.getItem('pixoro_device') || 'dev_'+Date.now();
localStorage.setItem('pixoro_device', deviceId);
let currentP='girikri';

if(posts.length==0){
 posts=[
  {id:1,img:'https://picsum.photos/seed/pixoro1/700/700',caption:'Mass entry da @whitezzz__04 🔥 #cbe',user:'girikri',likes:128,viewers:[],time:'now'},
  {id:2,img:'https://picsum.photos/seed/pixoro2/700/700',caption:'Lake vibes 😍',user:'whitezzz__04',likes:89,viewers:[],time:'2h'}
 ];
 localStorage.setItem('pixoro_posts',JSON.stringify(posts));
}

function init(){
 renderFeed(); renderStories();
 setTimeout(()=>{
  const s=document.getElementById('splash');
  if(s){ s.style.opacity='0'; s.style.transition='opacity.2s'; setTimeout(()=>s.remove(),200); }
 },350);
}
if(document.readyState=='loading') document.addEventListener('DOMContentLoaded',init); else init();

function renderFeed(){
 const feed=document.getElementById('feed'); if(!feed) return;
 feed.innerHTML=posts.map(p=>{
  const v=p.viewers?.length||0; const l=p.likes+(likes[p.id]?1:0); const isL=likes[p.id]; const isF=follows[p.user];
  return `<div class="post" data-id="${p.id}">
  <div style="display:flex;justify-content:space-between;padding:10px 12px;align-items:center">
   <div style="display:flex;gap:8px;align-items:center" onclick="openProfilePage('${p.user}')"><div class="ring"><img src="https://i.pravatar.cc/80?u=${p.user}" style="width:32px;height:32px;border-radius:50%;padding:2px;background:#fff"></div><div><div style="font-size:14px;font-weight:700">${p.user} <span style="color:#0095f6;font-size:11px">${isF?'• Following':''}</span></div><div style="font-size:10px;color:#888">${p.time} • <span id="view-${p.id}">${v} views</span></div></div></div><span>⋯</span>
  </div>
  <img src="${p.img}" loading="eager" style="width:100%;aspect-ratio:1;object-fit:cover;background:#f5f5f5" ondblclick="likePost(${p.id})">
  <div style="display:flex;gap:16px;font-size:24px;padding:10px 12px"><span onclick="likePost(${p.id})">${isL?'❤️':'🤍'}</span><span>💬</span><span onclick="sharePost()">✈️</span><span style="margin-left:auto">🔖</span></div>
  <div style="padding:0 12px 12px;font-size:13px;font-weight:700"><span id="like-${p.id}">${l} likes</span> • ${v} views • 12 story<br><span style="font-weight:400"><b>${p.user}</b> ${p.caption}</span>
  <div style="display:flex;gap:6px;margin-top:8px"><span class="badge" onclick="likePost(${p.id})">❤️ Like ${l}</span><span class="badge">👁️ View ${v}</span><span class="badge" onclick="toggleFollow('${p.user}')">${isF?'Following':'Follow +1'}</span><span class="badge" onclick="sharePost()">✈️ Share</span></div></div></div>`;
 }).join('');
 observePosts();
}

function observePosts(){
 const obs=new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
   if(en.isIntersecting){
    const id=parseInt(en.target.dataset.id); const p=posts.find(x=>x.id==id); if(!p) return;
    if(!p.viewers) p.viewers=[];
    if(!viewedIds.includes(id) &&!p.viewers.includes(deviceId)){
     p.viewers.push(deviceId); viewedIds.push(id);
     localStorage.setItem('pixoro_posts',JSON.stringify(posts));
     localStorage.setItem('pixoro_viewedIds',JSON.stringify(viewedIds));
     const el=document.getElementById(`view-${id}`); if(el) el.textContent=p.viewers.length+' views';
     showNoti(`👁️ +1 view • ${p.user} post`);
    }
   }
  });
 },{threshold:0.6});
 document.querySelectorAll('.post').forEach(e=>obs.observe(e));
}

function renderStories(){
 const s=document.getElementById('stories'); if(!s) return;
 s.innerHTML=['whitezzz__04','don_deepak_k_','sweety_sw'].map(u=>`<div style="display:flex;flex-direction:column;align-items:center;min-width:64px" onclick="openStory('${u}')"><div class="ring"><img src="https://i.pravatar.cc/80?u=${u}" style="width:60px;height:60px;border-radius:50%;padding:3px;background:#fff"></div><span style="font-size:11px;margin-top:4px">${u.slice(0,9)}</span><span style="font-size:10px;color:#888">50 views</span></div>`).join('');
}

window.likePost=(id)=>{
 if(likes[id]){ showNoti('Already liked - 1 time only da! ❤️'); return; }
 likes[id]=true; localStorage.setItem('pixoro_likes',JSON.stringify(likes));
 const p=posts.find(x=>x.id==id); p.likes++; localStorage.setItem('pixoro_posts',JSON.stringify(posts));
 renderFeed(); if(currentP) openProfilePage(currentP);
 showNoti('❤️ +1 Like mass da!');
};
window.toggleFollow=(u)=>{
 if(follows[u]){ showNoti('Already following da!'); return; }
 follows[u]=true; localStorage.setItem('pixoro_follows',JSON.stringify(follows));
 renderFeed(); openProfilePage(u); showNoti(`Follow +1 • Following ${u} ✅`);
};
window.openProfilePage=(u)=>{
 currentP=u; document.getElementById('profilePage').classList.add('on');
 document.getElementById('pUser').innerText=u; document.getElementById('pImg').src=`https://i.pravatar.cc/150?u=${u}`;
 const up=posts.filter(p=>p.user==u); document.getElementById('pPosts').innerText=up.length;
 let tv=0,tl=0; up.forEach(p=>{ tv+=p.viewers?.length||0; tl+=p.likes+(likes[p.id]?1:0); });
 document.getElementById('pViews').innerText=tv; document.getElementById('pLikes').innerText=tl;
 document.getElementById('pFollowing').innerText=Object.keys(follows).length;
 document.getElementById('pFollowers').innerText=128+(follows[u]?1:0);
 document.getElementById('pStoryV').innerText=89;
 document.getElementById('pGrid').innerHTML=up.map(p=>`<img src="${p.img}" style="width:100%;aspect-ratio:1;object-fit:cover">`).join('')||'<p style="grid-column:1/4;text-align:center;padding:20px;color:#999">No posts</p>';
 document.getElementById('followBtn').innerText=follows[u]?'Following':'Follow';
 document.getElementById('followReq').style.display=u=='girikri'?'block':'none';
};
window.closeProfilePage=()=>document.getElementById('profilePage').classList.remove('on');
window.openUpload=()=>document.getElementById('uploadModal').classList.add('on');
window.closeUpload=()=>document.getElementById('uploadModal').classList.remove('on');
window.sharePost=()=>{ navigator.clipboard.writeText(location.href); showNoti('🔗 Link copied - Share +1'); };
window.openStory=(u)=>{ showNoti(`👁️ ${u} story +1 view`); };
document.getElementById('fileInput')?.addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ window._img=ev.target.result; document.getElementById('previewImg').src=ev.target.result; document.getElementById('previewBox').style.display='block'; document.getElementById('noPhoto').style.display='none'; openUpload(); }; r.readAsDataURL(f); });
window.shareNow=()=>{ const cap=document.getElementById('captionInput').value||document.getElementById('quickCap').value||'Mass post 🔥'; if(!window._img) return alert('Photo select pannu da!'); posts.unshift({id:Date.now(),img:window._img,caption:cap,user:'girikri',likes:0,viewers:[],time:'now'}); localStorage.setItem('pixoro_posts',JSON.stringify(posts)); closeUpload(); renderFeed(); showNoti('Posted 🚀'); window._img=null; document.getElementById('previewBox').style.display='none'; document.getElementById('noPhoto').style.display='block'; };
function showNoti(t){ const n=document.getElementById('noti'); if(!n) return; n.textContent=t; n.style.display='block'; setTimeout(()=>n.style.display='none',1800); }
