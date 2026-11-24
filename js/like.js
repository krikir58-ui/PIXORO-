// ===== PIXORO LIKE - FINAL V14 - VELLA ILLA - RED HEART MATTUM DA =====
console.log('✅ LIKE FILE LOADED DA - V14 VELLA ILLA');

let _lastTapTime = 0, _lastTapId = '', _singleTapTimer = null;
let _lastLikeAction = 0;

window._pixLastTouchX = 0; window._pixLastTouchY = 0;
document.addEventListener('touchstart', function(e){
  if(e.touches && e.touches[0]){ window._pixLastTouchX = e.touches[0].clientX; window._pixLastTouchY = e.touches[0].clientY; }
}, {passive:true});
document.addEventListener('touchend', function(e){
  if(e.changedTouches && e.changedTouches[0]){ window._pixLastTouchX = e.changedTouches[0].clientX; window._pixLastTouchY = e.changedTouches[0].clientY; }
}, {passive:true});
document.addEventListener('mousedown', function(e){ window._pixLastTouchX = e.clientX; window._pixLastTouchY = e.clientY; }, {passive:true});

try{
  let local = JSON.parse(localStorage.getItem('pixoro_likes') || '[]');
  window.FEED_LIKES = new Set(local.map(String));
}catch(e){ window.FEED_LIKES = new Set(); }
if(!window.FEED_COUNTS) window.FEED_COUNTS = {};

function pixoroSaveLocal(){
  try{ localStorage.setItem('pixoro_likes', JSON.stringify([...window.FEED_LIKES])); }catch(e){}
}

window.pixoroFeedTap = function(postId, el, ev){
  if(!ev && window._pixLastTouchX){ ev = { clientX: window._pixLastTouchX, clientY: window._pixLastTouchY }; }
  if(ev){
    if(ev.target && ev.target.closest && ev.target.closest('[data-like-btn]')) return;
    if(ev.preventDefault) ev.preventDefault();
  }
  let now = Date.now();
  if(String(postId) === String(_lastTapId) && (now - _lastTapTime) < 500){
    _lastTapTime = 0;
    if(_singleTapTimer){ clearTimeout(_singleTapTimer); _singleTapTimer = null; }
    pixoroDoubleTapLike(postId, el, ev);
    return;
  }
  _lastTapTime = now; _lastTapId = String(postId);
  if(_singleTapTimer) clearTimeout(_singleTapTimer);
  _singleTapTimer = setTimeout(()=>{
    let vid = el ? el.querySelector('video') : null;
    if(vid){ vid.paused ? vid.play().catch(()=>{}) : vid.pause(); }
  }, 520);
};

