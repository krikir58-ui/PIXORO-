// ===== PIXORO LIKE - v1042 - THANI FILE DA - RED HEART + 3 HEARTS DA =====
// RULE: pixoroFeedTap - INGA MATTUM THAAN DA - feed.js la itha thodathe da
//       Double Tap = Like ONLY + 3 RED Hearts da - Unlike aagaathu da
//       Button Thotta = Like / Unlike da
//       Like pannala na WHITE da - Like panna mattum RED da

let _lastTapTime = 0, _lastTapId = '', _singleTapTimer = null;

// ✅ 0. TOUCH DOUBLE TAP - Mobile la ondblclick work aagathu da - Ithu thaan work aagum da
window.pixoroFeedTap = function(postId, el, ev){
  if(ev) ev.preventDefault();
  let now = Date.now();

  // ✅ DOUBLE TAP CHECK DA - 300ms kulla 2nd tap na Double da
  if(postId === String(_lastTapId) && (now - _lastTapTime) < 300){
    _lastTapTime = 0;
    if(_singleTapTimer){ clearTimeout(_singleTapTimer); _singleTapTimer = null; }
    pixoroDoubleTapLike(postId, el);
    return;
  }

  _lastTapTime = now; _lastTapId = String(postId);
  // Single Tap na - 300ms wait pannu da - Double varutha nu paakalam da
  if(_singleTapTimer) clearTimeout(_singleTapTimer);
  _singleTapTimer = setTimeout(()=>{
    // Double varala na mattum - Video va Play/Pause pannu da
    let vid = el ? el.querySelector('video') : null;
    if(vid){ vid.paused ? vid.play().catch(()=>{}) : vid.pause(); }
  }, 310);
};

// 1. LIKE BUTTON - Thotta Like / Thotta Unlike da
async function pixoroToggleLike(postId, btn){
  let willLike = btn ? !btn.classList.contains('liked') : true;
  if(btn) btn.classList.toggle('liked', willLike);
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = willLike ? cur+1 : Math.max(0,cur-1); }
  if(window.FEED_LIKES){ willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return; }
  try{
    if(willLike){ await s.from('likes').insert({post_id:postId, user_id:window.ME_ID}); }
    else { await s.from('likes').delete().eq('post_id',postId).eq('user_id',window.ME_ID); }
    return willLike;
  }catch(e){
    if(btn) btn.classList.toggle('liked', !willLike);
    if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = willLike ? Math.max(0,cur-1) : cur+1; }
    return false;
  }
}

// 2. DOUBLE TAP - Photo va 2 thadava thotta - Like ONLY da, Unlike aagaathu da
async function pixoroDoubleTapLike(postId, mediaEl){
  // Heart eppovum kaatu da - Like irunthalum illanalum da
  showBigHeart(mediaEl);

  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;

  if(btn) btn.classList.add('liked');
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = cur+1; }
  if(window.FEED_LIKES) window.FEED_LIKES.add(String(postId));

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return; }
  try{
    await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
    return true;
  }catch(e){ return false; }
}

// 3. BIG HEARTS - 2,3 MARI DA - 3 RED Hearts Vanthu Mela Parakkum da
function showBigHeart(mediaEl){
  if(!mediaEl) return;
  mediaEl.querySelectorAll('.bigHeart').forEach(h=>h.remove());

  // ✅ NEE KETTA MARI - 1 Perusu naduvula + 2 Chinnathu pakkathula - ELLAM RED da
  let spots = [
    { left:'50%', top:'52%', size:95, delay:0 },
    { left:'36%', top:'60%', size:60, delay:130 },
    { left:'65%', top:'58%', size:56, delay:260 },
  ];

  spots.forEach((sp, i)=>{
    let div = document.createElement('div');
    div.className = 'bigHeart';
    div.style.left = sp.left;
    div.style.top = sp.top;
    div.style.width = sp.size + 'px';
    div.style.height = sp.size + 'px';
    div.style.animationDelay = sp.delay + 'ms';
    // ✅ RED ONLY DA - Pink Gradient illa da - #FF0A33 thaan da
    div.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#FF0A33" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    mediaEl.appendChild(div);
    void div.offsetWidth;
    div.classList.add('show');
    setTimeout(()=>div.remove(), 1450 + sp.delay);
  });
}

window.pixoroToggleLike = pixoroToggleLike;
window.pixoroDoubleTapLike = pixoroDoubleTapLike;
window.showBigHeart = showBigHeart;
