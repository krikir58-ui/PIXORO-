// ===== PIXORO LIKE - FINAL V6 - HEART BURST DA =====
console.log('✅ LIKE FILE LOADED DA - V6 HEART BURST');

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
    pixoroDoubleTapLike(postId, el, ev);
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
  document.getElementById('pixoro-like-css')?.remove();
  document.getElementById('pixoro-like-css-v2')?.remove();
  document.getElementById('pixoro-like-css-v3')?.remove();
  document.getElementById('pixoro-like-css-v4')?.remove();
  document.getElementById('pixoro-like-css-v5')?.remove();
  document.getElementById('pixoro-like-css-v6')?.remove();
  let s = document.createElement('style');
  s.id = 'pixoro-like-css-v6';
  s.innerText = `
    [data-like-btn]{ -webkit-tap-highlight-color:transparent !important; touch-action:manipulation !important; user-select:none !important; -webkit-user-select:none !important; background:transparent !important; border:none !important; outline:none !important; cursor:pointer !important; }
    [data-like-btn]:active{ opacity:1 !important; transform:none !important; background:transparent !important; }
    [data-like-btn] svg{ overflow:visible !important; display:block !important; width:24px !important; height:24px !important; }
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
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
  let tapX = 0, tapY = 0;
  if(ev){
    if(ev.touches && ev.touches[0]){ tapX = ev.touches[0].clientX; tapY = ev.touches[0].clientY; }
    else if(ev.changedTouches && ev.changedTouches[0]){ tapX = ev.changedTouches[0].clientX; tapY = ev.changedTouches[0].clientY; }
    else { tapX = ev.clientX || 0; tapY = ev.clientY || 0; }
  }
  showBigHeart(mediaEl, tapX, tapY);
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
  if(!mediaEl) return;
  let box = null;
  try{ if(mediaEl.closest) box = mediaEl.closest('.postMedia') || mediaEl.closest('.post'); }catch(e){}
  if(!box) box = mediaEl.parentElement || mediaEl;
  if(!box) return;
  box.querySelectorAll('.bigHeart').forEach(h=>h.remove());
  box.querySelectorAll('.pixMiniHeart').forEach(h=>h.remove());
  box.querySelectorAll('.pixBurstDot').forEach(h=>h.remove());
  let cs = window.getComputedStyle(box);
  if(cs.position === 'static') box.style.position = 'relative';
  let r = box.getBoundingClientRect();
  let x = r.width/2, y = r.height/2;
  if(tapX && tapY){
    x = Math.max(70, Math.min(r.width-70, tapX - r.left));
    y = Math.max(70, Math.min(r.height-70, tapY - r.top));
  }

  // ✅ 1. HEART BURST - PERIYA WHITE HEART
  let div = document.createElement('div');
  div.className = 'bigHeart';
  div.style.cssText = 'position:absolute;z-index:99;pointer-events:none;width:100px;height:100px;left:'+x+'px;top:'+y+'px;opacity:0;';
  div.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 4px 14px rgba(0,0,0,.5))"><path fill="#fff" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  box.appendChild(div);
  try{
    div.animate([
      { opacity:0, transform:'translate(-50%,-50%) scale(0) rotate(0deg)' },
      { opacity:1, transform:'translate(-50%,-50%) scale(1.4) rotate(-10deg)' },
      { opacity:1, transform:'translate(-50%,-50%) scale(1.1) rotate(8deg)' },
      { opacity:1, transform:'translate(-50%,-50%) scale(1.15) rotate(-5deg)' },
      { opacity:1, transform:'translate(-50%,-50%) scale(1) rotate(0deg)' },
      { opacity:0, transform:'translate(-50%,-50%) scale(1.3) rotate(0deg)' }
    ], { duration:850, easing:'ease-out' }).onfinish = ()=> div.remove();
  }catch(e){ div.remove(); }
  setTimeout(()=>div.remove(), 900);

  // ✅ 2. HEART BURST - 10 COLOUR HEARTS VEDIYUM DA
  let colors = ['#FF0A33','#FF4D8D','#FF8A00','#FF2E9A','#FFD500','#00E5FF','#7C4DFF','#FF6B6B'];
  for(let i=0;i<10;i++){
    let s = document.createElement('div');
    s.className = 'pixMiniHeart';
    let col = colors[i % colors.length];
    let sz = 18 + Math.random()*18;
    s.style.cssText = 'position:absolute;z-index:98;pointer-events:none;width:'+sz+'px;height:'+sz+'px;left:'+x+'px;top:'+y+'px;opacity:1;';
    s.innerHTML = '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><path fill="'+col+'" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    box.appendChild(s);
    let ang = (i/10)*Math.PI*2 + Math.random()*0.4;
    let dist = 100 + Math.random()*60;
    let dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist - 30;
    try{
      s.animate([
        { opacity:1, transform:'translate(-50%,-50%) scale(0) rotate(0deg)' },
        { opacity:1, transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) scale(1.2) rotate('+(Math.random()*50-25)+'deg)' },
        { opacity:0, transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+(dy-70)+'px)) scale(0.7) rotate(0deg)' }
      ], { duration:850, easing:'ease-out', delay:30 }).onfinish = ()=> s.remove();
    }catch(e){ s.remove(); }
    setTimeout(()=>s.remove(), 950);
  }

  // ✅ 3. BURST DOTS - Chinna chinna dots vedikkum da
  for(let i=0;i<8;i++){
    let d = document.createElement('div');
    d.className = 'pixBurstDot';
    let col = colors[i % colors.length];
    d.style.cssText = 'position:absolute;z-index:97;pointer-events:none;width:6px;height:6px;border-radius:50%;background:'+col+';left:'+x+'px;top:'+y+'px;';
    box.appendChild(d);
    let ang = Math.random()*Math.PI*2;
    let dist = 60 + Math.random()*70;
    let dx = Math.cos(ang)*dist, dy = Math.sin(ang)*dist;
    try{
      d.animate([
        { opacity:1, transform:'translate(-50%,-50%) scale(1)' },
        { opacity:0, transform:'translate(calc(-50% + '+dx+'px), calc(-50% + '+dy+'px)) scale(0)' }
      ], { duration:700, easing:'ease-out' }).onfinish = ()=> d.remove();
    }catch(e){ d.remove(); }
    setTimeout(()=>d.remove(), 750);
  }
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
