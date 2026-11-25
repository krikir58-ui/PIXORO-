/* =====================================================
   PIXORO LIKE SYSTEM V36 - TAP POINT FIX
   Enga Double Click Pannuromo Anga Thaan Heart Varum da - Mela Poyi Marayum da
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V36) return;
  window.PIXORO_LIKE_V36 = true;
  window.PIXORO_LIKE_V35 = true;
  window.PIXORO_LIKE_V34 = true;
  window.PIXORO_LIKE_V33 = true;
  window.PIXORO_LIKE_V30 = true;
  window.PIXORO_LIKE_V29 = true;
  window.PIXORO_LIKE_V28 = true;
  window.PIXORO_LIKE_V27 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 280;

  const lastTap = new WeakMap();
  const serverQueue = new Set();
  const lastToggleAt = new Map();

  try{
    let local = JSON.parse(localStorage.getItem('pixoro_likes') || '[]');
    window.FEED_LIKES = new Set(local.map(String));
  }catch(e){ window.FEED_LIKES = new Set(); }
  if(!window.FEED_COUNTS) {
    try{ window.FEED_COUNTS = JSON.parse(localStorage.getItem('pixoro_counts') || '{}'); }catch(e){ window.FEED_COUNTS = {}; }
  }

  function pixoroSaveLocal(){
    try{ localStorage.setItem('pixoro_likes', JSON.stringify([...window.FEED_LIKES])); }catch(e){}
    try{ localStorage.setItem('pixoro_counts', JSON.stringify(window.FEED_COUNTS || {})); }catch(e){}
  }

  if (!supa) {
    console.error("PIXORO: Supabase client not found.");
    return;
  }

  async function getUserId() {
    if (window.currentUser?.id) return window.currentUser.id;
    const { data, error } = await supa.auth.getUser();
    if (error || !data?.user?.id) return null;
    return data.user.id;
  }

  function getPostElement(element) {
    if(!element || !element.closest) return null;
    return element.closest("[data-post-id], .post, .post-card, article, .post-item");
  }

  function getPostId(element) {
    const post = getPostElement(element);
    return (
      element.dataset?.postId ||
      post?.dataset.postId ||
      post?.dataset.id ||
      element.closest?.("[data-post-id]")?.dataset.postId ||
      null
    );
  }

  function getLikeButton(postId, post) {
    if (!post) return null;
    return (
      post.querySelector(`[data-like-btn="${postId}"]`) ||
      post.querySelector(".like-btn") ||
      post.querySelector(".like-button") ||
      post.querySelector('[data-action="like"]')
    );
  }

  function getLikeCount(postId, post) {
    if (!post) return null;
    return (
      post.querySelector(`[data-like-count="${postId}"]`) ||
      post.querySelector(".like-count") ||
      post.querySelector(".likes-count") ||
      post.querySelector('[data-count="likes"]')
    );
  }

  function paintLike(postId, liked, post) {
    const button = getLikeButton(postId, post);
    if (!button) return;
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.setAttribute("data-liked", liked ? "1" : "0");
    button.style.opacity = "1";
    button.style.setProperty('color', liked ? '#FF0A33' : '#ffffff', 'important');
    button.querySelectorAll("i, svg, path, span").forEach((el)=>{
      el.style.setProperty('opacity', '1', 'important');
      if(el.tagName === "I"){
        el.classList.toggle("active", liked);
        el.style.setProperty('color', liked ? '#FF0A33' : '#ffffff', 'important');
      }
      if(el.tagName === "SVG"){
        el.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important');
        el.style.setProperty('color', liked ? '#FF0A33' : '#ffffff', 'important');
      }
      if(el.tagName === "PATH"){
        el.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important');
        el.style.setProperty('stroke', liked ? '#FF0A33' : '#ffffff', 'important');
      }
    });
  }

  function paintCount(postId, count, post) {
    const countElement = getLikeCount(postId, post);
    if (countElement) {
      countElement.textContent = Number(count) || 0;
    }
  }

  function pixoroPaintAll(){
    document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
      const postId = post.dataset.postId || post.dataset.id;
      if (!postId) return;
      let liked = window.FEED_LIKES.has(String(postId));
      paintLike(postId, liked, post);
      if(liked){
        let saved = window.FEED_COUNTS[String(postId)];
        if(saved === undefined || Number(saved) < 1){
          window.FEED_COUNTS[String(postId)] = 1;
          pixoroSaveLocal();
          saved = 1;
        }
        paintCount(postId, saved, post);
      } else if(window.FEED_COUNTS[String(postId)] !== undefined){
        paintCount(postId, window.FEED_COUNTS[String(postId)], post);
      }
    });
  }

  function pixoroThudikku(btn){
    if(!btn) return;
    btn.classList.remove('thudikku');
    void btn.offsetWidth;
    btn.classList.add('thudikku');
    setTimeout(()=> btn.classList.remove('thudikku'), 400);
  }

  function addHeartStyles() {
    if (document.getElementById("pixoro-like-v36-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-like-v36-css";
    style.textContent = `
      @keyframes pixThudikku{
        0%{ transform:scale(1); }
        40%{ transform:scale(1.12); }
        70%{ transform:scale(0.98); }
        100%{ transform:scale(1); }
      }
      [data-like-btn], .like-btn, .like-button { overflow: visible !important; }
      [data-like-btn] svg, .like-btn svg, .like-button svg, [data-like-btn] i, .like-btn i { overflow: visible !important; transform-origin: center center !important; }
      [data-like-btn].thudikku, .like-btn.thudikku, .like-button.thudikku { animation:none !important; transform:none !important; }
      [data-like-btn].thudikku svg, .like-btn.thudikku svg, .like-button.thudikku svg,
      [data-like-btn].thudikku i, .like-btn.thudikku i { animation:pixThudikku 0.4s ease-in-out 1 !important; transform-origin:center center !important; }
      .like-count, .likes-count, [data-like-count] { transform:none !important; animation:none !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked,
      .like-btn.liked i, .like-button.liked i, .like-btn.liked svg, .like-button.liked svg,
      .like-btn.liked path, .like-button.liked path { color: #FF0A33 !important; fill: #FF0A33 !important; stroke: #FF0A33 !important; opacity:1 !important; }
      [data-like-btn], .like-btn, .like-button { opacity:1 !important; }
      .postMedia, .post-media, .post-media-wrap, .post-content, .post, .post-card { position:relative !important; }
    `;
    document.head.appendChild(style);
  }

  // ✅ V36 MAIN FIX - Instagram Mari - Tap Panna Edathula Ye Heart da - Mela Poyi Marayum da
  function showBigHeart(media, tapX, tapY) {
    if (!media) return;
    document.querySelectorAll('.pixoro-big-heart').forEach(h=>h.remove());
    let container = media.closest ? (media.closest('.postMedia') || media.closest('.post-media') || media.closest('.post-media-wrap') || media.closest('.post') || media.closest('.post-card') || media.closest('article')) : null;
    if(!container) container = media;
    if(!container) return;
    let cs = window.getComputedStyle(container);
    if(cs.position === 'static') container.style.position = 'relative';
    container.style.overflow = 'hidden';
    let rect = container.getBoundingClientRect();
    // ✅ Tap Panna Exact Edam da - Naduvula Illa da - X + Y Rendum Tap Edam da
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    if(typeof tapX === 'number' && tapX > 0 && typeof tapY === 'number' && tapY > 0){
      cx = tapX - rect.left;
      cy = tapY - rect.top;
      cx = Math.max(55, Math.min(rect.width - 55, cx));
      cy = Math.max(55, Math.min(rect.height - 55, cy));
    }
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = 'position:absolute !important;z-index:99 !important;pointer-events:none !important;left:'+cx+'px !important;top:'+cy+'px !important;width:92px !important;height:92px !important;opacity:0 !important;transform:translate(-50%,-50%) scale(0);background:transparent !important;display:block !important;';
    heart.innerHTML = '<svg viewBox="0 0 24 24" style="width:100% !important;height:100% !important;display:block !important;filter:drop-shadow(0 10px 22px rgba(255,10,51,.55))"><defs><linearGradient id="pixoroGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF2E63"/><stop offset="50%" stop-color="#FF0A33"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs><path fill="url(#pixoroGrad)" stroke="#ffffff" stroke-width="1.2" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    container.appendChild(heart);
    // ✅ Instagram Dance - Tap Edathula Pop Aagi - Mela Poyi Marayum da - Keezha Pogaathu da
    try{
      let anim = heart.animate([
        { transform: 'translate(-50%,-50%) scale(0)', opacity: 0, offset: 0 },
        { transform: 'translate(-50%,-50%) scale(1.25)', opacity: 1, offset: 0.18 },
        { transform: 'translate(-50%,-50%) scale(0.92)', opacity: 1, offset: 0.30 },
        { transform: 'translate(-50%,-50%) scale(1.05)', opacity: 1, offset: 0.42 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.55 },
        { transform: 'translate(-52%,-85px) scale(1.02)', opacity: 1, offset: 0.70 },
        { transform: 'translate(-48%,-130px) scale(0.98)', opacity: 0.85, offset: 0.85 },
        { transform: 'translate(-50%,-170px) scale(0.85)', opacity: 0, offset: 1 }
      ], { duration: 1000, easing: 'cubic-bezier(.2,.8,.3,1.2)', fill: 'forwards' });
      anim.onfinish = ()=>{ heart.remove(); };
    }catch(e){
      setTimeout(()=>{ heart.remove(); }, 1000);
    }
    setTimeout(()=>{ try{ heart.remove(); }catch(e){} }, 1200);
  }

  async function pixoroServerSave(postId, willLike){
    let key = postId + ':' + (willLike ? '1' : '0');
    if(serverQueue.has(key)) return;
    serverQueue.add(key);
    try{
      const userId = await getUserId();
      if(!userId) return;
      if(willLike){
        let r = await supa.from(TABLE).insert({ post_id: postId, user_id: userId });
        if(r.error){
          console.log('PIXORO LIKE SERVER ERROR DA:', r.error.message, r.error.code);
          if(String(r.error.code) !== '23505') throw r.error;
        }
      } else {
        let r = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId);
        if(r.error) throw r.error;
      }
    }catch(e){
      console.log('LIKE SERVER SILENT FAIL DA - LOCAL LA IRUKKU DA:', e.message);
    } finally {
      serverQueue.delete(key);
    }
  }

  function toggleLike(postId, post, forceLike = false) {
    if (!postId) return false;
    let nowMs = Date.now();
    let lastMs = lastToggleAt.get(String(postId)) || 0;
    if(!forceLike && nowMs - lastMs < 300) return window.FEED_LIKES.has(String(postId));
    lastToggleAt.set(String(postId), nowMs);
    let isLiked = window.FEED_LIKES.has(String(postId));
    let willLike = forceLike ? true : !isLiked;
    if(forceLike && isLiked){
      paintLike(postId, true, post);
      if(window.FEED_COUNTS[String(postId)] === undefined || Number(window.FEED_COUNTS[String(postId)]) < 1){
        window.FEED_COUNTS[String(postId)] = 1;
        pixoroSaveLocal();
      }
      paintCount(postId, window.FEED_COUNTS[String(postId)], post);
      return true;
    }
    paintLike(postId, willLike, post);
    if(willLike) window.FEED_LIKES.add(String(postId));
    else window.FEED_LIKES.delete(String(postId));
    let domCount = 0;
    let cEl = getLikeCount(postId, post);
    if(cEl) domCount = parseInt(cEl.textContent || '0', 10) || 0;
    let localCount = window.FEED_COUNTS[String(postId)];
    let base = (localCount !== undefined) ? Number(localCount) : domCount;
    let newCount = willLike ? (base + 1) : Math.max(0, base - 1);
    if(willLike && newCount < 1) newCount = 1;
    window.FEED_COUNTS[String(postId)] = newCount;
    paintCount(postId, newCount, post);
    pixoroSaveLocal();
    pixoroServerSave(postId, willLike);
    return willLike;
  }

  function findMedia(element) {
    if(!element || !element.closest) return null;
    return element.closest(".postMedia, .post-media, .post-media-wrap, .post-content, img, video");
  }

  document.addEventListener("pointerup", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const media = findMedia(event.target);
    if (!media) return;
    const post = getPostElement(media);
    const postId = getPostId(media);
    if (!post || !postId) return;
    const now = Date.now();
    const previous = lastTap.get(media);
    const currentTap = { time: now, x: event.clientX, y: event.clientY };
    lastTap.set(media, currentTap);
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 45) {
      lastTap.delete(media);
      showBigHeart(media, event.clientX, event.clientY);
      const btn = getLikeButton(postId, post);
      if(btn) pixoroThudikku(btn);
      toggleLike(postId, post, true);
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button, [data-action='like']");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const post = getPostElement(button);
    const postId = button.dataset.likeBtn || button.dataset.postId || post?.dataset.postId || post?.dataset.id;
    if (!postId) return;
    pixoroThudikku(button);
    toggleLike(postId, post, false);
  }, true);

  async function loadMyLikes() {
    const userId = await getUserId();
    pixoroPaintAll();
    if (!userId) return;
    try{
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
      if (error) return;
      (data || []).forEach(item => window.FEED_LIKES.add(String(item.post_id)));
      pixoroSaveLocal();
      pixoroPaintAll();
    }catch(e){}
  }

  function startWatchman(){
    if(window.PIXORO_WATCHMAN_ON) return;
    window.PIXORO_WATCHMAN_ON = true;
    let timer = null;
    let obs = new MutationObserver(()=>{
      if(timer) clearTimeout(timer);
      timer = setTimeout(()=> pixoroPaintAll(), 100);
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(()=> pixoroPaintAll(), 1000);
  }

  window.pixoroToggleLike = toggleLike;
  window.pixoroFeedTap = function (postId, element, ev) { return false; };
  window.showBigHeart = showBigHeart;
  window.pixoroPaintAllLikes = pixoroPaintAll;

  addHeartStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ()=>{ loadMyLikes(); startWatchman(); });
  } else {
    loadMyLikes();
    startWatchman();
  }
  window.addEventListener("pixoro:login", loadMyLikes);
  console.log("PIXORO Like V36 loaded successfully.");
})();
