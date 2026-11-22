// ===== PIXORO LIKE - v1046 - THANI CODE DA - FEED AH THODATHE DA =====
// RULE: pixoroFeedTap - INGA MATTUM THAAN DA - feed.js la itha thodathe da
//       Double Tap = Like ONLY + 3 RED Hearts da - Unlike aagaathu da
//       Button Thotta = Like / Unlike da
//       DB Fail aana kooda RED ah irukkum da!

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

// ✅ FIX 1 - PaintAll - Count ah Paakkaathe da - Phone la Save pannathu thaan Unmai da
function pixoroPaintAllLikes(){
  let saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]');
  document.querySelectorAll('[data-like-btn]').forEach(btn=>{
    let pid = String(btn.getAttribute('data-like-btn'));
    let shouldLike = saved.includes(pid) || (window.FEED_LIKES && window.FEED_LIKES.has(pid));
    pixoroPaintLikeBtn(btn, shouldLike);
  });
}

// ❌ FIX 2 - MutationObserver ah FULL AH THOOKITEN DA - Ithu thaan Like ah Kolluthu da
// Inime Feed Vanthathum - Feed thaan pixoroPaintAllLikes() ah Koopidum da - Observer Illa da

async function pixoroToggleLike(postId, btn){
  let willLike = btn ? !btn.classList.contains('liked') : true;
  pixoroPaintLikeBtn(btn, willLike);
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = willLike ? cur+1 : Math.max(0,cur-1); }
  if(window.FEED_LIKES){ willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }

  // ✅ Phone la Save - Refresh pannalum RED ah irukkum da
  let saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]');
  if(willLike){ if(!saved.includes(String(postId))) saved.push(String(postId)); }
  else { saved = saved.filter(id=>String(id)!==String(postId)); }
  localStorage.setItem('pixoro_likes', JSON.stringify(saved));

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return willLike;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else { location.href='./login.html'; return; } }
  try{
    if(willLike){ 
      let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
      if(r.error) throw r.error;
    }
    else { 
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
  let c = document.querySelector(`[data-like-count="${postId}"]`);
  if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = cur+1; }
  if(window.FEED_LIKES) window.FEED_LIKES.add(String(postId));
  let saved = JSON.parse(localStorage.getItem('pixoro_likes')||'[]');
  if(!saved.includes(String(postId))){ saved.push(String(postId)); localStorage.setItem('pixoro_likes', JSON.stringify(saved)); }

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return true;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return; }
  try{
    let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
    if(r.error) throw r.error;
    return true;
  }catch(e){ console.log('❌ DOUBLE TAP DB FAIL DA:', e.message); return true; }
}

function showBigHeart(mediaEl){
  if(!mediaEl) return;
  mediaEl.querySelectorAll('.bigHeart').forEach(h=>h.remove());
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
window.pixoroPaintLikeBtn = pixoroPaintLikeBtn;
window.pixoroPaintAllLikes = pixoroPaintAllLikes;
