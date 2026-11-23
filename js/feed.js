// ✅ CORRECTED DA - FINAL - Ithu mattum pothum da
let _lastTapId = null;
let _lastTapTime = 0;
let _singleTapTimer = null;

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

async function pixoroDoubleTapLike(postId, el){
  let mediaEl = el ? (el.querySelector('img,video') || el) : null;
  showBigHeart(mediaEl);
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return;
  if(btn) btn.classList.add('liked');
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c) c.innerText = (parseInt(c.innerText||'0')+1);
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return;
  try{
    let {data:{session}} = await s.auth.getSession();
    if(!session) return;
    await s.from('likes').insert({ post_id: postId, user_id: session.user.id });
  }catch(e){}
}
window.pixoroDoubleTapLike = pixoroDoubleTapLike;

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
  setTimeout(()=>div.remove(), 600);
}
