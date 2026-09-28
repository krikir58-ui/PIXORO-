<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pixoro</title>
<link rel="preload" as="image" href="https://i.pravatar.cc/150?u=giri">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
  *{ -webkit-tap-highlight-color: transparent }
  #splash{position:fixed;inset:0;background:#fff;z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity.25s}
 .story-ring{background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);padding:2px;border-radius:50%}
</style>
</head>
<body class="bg-white flex justify-center">

<!-- SPLASH 0.4 SEC MATTUM -->
<div id="splash"><div class="w-[80px] h-[80px] rounded-[20px] bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] flex items-center justify-center"><i class="fa-solid fa-camera text-white text-[36px]"></i></div></div>

<div id="mainApp" class="w-full max-w-[470px] bg-white min-h-screen">
<header class="sticky top-0 z-40 bg-white border-b px-4 py-2 flex justify-between items-center"><h1 class="font-black text-xl">PIXORO 📸</h1><div class="flex gap-4"><i class="fa-regular fa-heart"></i><i class="fa-regular fa-paper-plane"></i></div></header>
<div class="flex gap-3 p-2 overflow-x-auto border-b" id="stories"></div>
<div class="p-2 flex gap-2 border-b"><img src="https://i.pravatar.cc/150?u=giri" class="w-8 h-8 rounded-full"><input id="quickCaption" placeholder="What's on your mind?" class="flex-1 outline-none text-sm"><button onclick="openUpload()" class="bg-[#0095f6] text-white px-4 py-1 rounded-full text-xs font-bold">Post</button></div>
<div id="feed" class="pb-16"></div>
<nav class="fixed bottom-0 w-full max-w-[470px] bg-black text-white flex justify-around py-3 text-xl z-40"><i class="fa-solid fa-house"></i><i class="fa-solid fa-magnifying-glass"></i><div onclick="openUpload()" class="border border-white px-2 rounded"><i class="fa-solid fa-plus"></i></div><i class="fa-solid fa-clapperboard"></i><i class="fa-regular fa-user"></i></nav>
<div id="uploadModal" class="hidden fixed inset-0 bg-white z-[100] flex flex-col"><div class="flex justify-between p-3 border-b"><button onclick="closeUpload()">✕</button><h3 class="font-bold">New post</h3><button onclick="shareNow()" class="text-[#0095f6] font-bold">Share</button></div><div class="flex-1 bg-black flex items-center justify-center"><img id="previewImg" class="hidden w-full h-full object-contain"><p id="noPhoto" class="text-white/50 text-sm">Tap + to select photo</p></div><textarea id="captionInput" placeholder="Caption @mention #tag" class="p-3 outline-none text-sm border-t" rows="2"></textarea></div>
<div id="profileModal" class="hidden fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4" onclick="this.classList.add('hidden')"><img id="profileModalImg" class="w-[280px] h-[280px] rounded-full border-4 border-white"></div>
<div id="noti" class="hidden fixed top-16 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full z-[200]"></div>
<input type="file" id="fileInput" accept="image/*" hidden>
</div>

<script>
// === 1. INSTANT LOAD - NO WAIT ===
let posts = JSON.parse(localStorage.getItem('pixoro_posts')||'[]');
let likes = JSON.parse(localStorage.getItem('pixoro_likes')||'{}');
let follows = JSON.parse(localStorage.getItem('pixoro_follows')||'{}');
if(posts.length==0){ posts=[{id:1,img:'https://picsum.photos/400/400?random=1',caption:'PIXORO speed mass 🔥 @whitezzz__04',user:'girikri',likes:99,time:'now',tags:[]}]; }

// Render immediately - don't wait
function renderFeed(){ document.getElementById('feed').innerHTML=posts.map(p=>`
<div class="border-b"><div class="flex items-center gap-2 p-3" onclick="openProfile('https://i.pravatar.cc/150?u=${p.user}')"><div class="story-ring p-[2px]"><img loading="lazy" src="https://i.pravatar.cc/80?u=${p.user}" class="w-7 h-7 rounded-full bg-white p-[2px]"></div><span class="text-sm font-semibold">${p.user}</span></div><img loading="lazy" src="${p.img}" class="w-full aspect-square object-cover" ondblclick="likePost(${p.id})"><div class="p-3 flex gap-4 text-xl"><i id="heart-${p.id}" onclick="likePost(${p.id})" class="${likes[p.id]?'fa-solid fa-heart text-red-500':'fa-regular fa-heart'}"></i><i class="fa-regular fa-paper-plane" onclick="navigator.clipboard.writeText(location.href)"></i></div><p class="px-3 pb-3 text-sm"><b>${p.user}</b> ${p.caption}</p></div>`).join(''); }
function renderStories(){ document.getElementById('stories').innerHTML=['whitezzz__04','don_deepak_k_','sweety_sw'].map(u=>`<div class="flex flex-col items-center min-w-[60px]"><div class="story-ring"><img loading="lazy" src="https://i.pravatar.cc/80?u=${u}" class="w-14 h-14 rounded-full bg-white p-[2px]"></div><span class="text-[10px]">${u.slice(0,8)}</span></div>`).join(''); }
renderFeed(); renderStories();

// Splash hide in 400ms - Instagram speed
setTimeout(()=>{ const s=document.getElementById('splash'); s.style.opacity='0'; setTimeout(()=>s.remove(),250); }, 400);

document.getElementById('fileInput').addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{ document.getElementById('previewImg').src=ev.target.result; document.getElementById('previewImg').classList.remove('hidden'); document.getElementById('noPhoto').classList.add('hidden'); openUpload(); }; r.readAsDataURL(f); });
window.openUpload=()=>document.getElementById('uploadModal').classList.remove('hidden');
window.closeUpload=()=>document.getElementById('uploadModal').classList.add('hidden');
window.shareNow=()=>{ const cap=document.getElementById('captionInput').value||document.getElementById('quickCaption').value||'Mass post'; const img=document.getElementById('previewImg').src; if(!img) return alert('Photo select pannu da!'); posts.unshift({id:Date.now(),img, caption:cap, user:'girikri', likes:0, time:'now'}); localStorage.setItem('pixoro_posts', JSON.stringify(posts)); closeUpload(); renderFeed(); showNoti('Posted 🚀'); };
window.likePost=(id)=>{ likes[id]=!likes[id]; localStorage.setItem('pixoro_likes', JSON.stringify(likes)); renderFeed(); };
window.openProfile=(img)=>{ document.getElementById('profileModalImg').src=img; document.getElementById('profileModal').classList.remove('hidden'); };
function showNoti(t){ const n=document.getElementById('noti'); n.textContent=t; n.classList.remove('hidden'); setTimeout(()=>n.classList.add('hidden'),1500); }

// Service worker for cache - makes 2nd open instant
if('serviceWorker' in navigator){ navigator.serviceWorker.register('data:text/javascript;base64,'+btoa('self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});')); }
</script>
</body>
</html>
