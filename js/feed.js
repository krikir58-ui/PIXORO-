// ✅ CORRECTED DA - 400ms - Phone la Double Tap ku Time kuduthom da
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

// ✅ CORRECTED DA - Heart ah Photo Box kulla podu da
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
