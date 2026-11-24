// ===== PIXORO LIKE - FINAL CORRECTED DA - SPEED + DB + LOCAL + INSTA BIG HEART DANCE DA =====
console.log('✅ LIKE FILE LOADED DA - V3 DANCE');

let _lastTapTime = 0, _lastTapId = '', _singleTapTimer = null;
let _lastLikeAction = 0;

try{
  let local = JSON.parse(localStorage.getItem('pixoro_likes') || '[]');
  window.FEED_LIKES = new Set(local.map(String));
}catch(e){ window.FEED_LIKES = new Set(); }
if(!window.FEED_COUNTS) window.FEED_COUNTS = {};

function pixoroSaveLocal(){
  try{ localStorage.setItem('pixoro_likes', JSON.stringify([...window.FEED_LIKES])); }catch(e){}
}

window.pixoroFeedTap = function(postId, el, ev){
  if(ev){
    if(ev.target && ev.target.closest && ev.target.closest('[data-like-btn]')) return;
    ev.preventDefault();
  }
  let now = Date.now();
  if(String(postId) === String(_lastTapId) && (now - _lastTapTime) < 400){
    _lastTapTime = 0;
    if(_singleTapTimer){ clearTimeout(_singleTapTimer); _singleTapTimer = null; }
    pixoroDoubleTapLike(postId, el);
    return;
  }
  _lastTapTime = now; _lastTapId = String(postId);
  if(_singleTapTimer) clearTimeout(_singleTapTimer);
  _singleTapTimer = setTimeout(()=>{
    let vid = el ? el.querySelector('video') : null;
    if(vid){ vid.paused ? vid.play().catch(()=>{}) : vid.pause(); }
  }, 420);
};

(function(){
  // ✅ FIX DA - Pazhaya CSS ah Delete pannama puthu CSS varathu da!
  document.getElementById('pixoro-like-css')?.remove();
  document.getElementById('pixoro-like-css-v2')?.remove();
  document.getElementById('pixoro-like-css-v3')?.remove();
  let s = document.createElement('style');
  s.id = 'pixoro-like-css-v3';
  s.innerText = `
    [data-like-btn]{ -webkit-tap-highlight-color:transparent !important; touch-action:manipulation !important; user-select:none !important; -webkit-user-select:none !important; background:transparent !important; border:none !important; outline:none !important; cursor:pointer !important; }
    [data-like-btn]:active{ opacity:1 !important; transform:none !important; background:transparent !important; }
    [data-like-btn] svg{ overflow:visible !important; display:block !important; width:24px !important; height:24px !important; }
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    /* ✅ BIG HEART - DANCE + POCHU POIDUM DA */
    .bigHeart{ position:absolute !important; left:50% !important; top:50% !important; z-index:99 !important; pointer-events:none !important; opacity:0; transform:translate(-50%,-50%) scale(0); width:90px !important; height:90px !important; }
    .bigHeart.show{ animation:pixHeartDance 900ms ease forwards !important; }
    .bigHeart svg{ width:100% !important; height:100% !important; filter:drop-shadow(0 4px 12px rgba(0,0,0,.5)) !important; }
    @keyframes pixHeartDance{ 0%{opacity:0; transform:translate(-50%,-50%) scale(0) rotate(0deg)} 15%{opacity:1; transform:translate(-50%,-50%) scale(1.3) rotate(-12deg)} 30%{transform:translate(-50%,-50%) scale(1.1) rotate(10deg)} 45%{transform:translate(-50%,-50%) scale(1.2) rotate(-8deg)} 60%{transform:translate(-50%,-50%) scale(1.05) rotate(6deg)} 75%{opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg)} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.2) rotate(0deg)} }
  `;
  document.head.appendChild(s);
})();

function pixoroPaintLikeBtn(btn, willLike){
  if(!btn) return;
  btn.classList.toggle('liked', willLike);
  let svg = btn.querySelector('svg');
  let path = btn.querySelector('path');
  if(svg){
    svg.style.setProperty('fill', willLike ? '#FF0A33' : 'none', 'important');
    svg.style.setProperty('stroke', willLike ? '#FF0A33' : '#fff', 'important');
  }
  if(path){
    path.style.setProperty('fill', willLike ? '#FF0A33' : 'none', 'important');
    path.style.setProperty('stroke', willLike ? '#FF0A33' : '#fff', 'important');
  }
}

function pixoroPaintAllLikes(){
  document.querySelectorAll('[data-like-btn]').forEach(btn=>{
    let pid = String(btn.getAttribute('data-like-btn'));
    let shouldLike = window.FEED_LIKES && window.FEED_LIKES.has(pid);
    pixoroPaintLikeBtn(btn, shouldLike);
  });
}

async function pixoroLoadMyLikes(){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  try{
    let {data:{session}} = await s.auth.getSession();
    if(!session) return;
    window.ME_ID = session.user.id;
    let {data, error} = await s.from('likes').select('post_id').eq('user_id', window.ME_ID);
    if(error) throw error;
    if(!window.FEED_LIKES) window.FEED_LIKES = new Set();
    window.FEED_LIKES.clear();
    (data||[]).forEach(r=> window.FEED_LIKES.add(String(r.post_id)));
    pixoroSaveLocal();
    pixoroPaintAllLikes();
    console.log('✅ MY LIKES LOADED DA:', window.FEED_LIKES.size);
  }catch(e){ console.log('LIKE LOAD FAIL DA:', e.message); }
}

