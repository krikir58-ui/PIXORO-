/* =====================================================
   PIXORO LIKE SYSTEM V39
   Single Tap Photo = Onnum Illa
   Double Tap = Touch Panna Edathula Irundhu Heart Killa Poi Maraiyum
   Like Button = Killa Irundhu Heart + Heart Thudikkum
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V39) return;
  window.PIXORO_LIKE_V39 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";

  const DOUBLE_TAP_DELAY = 320;
  const HEART_DURATION = 1000;

  const lastTap = new WeakMap();
  const lastToggleAt = new Map();
  const pending = new Map();

  let blockClickUntil = 0;
  let lastTouchTime = 0;

  // =========================================
  // LOCAL LIKE STORAGE
  // =========================================

  try {
    const saved = JSON.parse(localStorage.getItem("pixoro_likes") || "[]");
    window.FEED_LIKES = new Set(saved.map(String));
  } catch {
    window.FEED_LIKES = new Set();
  }

  try {
    window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts") || "{}");
  } catch {
    window.FEED_COUNTS = {};
  }

  function saveLocal() {
    try {
      localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES]));
      localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS));
    } catch (e) {
      console.warn("PIXORO local save error", e);
    }
  }

  // =========================================
  // USER
  // =========================================

  async function getUserId() {
    if (window.currentUser?.id) {
      return window.currentUser.id;
    }
    if (!supa) return null;
    const { data, error } = await supa.auth.getUser();
    if (error || !data?.user?.id) return null;
    return data.user.id;
  }

  // =========================================
  // POST ELEMENT
  // =========================================

  function getPost(element) {
    return element?.closest("[data-post-id], .post, .post-card, article, .post-item");
  }

  function getPostId(element) {
    const post = getPost(element);
    return (
      element?.dataset?.postId ||
      element?.dataset?.likeBtn ||
      post?.dataset?.postId ||
      post?.dataset?.id ||
      null
    );
  }

  function getLikeButton(post) {
    if (!post) return null;
    return post.querySelector("[data-like-btn], .like-btn, .like-button, [data-action='like']");
  }

  function getLikeCount(post) {
    if (!post) return null;
    return post.querySelector("[data-like-count], .like-count, .likes-count, [data-count='likes']");
  }

  // =========================================
  // LIKE UI - Number Perusa Agathu da
  // =========================================

  function paintLike(post, liked) {
    const button = getLikeButton(post);
    if (!button) return;
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.dataset.liked = liked ? "true" : "false";
    button.style.setProperty("color", liked ? "#FF3040" : "", "important");
    button.querySelectorAll("svg, i, path").forEach(el => {
      if (el.tagName === "SVG" || el.tagName === "PATH") {
        el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
        el.style.setProperty("stroke", liked ? "#FF3040" : "", "important");
      }
      if (el.tagName === "I") {
        el.style.setProperty("color", liked ? "#FF3040" : "", "important");
      }
    });
  }

  function paintCount(post, count) {
    const el = getLikeCount(post);
    if (el) {
      el.textContent = Math.max(0, Number(count) || 0);
      el.style.transform = "none";
      el.style.animation = "none";
    }
  }

  // =========================================
  // ✅ CORRECT - TOUCH PANNA EDATHULA IRUNDHU HEART
  // Dance Illa da - Mella Killa Poi Maraithu Pogum da - Size 62 da
  // =========================================

  function showBigHeart(media, touchX, touchY) {
    if (!media) return;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    document.querySelectorAll('.pixoro-big-heart, .pixoro-tap-heart').forEach(h => h.remove());
    const startX = (typeof touchX === 'number' ? touchX : rect.left + rect.width / 2);
    const startY = (typeof touchY === 'number' ? touchY : rect.top + rect.height / 2);
    const gid = 'pixoroGrad' + Date.now();
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${startX}px;
      top:${startY}px;
      width:62px;
      height:62px;
      opacity:0;
      transform:translate(-50%,-50%) scale(0);
    `;
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 8px 20px rgba(0,0,0,.45))">
        <defs>
          <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF0A33"/>
            <stop offset="30%" stop-color="#FF3DF0"/>
            <stop offset="60%" stop-color="#A259FF"/>
            <stop offset="85%" stop-color="#FF8A00"/>
            <stop offset="100%" stop-color="#FFD600"/>
          </linearGradient>
        </defs>
        <path fill="url(#${gid})" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
        <path fill="#fff" opacity="0.95"
          d="M12 18.5L6.8 13.3a3.8 3.8 0 0 1 0-5.4 3.8 3.8 0 0 1 5.2 0L12 8l0-0.1a3.8 3.8 0 0 1 5.2 0 3.8 3.8 0 0 1 0 5.4L12 18.5z"
          transform="translate(0,-1.2) scale(0.62) translate(7.4,7.4)"/>
        <ellipse cx="8.5" cy="8" rx="1.6" ry="1" fill="#fff" opacity="0.85" transform="rotate(-20 8.5 8)"/>
      </svg>
    `;
    document.body.appendChild(heart);
    const animation = heart.animate([
      { transform: "translate(-50%,-50%) scale(0)", opacity: 0, offset: 0 },
      { transform: "translate(-50%,-50%) scale(1.2)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%,-30%) scale(1.05)", opacity: 1, offset: 0.5 },
      { transform: "translate(-50%,20%) scale(1)", opacity: 0.5, offset: 0.8 },
      { transform: "translate(-50%,70%) scale(0.9)", opacity: 0, offset: 1 }
    ], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    animation.onfinish = () => heart.remove();
    setTimeout(()=>{ try{heart.remove()}catch(e){} }, 1100);
  }

  // ✅ Display Touch Heart Full ah Remove da
  function showTapHeart(x, y) { return; }
  function showMassDance(media) { return; }

  // =========================================
  // ✅ CORRECT 2 - KILLA IRUNDHU HEART PARAKKUM DA
  // =========================================

  function showButtonHeart(button) {
    if (!button) return;
    const r = button.getBoundingClientRect();
    const gid = 'pixoroBtn' + Date.now();
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${r.left + r.width / 2}px;
      top:${r.top}px;
      width:42px;
      height:42px;
      opacity:0;
      transform:translate(-50%,-50%) scale(0);
    `;
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))">
        <defs>
          <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF0A33"/>
            <stop offset="50%" stop-color="#FF3DF0"/>
            <stop offset="100%" stop-color="#FF8A00"/>
          </linearGradient>
        </defs>
        <path fill="url(#${gid})" stroke="#fff" stroke-width="1.2"
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>
    `;
    document.body.appendChild(heart);
    const a = heart.animate([
      { transform: "translate(-50%,-50%) scale(0)", opacity: 0, offset: 0 },
      { transform: "translate(-50%,-50%) scale(1.2)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%,-90%) scale(1)", opacity: 1, offset: 0.6 },
      { transform: "translate(-50%,-180%) scale(0.9)", opacity: 0, offset: 1 }
    ], { duration: 700, easing: "ease-out", fill: "forwards" });
    a.onfinish = () => heart.remove();
    setTimeout(()=>{ try{heart.remove()}catch(e){} }, 800);
  }

  // =========================================
  // ✅ CORRECT 3 - KILLA HEART THUDIKKUM POTHU MARAIKATHU DA
  // Opacity Full 1 Thaan da - Scale Mattum da
  // =========================================

  function buttonAnimation(post) {
    const button = getLikeButton(post);
    if (!button) return;
    const icon = button.querySelector("svg, i");
    if (!icon) return;
    icon.style.opacity = "1";
    icon.classList.remove("pixoro-thudikku");
    void icon.offsetWidth;
    icon.classList.add("pixoro-thudikku");
    setTimeout(() => {
      icon.classList.remove("pixoro-thudikku");
      icon.style.opacity = "1";
      icon.style.transform = "scale(1)";
    }, 350);
  }

  // =========================================
  // SUPABASE SAVE
  // =========================================

  async function serverSave(postId, liked) {
    if (!supa) return false;
    const userId = await getUserId();
    if (!userId) return false;
    try {
      if (liked) {
        const { error } = await supa.from(TABLE).insert({ post_id: postId, user_id: userId });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId);
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error("PIXORO LIKE ERROR:", error);
      return false;
    }
  }

  // =========================================
  // MAIN LIKE FUNCTION
  // =========================================

  function toggleLike(postId, post, forceLike = false) {
    if (!postId || !post) return false;
    postId = String(postId);
    const now = Date.now();
    const previous = lastToggleAt.get(postId) || 0;
    if (!forceLike && now - previous < 300) {
      return window.FEED_LIKES.has(postId);
    }
    lastToggleAt.set(postId, now);
    const alreadyLiked = window.FEED_LIKES.has(postId);
    const willLike = forceLike ? true : !alreadyLiked;
    if (forceLike && alreadyLiked) {
      paintLike(post, true);
      const current = Number(window.FEED_COUNTS[postId] || 0);
      if (current < 1) {
        window.FEED_COUNTS[postId] = 1;
        saveLocal();
      }
      paintCount(post, Math.max(1, current));
      return true;
    }
    let countElement = getLikeCount(post);
    let oldCount = Number(window.FEED_COUNTS[postId] ?? countElement?.textContent ?? 0);
    let newCount = willLike ? oldCount + 1 : Math.max(0, oldCount - 1);
    if (willLike) window.FEED_LIKES.add(postId);
    else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = newCount;
    paintLike(post, willLike);
    paintCount(post, newCount);
    saveLocal();
    const previousSave = pending.get(postId) || Promise.resolve();
    const nextSave = previousSave.catch(() => {}).then(() => serverSave(postId, willLike));
    pending.set(postId, nextSave);
    nextSave.finally(() => {
      if (pending.get(postId) === nextSave) pending.delete(postId);
    });
    return willLike;
  }

  // =========================================
  // MEDIA DETECTION
  // =========================================

  function findMedia(element) {
    if (!element?.closest) return null;
    return element.closest(".postMedia, .post-media, .post-media-wrap, .post-content img, .post-content video, img, video");
  }

  // =========================================
  // ✅ DOUBLE TAP - Touch Panna Edathula Irundhu Heart
  // =========================================

  function handleDoubleTap(media, postId, post, x, y) {
    blockClickUntil = Date.now() + 700;
    showBigHeart(media, x, y);
    buttonAnimation(post);
    toggleLike(postId, post, true);
  }

  // =========================================
  // MOBILE TOUCH - Single Tap = Onnum Illa da
  // =========================================

  document.addEventListener("touchstart", event => {
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const media = findMedia(event.target);
    if (!media) return;
    const post = getPost(media);
    const postId = getPostId(media);
    if (!post || !postId) return;
    const now = Date.now();
    const previous = lastTap.get(media);
    const touchX = event.touches && event.touches[0] ? event.touches[0].clientX : null;
    const touchY = event.touches && event.touches[0] ? event.touches[0].clientY : null;
    lastTap.set(media, { time: now, x: touchX, y: touchY });
    // ✅ Single Tap la Heart Illa da
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY) {
      lastTap.delete(media);
      lastTouchTime = now;
      handleDoubleTap(media, postId, post, touchX, touchY);
    }
  }, { passive: true });

  // =========================================
  // LAPTOP DOUBLE CLICK
  // =========================================

  document.addEventListener("dblclick", event => {
    if (Date.now() - lastTouchTime < 800) return;
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const media = findMedia(event.target);
    if (!media) return;
    const post = getPost(media);
    const postId = getPostId(media);
    if (!post || !postId) return;
    event.preventDefault();
    handleDoubleTap(media, postId, post, event.clientX, event.clientY);
  });

  // =========================================
  // LAPTOP SINGLE CLICK - Photo Click la Onnum Illa da
  // =========================================

  document.addEventListener("click", event => {
    // ✅ Photo Click la Heart Illa da
    return;
  }, true);

  // =========================================
  // NORMAL LIKE BUTTON CLICK - Killa Heart Parakkum da
  // =========================================

  document.addEventListener("click", event => {
    if (Date.now() < blockClickUntil) {
      const media = findMedia(event.target);
      if (media) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button, [data-action='like']");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const post = getPost(button);
    const postId = getPostId(button);
    if (!post || !postId) return;
    // ✅ Killa Button la Irundhu Heart Mela Parakkum da
    showButtonHeart(button);
    buttonAnimation(post);
    toggleLike(postId, post, false);
  }, true);

  // =========================================
  // PAINT ALL POSTS
  // =========================================

  function paintAll() {
    document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach(post => {
      const postId = String(post.dataset.postId || post.dataset.id || "");
      if (!postId) return;
      const liked = window.FEED_LIKES.has(postId);
      paintLike(post, liked);
      const count = Number(window.FEED_COUNTS[postId] ?? getLikeCount(post)?.textContent ?? 0);
      paintCount(post, count);
    });
  }

  // =========================================
  // LOAD SERVER LIKES
  // =========================================

  async function loadMyLikes() {
    paintAll();
    const userId = await getUserId();
    if (!userId || !supa) return;
    try {
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
      if (error) throw error;
      const serverLikes = new Set((data || []).map(item => String(item.post_id)));
      window.FEED_LIKES = serverLikes;
      saveLocal();
      paintAll();
    } catch (error) {
      console.error("PIXORO LOAD LIKES:", error);
    }
  }

  // =========================================
  // DYNAMIC FEED WATCHER
  // =========================================

  function startWatchman() {
    if (window.PIXORO_WATCHMAN_ON) return;
    window.PIXORO_WATCHMAN_ON = true;
    let timer;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(paintAll, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // =========================================
  // CSS - Heart Thudikkum Pothu Opacity Maraikathu da
  // =========================================

  function addStyles() {
    if (document.getElementById("pixoro-v39-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-v39-css";
    style.textContent = `
      .pixoro-thudikku { animation: pixoroButtonPop .35s ease; display:inline-block; transform-box: fill-box; transform-origin: center; opacity:1 !important; }
      @keyframes pixoroButtonPop {
        0% { transform:scale(1); opacity:1; }
        40% { transform:scale(1.3); opacity:1; }
        100% { transform:scale(1); opacity:1; }
      }
      .like-btn, .like-button { transform:none !important; animation:none !important; }
      .like-btn svg, .like-button svg { transform-origin: center !important; flex-shrink: 0 !important; opacity:1 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color:#FF3040 !important; }
      .like-btn.liked svg, .like-button.liked svg { fill:#FF3040 !important; }
      .pixoro-big-heart { pointer-events:none !important; }
      [data-like-count], .like-count, .likes-count { transform:none !important; animation:none !important; flex-shrink: 0 !important; }
      .pixoro-tap-heart { display:none !important; opacity:0 !important; }
    `;
    document.head.appendChild(style);
  }

  // =========================================
  // PUBLIC API
  // =========================================

  window.pixoroToggleLike = toggleLike;
  window.pixoroPaintAllLikes = paintAll;
  window.showBigHeart = showBigHeart;
  window.pixoroTapHeart = showTapHeart;
  window.pixoroMassDance = showMassDance;

  // =========================================
  // START
  // =========================================

  function start() {
    addStyles();
    paintAll();
    loadMyLikes();
    startWatchman();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.addEventListener("pixoro:login", loadMyLikes);

  console.log("PIXORO LIKE V39 LOADED ❤️");

})();
