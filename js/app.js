// PIXORO - ULTRA SPEED + FULL SYSTEM EDITION 🔥 - Giri Mass
console.log('PIXORO Speed Mode ON da Giri! 🚀');

// ===== NO FIREBASE - 40 SEC SAVE DA! =====
let posts = JSON.parse(localStorage.getItem('pixoro_posts') || '[]');
let likes = JSON.parse(localStorage.getItem('pixoro_likes') || '{}');
let commentLikes = JSON.parse(localStorage.getItem('pixoro_clikes') || '{}');
let follows = JSON.parse(localStorage.getItem('pixoro_follows') || '{}');
let comments = JSON.parse(localStorage.getItem('pixoro_comments') || '{}');
let saves = JSON.parse(localStorage.getItem('pixoro_saves') || '{}');

// Dummy data for first time - insta maathiri
if (posts.length === 0) {
  posts = [
    {id:1, img:'https://picsum.photos/400/400?random=1', caption:'PIXORO mass entry da @whitezzz__04 🔥 #cbe', user:'girikri', likes:128, time:'now', private:false, filter:'none'},
    {id:2, img:'https://picsum.photos/400/500?random=2', caption:'Coimbatore vibes 😍 @don_deepak_k_', user:'whitezzz__04', likes:89, time:'2h', private:false, filter:'none'}
  ];
  localStorage.setItem('pixoro_posts', JSON.stringify(posts));
}