(function(){
  document.getElementById('pixoro-like-css')?.remove();
  document.getElementById('pixoro-like-css-v2')?.remove();
  document.getElementById('pixoro-like-css-v3')?.remove();
  document.getElementById('pixoro-like-css-v4')?.remove();
  document.getElementById('pixoro-like-css-v5')?.remove();
  document.getElementById('pixoro-like-css-v6')?.remove();
  document.getElementById('pixoro-like-css-v7')?.remove();
  document.getElementById('pixoro-like-css-v8')?.remove();
  document.getElementById('pixoro-like-css-v9')?.remove();
  document.getElementById('pixoro-like-css-v10')?.remove();
  document.getElementById('pixoro-like-css-v11')?.remove();
  document.getElementById('pixoro-like-css-v12')?.remove();
  document.getElementById('pixoro-like-css-v13')?.remove();
  document.getElementById('pixoro-like-css-v14')?.remove();
  let s = document.createElement('style');
  s.id = 'pixoro-like-css-v14';
  s.innerText = `
    [data-like-btn]{ -webkit-tap-highlight-color:transparent !important; touch-action:manipulation !important; user-select:none !important; -webkit-user-select:none !important; background:transparent !important; border:none !important; outline:none !important; cursor:pointer !important; }
    [data-like-btn]:active{ opacity:1 !important; transform:none !important; background:transparent !important; }
    [data-like-btn] svg{ overflow:visible !important; display:block !important; width:24px !important; height:24px !important; }
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    /* ✅ VELLA FIX DA - Periya Heart ku Pinnadi Vella Box Varathu da */
    .bigHeart{ background:transparent !important; background-color:transparent !important; box-shadow:none !important; border:none !important; outline:none !important; }
    .bigHeart svg{ background:transparent !important; background-color:transparent !important; width:100% !important; height:100% !important; }
    .bigHeart svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
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

async function pixoroDoubleTapLike(postId, mediaEl, ev){
  console.log('❤️ DOUBLE TAP LIKE DA:', postId);
  showBigHeart(mediaEl, 0, 0);
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

function showBigHeart(mediaEl, tapX, tapY){
  document.querySelectorAll('.bigHeart').forEach(h=>h.remove());
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let div = document.createElement('div');
  div.className = 'bigHeart';
  // ✅ VELLA FIX - background transparent + border illa da
  div.style.cssText = 'position:fixed !important;z-index:999999 !important;pointer-events:none !important;width:120px;height:120px;left:'+cx+'px;top:'+cy+'px;opacity:1 !important;transform:translate(-50%,-50%) scale(0.2);background:transparent !important;background-color:transparent !important;box-shadow:none !important;border:none !important;';
  // ✅ Path la ye fill ah Force Pannurom da - Site oda Vella CSS Adikka Mudiyathu da
  div.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%;background:transparent !important;background-color:transparent !important;filter:drop-shadow(0 4px 14px rgba(0,0,0,.5))"><path fill="#FF0A33" stroke="#FF0A33" style="fill:#FF0A33 !important;stroke:#FF0A33 !important;" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  document.body.appendChild(div);
  let colors = ['#FF0A33','#FF4D8D','#FF8A00','#FF2E9A','#FFD500','#00E5FF','#7C4DFF','#00FF88'];
  let ci = 0;
  let path = div.querySelector('path');
  let colorTimer = setInterval(()=>{
    ci = (ci+1) % colors.length;
    if(path){
      path.setAttribute('fill', colors[ci]);
      path.setAttribute('stroke', colors[ci]);
      path.style.setProperty('fill', colors[ci], 'important');
      path.style.setProperty('stroke', colors[ci], 'important');
    }
  }, 280);
  let scale = 0.2;
  let grow = setInterval(()=>{
    scale += 0.15;
    if(scale >= 1){ scale = 1; clearInterval(grow); }
    div.style.transform = 'translate(-50%,-50%) scale('+scale+')';
  }, 30);
  setTimeout(()=>{
    div.style.transition = 'opacity 0.4s, transform 0.4s';
    div.style.opacity = '0';
    div.style.transform = 'translate(-50%,-50%) scale(1.2)';
    setTimeout(()=>{ clearInterval(colorTimer); div.remove(); }, 450);
  }, 2400);
}

(function(){
  if(window._pixAutoDoubleTap) return;
  window._pixAutoDoubleTap = true;
  let _autoLast = 0, _autoId = '';
  function findPostInfo(startEl){
    if(!startEl) return null;
    let el = startEl;
    for(let i=0;i<6 && el;i++){
      if(el.querySelector){
        let btn = el.querySelector('[data-like-btn]');
        if(btn && el !== document.body && el !== document.getElementById('feed')){
          let media = el.classList && (el.classList.contains('postMedia') || el.classList.contains('post')) ? el : null;
          if(media) return { postId: String(btn.getAttribute('data-like-btn')), mediaEl: media };
        }
      }
      el = el.parentElement;
    }
    let p = startEl.closest ? startEl.closest('.post, article, [class*="post"]') : null;
    if(p){
      let btn = p.querySelector('[data-like-btn]');
      if(btn) return { postId: String(btn.getAttribute('data-like-btn')), mediaEl: p.querySelector('.postMedia') || p };
    }
    return null;
  }
  document.addEventListener('touchend', function(e){
    if(!e.target || !e.target.closest) return;
    if(e.target.closest('[data-like-btn]')) return;
    if(e.target.closest('a, button, input')) return;
    let media = e.target.closest('img, video');
    if(!media) media = e.target.closest('.postMedia, .post');
    if(!media) return;
    let info = findPostInfo(media);
    if(!info) return;
    let now = Date.now();
    if(info.postId === _autoId && (now - _autoLast) < 500){
      _autoLast = 0; _autoId = '';
      let tx = window._pixLastTouchX || 0, ty = window._pixLastTouchY || 0;
      if(e.changedTouches && e.changedTouches[0]){ tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }
      console.log('❤️ AUTO DOUBLE TAP DA:', info.postId);
      pixoroDoubleTapLike(info.postId, info.mediaEl, { clientX: tx, clientY: ty });
      _lastTapTime = 0; _lastTapId = '';
    } else {
      _autoLast = now; _autoId = info.postId;
    }
  }, {passive:true});
  document.addEventListener('dblclick', function(e){
    if(!e.target || !e.target.closest) return;
    if(e.target.closest('[data-like-btn]')) return;
    let media = e.target.closest('img, video, .postMedia');
    if(!media) return;
    let info = findPostInfo(media);
    if(!info) return;
    pixoroDoubleTapLike(info.postId, info.mediaEl, e);
    _lastTapTime = 0; _lastTapId = '';
  });
})();

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
