// ===== PIXORO LIKE - v1.0 - THANI CODE DA =====
// RULE: Like = INGA MATTUM THAAN DA
//       Double Tap = Like ONLY + 3 Hearts da
//       Button = Like / Unlike da

console.log('✅ LIKE FILE LOADED DA - v1.0');

let _lastTapTime = 0, _lastTapId = '', _singleTapTimer = null;

window.pixoroFeedTap = function(postId, el, ev){
  if(ev) ev.preventDefault();
  let now = Date.now();
  if(String(postId) === String(_lastTapId) && (now - _lastTapTime) < 300){
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
  }, 310);
};

// ✅ FIX - CSS ah Ingaye Potten da - Vera File CSS ah Adikka Mudiyaathu da
(function(){
  if(document.getElementById('pixoro-like-css')) return;
  let s = document.createElement('style');
  s.id = 'pixoro-like-css';
  s.innerText = `
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    .bigHeart{ position:absolute; z-index:99; pointer-events:none; opacity:0; transform:translate(-50%,-50%) scale(.5); }
    .bigHeart.show{ opacity:1; transform:translate(-50%,-50%) scale(1.1); transition:all .35s; }
    .bigHeart svg{ width:100%; height:100%; filter:drop-shadow(0 4px 12px rgba(0,0,0,.5)); }
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
  let saved = [];
  try{ saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]'); }catch(e){ saved = []; }
  document.querySelectorAll('[data-like-btn]').forEach(btn=>{
    let pid = String(btn.getAttribute('data-like-btn'));
    let shouldLike = saved.includes(pid) || (window.FEED_LIKES && window.FEED_LIKES.has(pid));
    pixoroPaintLikeBtn(btn, shouldLike);
  });
}

async function pixoroToggleLike(postId, btn){
  console.log('❤️ LIKE CLICKED DA:', postId);
  // btn Illana - Thedi Edu da - onclick Fail aanaalum Ithu Work Aagum da
  if(!btn) btn = document.querySelector(`[data-like-btn="${postId}"]`);
  let willLike = btn ? !btn.classList.contains('liked') : true;
  pixoroPaintLikeBtn(btn, willLike);
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = willLike ? cur+1 : Math.max(0,cur-1); }
  if(window.FEED_LIKES){ willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }
  let saved = [];
  try{ saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]'); }catch(e){ saved = []; }
  if(willLike){ if(!saved.includes(String(postId))) saved.push(String(postId)); }
  else { saved = saved.filter(id=>String(id)!==String(postId)); }
  localStorage.setItem('pixoro_likes', JSON.stringify(saved));
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return willLike;
  if(!window.ME_ID){ try{ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else { location.href='./login.html'; return; } }catch(e){ return willLike; } }
  try{
    if(willLike){ let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID}); if(r.error) throw r.error; }
    else { let r = await s.from('likes').delete().eq('post_id',postId).eq('user_id',window.ME_ID); if(r.error) throw r.error; }
    return willLike;
  }catch(e){ console.log('❌ LIKE DB FAIL DA:', e.message); return willLike; }
}

async function pixoroDoubleTapLike(postId, mediaEl){
  showBigHeart(mediaEl);
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;
  if(btn) pixoroPaintLikeBtn(btn, true);
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = cur+1; }
  if(window.FEED_LIKES) window.FEED_LIKES.add(String(postId));
  let saved = [];
  try{ saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]'); }catch(e){ saved = []; }
  if(!saved.includes(String(postId))){ saved.push(String(postId)); localStorage.setItem('pixoro_likes', JSON.stringify(saved)); }
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return true;
  if(!window.ME_ID){ try{ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return true; }catch(e){ return true; } }
  try{ let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID}); if(r.error) throw r.error; return true; }
  catch(e){ console.log('❌ DOUBLE TAP DB FAIL DA:', e.message); return true; }
}

function showBigHeart(mediaEl){
  if(!mediaEl) return;
  mediaEl.querySelectorAll('.bigHeart').forEach(h=>h.remove());
  let spots = [
    { left:'50%', top:'52%', size:95, delay:0 },
    { left:'36%', top:'60%', size:60, delay:130 },
    { left:'65%', top:'58%', size:56, delay:260 },
  ];
  spots.forEach((sp)=>{
    let div = document.createElement('div');
    div.className = 'bigHeart';
    div.style.left = sp.left; div.style.top = sp.top;
    div.style.width = sp.size + 'px'; div.style.height = sp.size + 'px';
    div.style.animationDelay = sp.delay + 'ms';
    div.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#FF0A33" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    mediaEl.appendChild(div);
    void div.offsetWidth;
    div.classList.add('show');
    setTimeout(()=>div.remove(), 1450 + sp.delay);
  });
}

// ✅ MAIN FIX DA - onclick Fail aanaalum - Ithu Pudichikum da!
// Feed la Button iruntha Podhum da - onclick Theva Illa da
if(!window._pixoroLikeDelegation){
  window._pixoroLikeDelegation = true;
  document.addEventListener('click', function(e){
    let btn = e.target.closest('[data-like-btn]');
    if(!btn) return;
    // onclick um Ithu um Rendu Thadava Ooda Koodathu da - Oru Thadava mattum da
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