// ===== INSTANT RENDER - WAIT PANNATHU DA =====
function init() {
  renderFeed();
  renderStories();
  // Splash 0.4 sec la close
  setTimeout(()=> {
    const s=document.getElementById('splash');
    if(s){ s.style.opacity='0'; setTimeout(()=>s.remove(),200); }
  }, 400);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

// ===== FEED RENDER - SPEED =====
function renderFeed(q='') {
  const feed = document.getElementById('feed'); if(!feed) return;
  let list = posts;
  if(q) {
    const low=q.toLowerCase();
    list = posts.filter(p=> p.caption.toLowerCase().includes(low) || p.user.toLowerCase().includes(low) || (p.tags&&p.tags.join(' ').toLowerCase().includes(low)) );
  }
  feed.innerHTML = list.map(p => {
    const cList = comments[p.id] || [];
    const isLiked = likes[p.id];
    const isFollow = follows[p.user];
    const isSaved = saves[p.id];
    return `
    <div class="bg-white border-b border-[#efefef]" id="post-${p.id}">
      <div class="flex justify-between items-center p-3">
        <div class="flex items-center gap-2" onclick="openProfile('https://i.pravatar.cc/150?u=${p.user}')">
          <div class="story-ring p-[2px]"><img loading="lazy" src="https://i.pravatar.cc/80?u=${p.user}" class="w-8 h-8 rounded-full bg-white p-[2px]"></div>
          <div><p class="text-[14px] font-semibold flex items-center gap-2">${p.user} ${isFollow?'':''}<span class="text-[#0095f6] text-[11px]">${isFollow?'• Following':'• Follow'}</span></p><p class="text-[10px] text-gray-500">${p.time} ${p.private?'🔒':''}</p></div>
        </div>
        <button onclick="togglePrivate(${p.id})" class="text-[11px] border px-2 py-1 rounded-full">${p.private?'🔒 Private':'🌍 Public'}</button>
      </div>
      <img loading="lazy" src="${p.img}" style="filter:${p.filter||'none'}" class="w-full aspect-square object-cover" ondblclick="likePost(${p.id})">
      <div class="p-3">
        <div class="flex justify-between text-[22px] mb-2">
          <div class="flex gap-4">
            <i id="heart-${p.id}" onclick="likePost(${p.id})" class="${isLiked?'fa-solid fa-heart text-red-500 scale-110':'fa-regular fa-heart'} transition"></i>
            <i class="fa-regular fa-comment" onclick="focusComment(${p.id})"></i>
            <i class="fa-regular fa-paper-plane" onclick="sharePost(${p.id})"></i>
          </div>
          <i onclick="savePost(${p.id})" class="${isSaved?'fa-solid':'fa-regular'} fa-bookmark"></i>
        </div>
        <p class="text-[14px] font-bold">${p.likes + (isLiked?1:0)} likes</p>
        <p class="text-[14px]"><span class="font-bold">${p.user}</span> ${formatCaption(p.caption)}</p>
        <div class="flex gap-2 mt-2">
          <button onclick="toggleFollow('${p.user}')" class="text-[11px] border px-3 py-1 rounded-full font-bold ${isFollow?'bg-black text-white':'bg-white'}">${isFollow?'Following':'Follow'}</button>
          <button onclick="sharePost(${p.id})" class="text-[11px] border px-3 py-1 rounded-full">Share</button>
          <button onclick="openTagModal(${p.id})" class="text-[11px] border px-3 py-1 rounded-full">Tag</button>
        </div>
        <!-- COMMENTS -->
        <div class="mt-2 space-y-1" id="comments-${p.id}">
          ${cList.map((c,i)=>`<p class="text-[13px]"><b>${c.user}</b> ${c.text} <i onclick="likeComment(${p.id},${i})" class="${commentLikes[p.id+'-'+i]?'fa-solid text-red-500':'fa-regular'} fa-heart text-[11px] ml-2"></i> <span class="text-[10px] text-gray-400">${commentLikes[p.id+'-'+i]?1:0}</span></p>`).join('')}
        </div>
        <div class="flex gap-2 mt-2">
          <img src="https://i.pravatar.cc/80?u=giri" class="w-6 h-6 rounded-full">
          <input id="comment-${p.id}" placeholder="Add a comment... @mention" class="flex-1 text-[13px] outline-none" onkeydown="if(event.key==='Enter') addComment(${p.id})">
          <button onclick="addComment(${p.id})" class="text-[#0095f6] text-[12px] font-bold">Post</button>
        </div>
      </div>
    </div>`;
  }).join('') || `<p class="text-center py-10 text-gray-400 text-sm">No posts da Giri. First post podu! 📸</p>`;
}

function formatCaption(t){ return t.replace(/@(\w+)/g,'<span class="text-[#00376b]">@$1</span>').replace(/#(\w+)/g,'<span class="text-[#00376b]">#$1</span>'); }

// ===== ALL SYSTEMS =====
window.likePost = (id) => {
  likes[id]=!likes[id]; localStorage.setItem('pixoro_likes', JSON.stringify(likes));
  const el=document.getElementById(`heart-${id}`); if(el){ el.className = likes[id]?'fa-solid fa-heart text-red-500 scale-110':'fa-regular fa-heart'; el.classList.add('animate-bounce'); setTimeout(()=>el.classList.remove('animate-bounce'),300); }
  showNoti(likes[id]?'❤️ Liked':'💔 Unliked');
  // update count instantly
  const p=posts.find(x=>x.id==id); if(p){ document.querySelector(`#post-${id}.font-bold`)?.innerText = `${p.likes + (likes[id]?1:0)} likes`; }
};

window.addComment = (id) => {
  const inp=document.getElementById(`comment-${id}`); const text=inp.value.trim(); if(!text) return;
  if(!comments[id]) comments[id]=[];
  comments[id].push({user:'girikri', text, time:'now'});
  localStorage.setItem('pixoro_comments', JSON.stringify(comments));
  inp.value=''; renderFeed(document.getElementById('searchInput')?.value||''); showNoti('Comment added da! 💬');
};

window.likeComment = (postId, idx) => {
  const key=postId+'-'+idx; commentLikes[key]=!commentLikes[key];
  localStorage.setItem('pixoro_clikes', JSON.stringify(commentLikes)); renderFeed();
  showNoti(commentLikes[key]?'❤️ Comment liked':'Unliked');
};

window.sharePost = async (id) => {
  const p=posts.find(x=>x.id==id);
  if(navigator.share){ try{ await navigator.share({title:'PIXORO', text:p.caption, url:location.href}); }catch{} }
  else { await navigator.clipboard.writeText(location.href); showNoti('🔗 Link copied da Giri!'); }
};

window.savePost = (id) => { saves[id]=!saves[id]; localStorage.setItem('pixoro_saves', JSON.stringify(saves)); renderFeed(); showNoti(saves[id]?'Saved da! 🔖':'Unsaved'); };
window.toggleFollow = (u) => { follows[u]=!follows[u]; localStorage.setItem('pixoro_follows', JSON.stringify(follows)); renderFeed(); showNoti(follows[u]?`Following ${u} 🔥`:`Unfollowed ${u}`); };
window.togglePrivate = (id) => { const p=posts.find(x=>x.id==id); if(p){ p.private=!p.private; localStorage.setItem('pixoro_posts', JSON.stringify(posts)); renderFeed(); showNoti(p.private?'🔒 Private':'🌍 Public'); } };
window.openProfile = (img) => { document.getElementById('profileModalImg').src=img; document.getElementById('profileModal').classList.remove('hidden'); };
window.focusComment = (id) => { document.getElementById(`comment-${id}`)?.focus(); };
window.openTagModal = (id) => { const t=prompt('Tag @username:'); if(t){ const p=posts.find(x=>x.id==id); if(p){ if(!p.tags) p.tags=[]; p.tags.push(t.replace('@','')); localStorage.setItem('pixoro_posts', JSON.stringify(posts)); renderFeed(); showNoti(`Tagged @${t} 🏷️`); } } };

function renderStories(){
  const el=document.getElementById('stories'); if(!el) return;
  const users=['whitezzz__04','don_deepak_k_','sweety_sw','viyaaaaa_'];
  el.innerHTML = users.map(u=>`<div class="flex flex-col items-center min-w-[60px]" onclick="openStory('${u}')"><div class="story-ring"><img loading="lazy" src="https://i.pravatar.cc/80?u=${u}" class="w-14 h-14 rounded-full bg-white p-[2px]"></div><span class="text-[10px] truncate w-[60px] text-center">${u}</span></div>`).join('');
}
window.openStory = (u) => { const m=document.getElementById('storyModal'); document.getElementById('storyModalImg').src=`https://i.pravatar.cc/400?u=${u}`; m.classList.remove('hidden'); setTimeout(()=>m.classList.add('hidden'),3000); };

function showNoti(t){ const n=document.getElementById('noti'); if(!n) return; n.textContent=t; n.classList.remove('hidden'); setTimeout(()=>n.classList.add('hidden'),1800); }

// Search + mention
document.getElementById('searchInput')?.addEventListener('input', e=>renderFeed(e.target.value));
document.getElementById('fileInput')?.addEventListener('change', e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=ev=>{ window._tempImg=ev.target.result; document.getElementById('previewImg').src=ev.target.result; document.getElementById('previewImg').classList.remove('hidden'); document.getElementById('noPhoto')?.classList.add('hidden'); openUpload(); }; r.readAsDataURL(f);
});
window.openUpload=()=>document.getElementById('uploadModal')?.classList.remove('hidden');
window.closeUpload=()=>document.getElementById('uploadModal')?.classList.add('hidden');
window.shareNow=()=>{
  const cap=document.getElementById('captionInput')?.value || document.getElementById('quickCaption')?.value || 'Mass post da 🔥';
  const img=window._tempImg || document.getElementById('previewImg')?.src;
  if(!img || img.includes('picsum') &&!window._tempImg) return alert('Photo select pannu da Giri!');
  posts.unshift({id:Date.now(), img, caption:cap, user:'girikri', likes:0, time:'now', private:false, filter:'none'});
  localStorage.setItem('pixoro_posts', JSON.stringify(posts)); closeUpload(); renderFeed(); showNoti('Posted da Giri! 🚀'); window._tempImg=null;
};