function pixoroBumpCount(postId, delta){
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){
    let cur = parseInt(c.innerText||'0',10) || 0;
    c.innerText = Math.max(0, cur + delta);
  }
}

async function pixoroSyncPostCount(s, postId, delta){
  try{
    let r = await s.rpc('increment_likes', {p_id: postId, p_delta: delta});
    if(r.error) throw r.error;
  }catch(e){
    try{
      let { data: p } = await s.from('posts').select('likes_count').eq('id', postId).single();
      let cur = (p && p.likes_count) || 0;
      await s.from('posts').update({ likes_count: Math.max(0, cur + delta) }).eq('id', postId);
    }catch(e2){ console.log('COUNT SYNC FAIL DA:', e2.message); }
  }
}

async function pixoroToggleLike(postId, btn){
  let now = Date.now();
  if(now - _lastLikeAction < 300) return;
  _lastLikeAction = now;
  if(!btn) btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(!btn) return;
  let willLike = !btn.classList.contains('liked');
  pixoroPaintLikeBtn(btn, willLike);
  pixoroBumpCount(postId, willLike ? 1 : -1);
  if(window.FEED_LIKES){
    willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId));
    pixoroSaveLocal();
  }
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return willLike;
  if(!window.ME_ID){
    try{
      let {data:{session}} = await s.auth.getSession();
      if(session) window.ME_ID = session.user.id;
      else { location.href='./login.html'; return; }
    }catch(e){ return willLike; }
  }
  try{
    if(willLike){
      let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
      if(r.error && String(r.error.code) !== '23505') throw r.error;
    } else {
      let r = await s.from('likes').delete().eq('post_id',postId).eq('user_id',window.ME_ID);
      if(r.error) throw r.error;
    }
    pixoroSyncPostCount(s, postId, willLike ? 1 : -1);
    return willLike;
  }catch(e){
    console.log('❌ LIKE DB FAIL DA:', e.message);
    pixoroPaintLikeBtn(btn, !willLike);
    pixoroBumpCount(postId, willLike ? -1 : 1);
    if(window.FEED_LIKES){
      willLike ? window.FEED_LIKES.delete(String(postId)) : window.FEED_LIKES.add(String(postId));
      pixoroSaveLocal();
    }
    return !willLike;
  }
}

async function pixoroDoubleTapLike(postId, mediaEl){
  showBigHeart(mediaEl);
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;
  _lastLikeAction = Date.now();
  if(btn) pixoroPaintLikeBtn(btn, true);
  pixoroBumpCount(postId, 1);
  if(window.FEED_LIKES){ window.FEED_LIKES.add(String(postId)); pixoroSaveLocal(); }
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return true;
  if(!window.ME_ID){
    try{
      let {data:{session}} = await s.auth.getSession();
      if(session) window.ME_ID = session.user.id;
      else return true;
    }catch(e){ return true; }
  }
  try{
    let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
    if(r.error && String(r.error.code) !== '23505') throw r.error;
    pixoroSyncPostCount(s, postId, 1);
    return true;
  }catch(e){
    console.log('❌ DOUBLE TAP DB FAIL DA:', e.message);
    return true;
  }
}

function showBigHeart(mediaEl){
  if(!mediaEl) return;
  let box = null;
  try{ if(mediaEl.closest) box = mediaEl.closest('.postMedia') || mediaEl.closest('.post'); }catch(e){}
  if(!box) box = mediaEl.parentElement || mediaEl;
  if(!box) return;
  box.querySelectorAll('.bigHeart').forEach(h=>h.remove());
  let div = document.createElement('div');
  div.className = 'bigHeart';
  div.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#FF0A33" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  let cs = window.getComputedStyle(box);
  if(cs.position === 'static') box.style.position = 'relative';
  box.appendChild(div);
  void div.offsetWidth;
  div.classList.add('show');
  setTimeout(()=>div.remove(), 900);
}

if(!window._pixoroLikeDelegation){
  window._pixoroLikeDelegation = true;
  document.addEventListener('click', function(e){
    let btn = e.target.closest('[data-like-btn]');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    let pid = String(btn.getAttribute('data-like-btn'));
    pixoroToggleLike(pid, btn);
  });
}

window.pixoroToggleLike = pixoroToggleLike;
window.pixoroDoubleTapLike = pixoroDoubleTapLike;
window.showBigHeart = showBigHeart;
window.pixoroPaintLikeBtn = pixoroPaintLikeBtn;
window.pixoroPaintAllLikes = pixoroPaintAllLikes;
window.pixoroLoadMyLikes = pixoroLoadMyLikes;

function pixoroInitLikes(){
  pixoroPaintAllLikes();
  pixoroLoadMyLikes();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=> pixoroInitLikes());
} else {
  pixoroInitLikes();
}
window.addEventListener('pixoroFeedLoaded', ()=> setTimeout(()=> pixoroInitLikes(), 100));
setTimeout(()=> pixoroPaintAllLikes(), 1500);
