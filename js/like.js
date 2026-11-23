// ===== PIXORO LIKE - FINAL DA - NO LOCALSTORAGE - SERVER ONLY + DANCE DA =====
console.log('✅ LIKE FILE LOADED DA');

let _lastTapTime = 0, _lastTapId = '', _singleTapTimer = null;
let _lastLikeAction = 0;
if(!window.FEED_LIKES) window.FEED_LIKES = new Set();
if(!window.FEED_COUNTS) window.FEED_COUNTS = {};

// ❌ LocalStorage ILLA DA - Server la mattum thaan Save da

window.pixoroFeedTap = function(postId, el, ev){
  if(ev) ev.preventDefault();
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
  if(document.getElementById('pixoro-like-css')) return;
  let s = document.createElement('style');
  s.id = 'pixoro-like-css';
  s.innerText = `
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    .bigHeart{ position:absolute !important; left:50% !important; top:50% !important; z-index:99 !important; pointer-events:none !important; opacity:0 !important; transform:translate(-50%,-50%) scale(0) !important; width:80px !important; height:80px !important; }
    .bigHeart.show{ opacity:1 !important; animation:pixHeartDance 600ms ease forwards !important; }
    .bigHeart svg{ width:100% !important; height:100% !important; filter:drop-shadow(0 4px 12px rgba(0,0,0,.5)) !important; }
    @keyframes pixHeartDance{ 0%{opacity:0; transform:translate(-50%,-50%) scale(0) rotate(0deg)} 15%{opacity:1; transform:translate(-50%,-50%) scale(1.3) rotate(-10deg)} 30%{transform:translate(-50%,-50%) scale(1.1) rotate(10deg)} 45%{transform:translate(-50%,-50%) scale(1.2) rotate(-8deg)} 60%{transform:translate(-50%,-50%) scale(1.05) rotate(6deg)} 75%{opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg)} 100%{opacity:0; transform:translate(-50%,-50%) scale(0.8) rotate(0deg)} }
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

// ✅ SERVER la irunthu mattum Load pannu da - Refresh pannina Red varum da
async function pixoroLoadMyLikes(){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  try{
    let {data:{session}} = await s.auth.getSession();
    if(!session) return;
    window.ME_ID = session.user.id;
    let {data, error} = await s.from('likes').select('post_id').eq('user_id', window.ME_ID);
    if(error) throw error;
    if(!window.FEED_LIKES) window.FEED_LIKES = new Set();
    (data||[]).forEach(r=> window.FEED_LIKES.add(String(r.post_id)));
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
  if(window.FEED_COUNTS){
    window.FEED_COUNTS[String(postId)] = window.FEED_COUNTS[String(postId)] || {like:0,comment:0,share:0};
    window.FEED_COUNTS[String(postId)].like = Math.max(0, (window.FEED_COUNTS[String(postId)].like||0) + delta);
  }
}

async function pixoroToggleLike(postId, btn){
  let now = Date.now();
  if(now - _lastLikeAction < 150) return;
  _lastLikeAction = now;
  if(!btn) btn = document.querySelector(`[data-like-btn="${postId}"]`);
  let willLike = btn ? !btn.classList.contains('liked') : true;
  pixoroPaintLikeBtn(btn, willLike);
  pixoroBumpCount(postId, willLike ? 1 : -1);
  if(window.FEED_LIKES){ willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }
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
    return willLike;
  }catch(e){
    console.log('❌ LIKE DB FAIL DA:', e.message);
    return willLike;
  }
}

async function pixoroDoubleTapLike(postId, mediaEl){
  showBigHeart(mediaEl);
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;
  if(btn) pixoroPaintLikeBtn(btn, true);
  pixoroBumpCount(postId, 1);
  if(window.FEED_LIKES) window.FEED_LIKES.add(String(postId));
  _lastLikeAction = Date.now();
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
  div.style.width = '80px'; div.style.height = '80px';
  div.style.position = 'absolute'; div.style.left = '50%'; div.style.top = '50%'; div.style.zIndex = '99';
  div.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#FF0A33" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  let cs = window.getComputedStyle(box);
  if(cs.position === 'static') box.style.position = 'relative';
  box.appendChild(div);
  void div.offsetWidth;
  div.classList.add('show');
  setTimeout(()=>div.remove(), 600);
}

if(!window._pixoroLikeDelegation){
  window._pixoroLikeDelegation = true;
  document.addEventListener('click', function(e){
    let btn = e.target.closest('[data-like-btn]');
    if(!btn) return;
    if(e._pixoroLikeHandled) return;
    e._pixoroLikeHandled = true;
    e.preventDefault();
    e.stopPropagation();
    let pid = String(btn.getAttribute('data-like-btn'));
    pixoroToggleLike(pid, btn);
  }, true);
}

window.pixoroToggleLike = pixoroToggleLike;
window.pixoroDoubleTapLike = pixoroDoubleTapLike;
window.showBigHeart = showBigHeart;
window.pixoroPaintLikeBtn = pixoroPaintLikeBtn;
window.pixoroPaintAllLikes = pixoroPaintAllLikes;
window.pixoroLoadMyLikes = pixoroLoadMyLikes;

// ✅ Feed vantha piragu Server la irunthu Red pannu da
function pixoroStartLikeFix(){
  pixoroLoadMyLikes();
  if(!window._pixoroLikeObs){
    window._pixoroLikeObs = true;
    let _obs = new MutationObserver(()=> pixoroPaintAllLikes());
    _obs.observe(document.body, {childList:true, subtree:true});
  }
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', pixoroStartLikeFix);
} else {
  pixoroStartLikeFix();
}
setTimeout(()=> pixoroPaintAllLikes(), 1000);
setTimeout(()=> pixoroPaintAllLikes(), 2500);
