// ===== PIXORO LIKE - v1039 - THANI FILE DA - SPEED DA =====
// RULE: Double Tap = Like Only + Heart Pop
//       Button Thotta = Like / Unlike da
//       UI Munnadi - DB Appuram da - Speed da!

// ✅ 0. TOUCH DOUBLE TAP - Mobile la ondblclick work aagathu da - Ithu thaan work aagum da
let _lastTapTime = 0, _lastTapId = '';
window.pixoroFeedTap = function(postId, el, ev){
  let now = Date.now();
  if(postId === _lastTapId && (now - _lastTapTime) < 300){
    _lastTapTime = 0;
    pixoroDoubleTapLike(postId, el);
    if(ev) ev.preventDefault();
  } else {
    _lastTapTime = now; _lastTapId = postId;
    let vid = el.querySelector('video');
    if(vid) vid.paused ? vid.play() : vid.pause();
  }
};

// 1. LIKE BUTTON - Thotta Like / Thotta Unlike da
async function pixoroToggleLike(postId, btn){
  // ✅ SPEED - DB ku munnadiye UI ah maathidu da
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
    // DB fail aana mattum UI ah thirumba maathidu da
    if(btn) btn.classList.toggle('liked', !willLike);
    if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = willLike ? Math.max(0,cur-1) : cur+1; }
    return false;
  }
}

// 2. DOUBLE TAP - Photo va 2 thadava thotta - Like ONLY da, Unlike aagaathu da
async function pixoroDoubleTapLike(postId, mediaEl){
  // Heart eppovum kaatu da - Like irunthalum illanalum da
  showBigHeart(mediaEl);

  // ✅ SPEED - Already Like na - DB ku pogaathe da - Odane return da
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;

  // ✅ SPEED - Odane Red + Count +1 da - DB ku wait pannaathe da
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

// 3. BIG HEARTS - 2,3 MARI DA - 3 Hearts Vanthu Mela Parakkum da - Pixoro Mari da
function showBigHeart(mediaEl){
  if(!mediaEl) return;
  // Pazhaya Hearts iruntha delete pannidu da
  mediaEl.querySelectorAll('.bigHeart').forEach(h=>h.remove());

  // 2nd, 3rd photo mari - 1 Perusu naduvula + 2 Chinnathu pakkathula da
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
    let gid = 'pixHeart' + Date.now() + '_' + i;
    div.innerHTML = '<svg viewBox="0 0 24 24"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF5EA8"/><stop offset="55%" stop-color="#FF2DCC"/><stop offset="100%" stop-color="#A259FF"/></linearGradient></defs><path fill="url(#'+gid+')" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    mediaEl.appendChild(div);
    void div.offsetWidth;
    div.classList.add('show');
    setTimeout(()=>div.remove(), 1450 + sp.delay);
  });
}

window.pixoroToggleLike = pixoroToggleLike;
window.pixoroDoubleTapLike = pixoroDoubleTapLike;
window.showBigHeart = showBigHeart;
