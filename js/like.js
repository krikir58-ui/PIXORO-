// ===== PIXORO LIKE - THANI CODE DA =====
// RULE: Like = INGA MATTUM THAAN DA
//       Double Tap = Like ONLY + 3 Hearts da
//       Button = Like / Unlike da
//       Save = Server la mattum thaan da - LocalStorage Illa da

console.log('✅ LIKE FILE LOADED DA');

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

(function(){
  if(document.getElementById('pixoro-like-css')) return;
  let s = document.createElement('style');
  s.id = 'pixoro-like-css';
  s.innerText = `
    [data-like-btn] svg, [data-like-btn] svg path{ fill:none !important; stroke:#fff !important; }
    [data-like-btn].liked svg, [data-like-btn].liked svg path{ fill:#FF0A33 !important; stroke:#FF0A33 !important; }
    .bigHeart{ position:absolute !important; z-index:99 !important; pointer-events:none !important; opacity:0 !important; transform:translate(-50%,-50%) scale(0) !important; }
    .bigHeart.show{ opacity:1 !important; transform:translate(-50%,-50%) scale(1.1) !important; animation:pixLikeFly 1s ease forwards !important; }
    .bigHeart svg{ width:100% !important; height:100% !important; filter:drop-shadow(0 4px 12px rgba(0,0,0,.5)) !important; }
    @keyframes pixLikeFly{ 0%{opacity:0; transform:translate(-50%,-50%) scale(0)} 20%{opacity:1; transform:translate(-50%,-50%) scale(1.25)} 70%{opacity:1; transform:translate(-50%,-60%) scale(1)} 100%{opacity:0; transform:translate(-50%,-120%) scale(.9)} }
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

// ✅ Server la irunthu mattum thaan da - LocalStorage Paakka Koodathu da
function pixoroPaintAllLikes(){
  document.querySelectorAll('[data-like-btn]').forEach(btn=>{
    let pid = String(btn.getAttribute('data-like-btn'));
    let shouldLike = window.FEED_LIKES && window.FEED_LIKES.has(pid);
    pixoroPaintLikeBtn(btn, shouldLike);
  });
}

async function pixoroSyncRealCount(postId){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  try{
    let {count} = await s.from('likes').select('*',{count:'exact', head:true}).eq('post_id', postId);
    if(count !== null && count !== undefined){
      let c = document.querySelector(`[data-like-count="${postId}"]`);
      if(c) c.innerText = count;
    }
  }catch(e){}
}

async function pixoroToggleLike(postId, btn){
  console.log('❤️ LIKE CLICKED DA:', postId);
  if(!btn) btn = document.querySelector(`[data-like-btn="${postId}"]`);
  let willLike = btn ? !btn.classList.contains('liked') : true;
  let oldLiked = !willLike;
  // ✅ Optimistic ah Kaatu da - Aana Server Fail na Thookidu da
  pixoroPaintLikeBtn(btn, willLike);
  if(window.FEED_LIKES){ willLike ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return willLike;
  if(!window.ME_ID){ try{ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else { location.href='./login.html'; return; } }catch(e){ return willLike; } }
  try{
    if(willLike){
      let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
      if(r.error && String(r.error.code) !== '23505') throw r.error;
    } else {
      let r = await s.from('likes').delete().eq('post_id',postId).eq('user_id',window.ME_ID);
      if(r.error) throw r.error;
    }
    await pixoroSyncRealCount(postId);
    return willLike;
  }catch(e){
    console.log('❌ LIKE DB FAIL DA:', e.message);
    // ✅ Server la Save Aagala na - UI ah Pazhaya Nilamaikku Kondu Va da - Poi RED Kaatta Koodathu da
    pixoroPaintLikeBtn(btn, oldLiked);
    if(window.FEED_LIKES){ oldLiked ? window.FEED_LIKES.add(String(postId)) : window.FEED_LIKES.delete(String(postId)); }
    await pixoroSyncRealCount(postId);
    alert('Like Save Aagala da - Supabase likes Table la RLS Policy Paaru da!');
    return oldLiked;
  }
}

async function pixoroDoubleTapLike(postId, mediaEl){
  showBigHeart(mediaEl);
  let btn = document.querySelector(`[data-like-btn="${postId}"]`);
  if(btn && btn.classList.contains('liked')) return true;
  if(window.FEED_LIKES && window.FEED_LIKES.has(String(postId))) return true;
  if(btn) pixoroPaintLikeBtn(btn, true);
  if(window.FEED_LIKES) window.FEED_LIKES.add(String(postId));
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return true;
  if(!window.ME_ID){ try{ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return true; }catch(e){ return true; } }
  try{
    let r = await s.from('likes').insert({post_id:postId, user_id:window.ME_ID});
    if(r.error && String(r.error.code) !== '23505') throw r.error;
    await pixoroSyncRealCount(postId);
    return true;
  }catch(e){
    console.log('❌ DOUBLE TAP DB FAIL DA:', e.message);
    if(btn) pixoroPaintLikeBtn(btn, false);
    if(window.FEED_LIKES) window.FEED_LIKES.delete(String(postId));
    return true;
  }
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
    setTimeout(()=>{
      let div = document.createElement('div');
      div.className = 'bigHeart';
      div.style.left = sp.left; div.style.top = sp.top;
      div.style.width = sp.size + 'px'; div.style.height = sp.size + 'px';
      div.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#FF0A33" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
      mediaEl.appendChild(div);
      void div.offsetWidth;
      div.classList.add('show');
      setTimeout(()=>div.remove(), 1050);
    }, sp.delay);
  });
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
