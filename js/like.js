/* =====================================================
   PIXORO LIKE SYSTEM V28 - PIXORO STYLE COLOUR
   Naduvula Heart - White Illa da - Pixoro Gradient da
   V27 Speed Logic Apdiye da - Local Muthalla, Server Apram Silent ah
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V28) return;
  window.PIXORO_LIKE_V28 = true;
  window.PIXORO_LIKE_V22 = true;
  window.PIXORO_LIKE_V23 = true;
  window.PIXORO_LIKE_V24 = true;
  window.PIXORO_LIKE_V25 = true;
  window.PIXORO_LIKE_V26 = true;
  window.PIXORO_LIKE_V27 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 280;

  const lastTap = new WeakMap();
  const serverQueue = new Set();

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
    button.style.opacity = "1";
    button.style.color = liked ? "#FF0A33" : "";
    const icon = button.querySelector("i, svg, span") || button;
    if (icon.tagName === "I") {
      icon.classList.toggle("active", liked);
      icon.style.opacity = "1";
    }
    const svg = button.querySelector("svg");
    const path = button.querySelector("path");
    if(svg){ svg.style.opacity = "1"; svg.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important'); }
    if(path){ path.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important'); path.style.setProperty('stroke', liked ? '#FF0A33' : '#fff', 'important'); }
  }

  function paintCount(postId, count, post) {
    const countElement = getLikeCount(postId, post);
    if (countElement) {
      countElement.textContent = Number(count) || 0;
    }
  }

  function pixoroThudikku(btn){
    if(!btn) return;
    btn.classList.remove('thudikku');
    void btn.offsetWidth;
    btn.classList.add('thudikku');
    setTimeout(()=> btn.classList.remove('thudikku'), 850);
  }

  function addHeartStyles() {
    if (document.getElementById("pixoro-like-v28-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-like-v28-css";
    style.textContent = `
      @keyframes pixThudikku{
        0%{ transform:scale(1); }
        40%{ transform:scale(1.35); }
        70%{ transform:scale(0.95); }
        100%{ transform:scale(1); }
      }
      [data-like-btn].thudikku svg, .like-btn.thudikku svg, .like-button.thudikku svg,
      [data-like-btn].thudikku i, .like-btn.thudikku i{ animation:pixThudikku 0.8s ease-in-out 1 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color: #FF0A33 !important; opacity:1 !important; }
      [data-like-btn], .like-btn, .like-button { opacity:1 !important; }
      .postMedia, .post-media, .post-media-wrap, .post-content, .post, .post-card { position:relative !important; }
    `;
    document.head.appendChild(style);
  }

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
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    if(typeof tapX === 'number' && typeof tapY === 'number' && tapX > 0 && tapY > 0){
      cx = tapX - rect.left;
      cy = tapY - rect.top;
      cx = Math.max(35, Math.min(rect.width - 35, cx));
      cy = Math.max(35, Math.min(rect.height - 35, cy));
    }
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = 'position:absolute !important;z-index:99 !important;pointer-events:none !important;left:'+cx+'px !important;top:'+cy+'px !important;width:56px !important;height:56px !important;opacity:1 !important;transform:translate(-50%,-50%) scale(0.2);background:transparent !important;display:block !important;';
    // ✅ V28 FIX - Naduvula Heart White Illa da - Pixoro Gradient da
    // Pink #FF2E63 -> Red #FF0A33 -> Purple #A855F7 + White Border da
    heart.innerHTML = '<svg viewBox="0 0 24 24" style="width:100% !important;height:100% !important;display:block !important;filter:drop-shadow(0 8px 20px rgba(255,10,51,.55))"><defs><linearGradient id="pixoroGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF2E63"/><stop offset="50%" stop-color="#FF0A33"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs><path fill="url(#pixoroGrad)" stroke="#ffffff" stroke-width="1.2" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    container.appendChild(heart);
    let t = 0;
    let anim = setInterval(()=>{
      t += 30;
      let scale = 0.2;
      if(t < 150) scale = 0.2 + (t / 150) * 1.0;
      else if(t < 300) scale = 1.2 - ((t - 150) / 150) * 0.25;
      else if(t < 450) scale = 0.95 + ((t - 300) / 150) * 0.15;
      else if(t < 600) scale = 1.1 - ((t - 450) / 150) * 0.1;
      else scale = 1;
      heart.style.transform = 'translate(-50%,-50%) scale('+scale+')';
      heart.style.opacity = '1';
      if(t >= 750){ clearInterval(anim); }
    }, 30);
    setTimeout(()=>{
      heart.style.transition = 'opacity 0.2s';
      heart.style.opacity = '0';
      setTimeout(()=>{ heart.remove(); }, 250);
    }, 750);
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
        if(r.error && String(r.error.code) !== '23505') throw r.error;
      } else {
        let r = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId);
        if(r.error) throw r.error;
      }
      try{
        let { count } = await supa.from(TABLE).select("*", { count: "exact", head: true }).eq("post_id", postId);
        if(count !== null && count !== undefined){
          window.FEED_COUNTS[String(postId)] = count;
          pixoroSaveLocal();
          let post = document.querySelector(`[data-post-id="${postId}"]`) || document.querySelector('.post');
          if(post) paintCount(postId, count, post);
        }
      }catch(e){}
    }catch(e){
      console.log('LIKE SERVER SILENT FAIL DA - LOCAL LA IRUKKU DA:', e.message);
    } finally {
      serverQueue.delete(key);
    }
  }

  function toggleLike(postId, post, forceLike = false) {
    if (!postId) return false;
    let isLiked = window.FEED_LIKES.has(String(postId));
    let willLike = forceLike ? true : !isLiked;
    if(forceLike && isLiked){
      paintLike(postId, true, post);
      return true;
    }
    paintLike(postId, willLike, post);
    if(willLike) window.FEED_LIKES.add(String(postId));
    else window.FEED_LIKES.delete(String(postId));
    let cEl = getLikeCount(postId, post);
    let cur = cEl ? (parseInt(cEl.textContent || '0', 10) || 0) : (window.FEED_COUNTS[String(postId)] || 0);
    let newCount = Math.max(0, cur + (willLike ? 1 : -1));
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
    const post = getPostElement(button);
    const postId = button.dataset.likeBtn || button.dataset.postId || post?.dataset.postId || post?.dataset.id;
    if (!postId) return;
    pixoroThudikku(button);
    toggleLike(postId, post, false);
  });

  async function loadMyLikes() {
    const userId = await getUserId();
    if (!userId){
      document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
        const postId = post.dataset.postId || post.dataset.id;
        if (!postId) return;
        paintLike(postId, window.FEED_LIKES.has(String(postId)), post);
        if(window.FEED_COUNTS[String(postId)] !== undefined) paintCount(postId, window.FEED_COUNTS[String(postId)], post);
      });
      return;
    }
    document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
      const postId = post.dataset.postId || post.dataset.id;
      if (!postId) return;
      paintLike(postId, window.FEED_LIKES.has(String(postId)), post);
    });
    try{
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
      if (error) return;
      window.FEED_LIKES.clear();
      (data || []).forEach(item => window.FEED_LIKES.add(String(item.post_id)));
      pixoroSaveLocal();
      document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
        const postId = post.dataset.postId || post.dataset.id;
        if (!postId) return;
        paintLike(postId, window.FEED_LIKES.has(String(postId)), post);
      });
    }catch(e){}
  }

  window.pixoroToggleLike = toggleLike;
  window.pixoroFeedTap = function (postId, element, ev) { return false; };
  window.showBigHeart = showBigHeart;
  window.pixoroPaintAllLikes = function(){
    document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
      const postId = post.dataset.postId || post.dataset.id;
      if (!postId) return;
      paintLike(postId, window.FEED_LIKES.has(String(postId)), post);
    });
  };

  addHeartStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMyLikes);
  } else {
    loadMyLikes();
  }
  window.addEventListener("pixoro:login", loadMyLikes);
  console.log("PIXORO Like V28 loaded successfully.");
})();
