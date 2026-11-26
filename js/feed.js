/* =====================================================
   PIXORO LIKE SYSTEM V39 - FINAL - YARUM VAIKKATHA STYLE
   Double Tap = Killa Heart 1 Time Thudikkum + Marupadium Thudikkum + Maraiyathu
   Naduvula Heart = Chinna Size 48px - Number Perusa Aagathu
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
  // LIKE UI - Box Illa da - Maraiyathu da
  // =========================================

  function paintLike(post, liked) {
    const button = getLikeButton(post);
    if (!button) return;
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.dataset.liked = liked ? "true" : "false";
    button.style.setProperty("color", liked ? "#FF3040" : "", "important");
    button.style.setProperty("background", "transparent", "important");
    button.style.setProperty("border", "none", "important");
    button.style.setProperty("box-shadow", "none", "important");
    button.style.setProperty("outline", "none", "important");
    button.style.setProperty("overflow", "visible", "important");
    button.style.setProperty("opacity", "1", "important");
    button.style.setProperty("visibility", "visible", "important");
    button.querySelectorAll("svg, i, path").forEach(el => {
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("visibility", "visible", "important");
      el.style.setProperty("overflow", "visible", "important");
      if (el.tagName === "SVG" || el.tagName === "PATH") {
        el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
        el.style.setProperty("stroke", liked ? "#FF3040" : "", "important");
      }
      if (el.tagName === "I") {
        el.style.setProperty("color", liked ? "#FF3040" : "", "important");
      }
    });
  }

  // ✅ Number Perusa Aagathu da
  function paintCount(post, count) {
    const el = getLikeCount(post);
    if (el) {
      el.textContent = Math.max(0, Number(count) || 0);
      el.style.transform = "none";
      el.style.animation = "none";
      el.style.fontSize = "14px";
      el.style.lineHeight = "1";
      el.style.display = "inline-block";
      el.style.opacity = "1";
    }
  }

  // =========================================
  // ✅ YARUM VAIKKATHA STYLE DA
  // Pambu Mari Pogathu da - Orey Edathula Nikkum da
  // Thudikkum + Ring Viriyum + Sparkles Sitharum da
  // =========================================

  function showBigHeart(media, touchX, touchY) {
    if (!media) return;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const startX = (typeof touchX === 'number' && touchX > 0 ? touchX : rect.left + rect.width / 2);
    const startY = (typeof touchY === 'number' && touchY > 0 ? touchY : rect.top + rect.height / 2);
    const gid = 'pixoroGrad' + Date.now() + Math.floor(Math.random()*10000);

    // ✅ Ring - Yarum Vaikkala da
    const ring = document.createElement("div");
    ring.className = "pixoro-big-heart";
    ring.style.cssText = `position:fixed;z-index:999998;pointer-events:none;left:${startX}px;top:${startY}px;width:20px;height:20px;transform:translate(-50%,-50%);border:3px solid #FF3DF0;border-radius:50%;opacity:0.9;background:transparent;`;
    document.body.appendChild(ring);
    ring.animate([
      { transform: "translate(-50%,-50%) scale(0.5)", opacity: 0.9 },
      { transform: "translate(-50%,-50%) scale(4.5)", opacity: 0 }
    ], { duration: 700, easing: "ease-out", fill: "forwards" });
    setTimeout(()=>{ try{ring.remove()}catch(e){} }, 750);

    // ✅ Sparkles - 6 Chinna Hearts Sitharum da
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("div");
      s.className = "pixoro-big-heart";
      const angle = (i / 6) * Math.PI * 2;
      const dx = Math.cos(angle) * 45;
      const dy = Math.sin(angle) * 45;
      s.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${startX}px;top:${startY}px;width:13px;height:13px;transform:translate(-50%,-50%);opacity:1;`;
      s.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%"><path fill="#FF3DF0" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
      document.body.appendChild(s);
      s.animate([
        { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(calc(-50% + ${dx * 1.4}px), calc(-50% + ${dy * 1.4}px)) scale(0)`, opacity: 0 }
      ], { duration: 800, easing: "ease-out", fill: "forwards" });
      setTimeout(()=>{ try{s.remove()}catch(e){} }, 850);
    }

    // ✅ FIX - Naduvula Heart Chinna Size da - 60px -> 48px da
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${startX}px;
      top:${startY}px;
      width:48px;
      height:48px;
      opacity:0;
      transform:translate(-50%,-50%) scale(0);
      background:transparent !important;
      border:none !important;
      box-shadow:none !important;
    `;
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:100%;height:100%;background:transparent;filter:drop-shadow(0 0 18px rgba(255,61,240,.8))">
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
      { transform: "translate(-50%,-50%) scale(1.45)", opacity: 1, offset: 0.15 },
      { transform: "translate(-50%,-50%) scale(1.0)", opacity: 1, offset: 0.30 },
      { transform: "translate(-50%,-50%) scale(1.30)", opacity: 1, offset: 0.45 },
      { transform: "translate(-50%,-50%) scale(1.05)", opacity: 1, offset: 0.60 },
      { transform: "translate(-50%,-50%) scale(1.18)", opacity: 1, offset: 0.75 },
      { transform: "translate(-50%,-50%) scale(1.1)", opacity: 0, offset: 1 }
    ], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    animation.onfinish = () => heart.remove();
    setTimeout(()=>{ try{heart.remove()}catch(e){} }, 1100);
  }

  function showTapHeart(x, y) { return; }
  function showMassDance(media) { return; }

  // =========================================
  // ✅ KILLA IRUNDHU HEART PARAKKUM DA
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
      background:transparent !important;
      border:none !important;
    `;
    heart.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:100%;height:100%;background:transparent;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))">
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
  // ✅ FIX - KILLA HEART 1 TIME THUDIKKUM DA
  // Double Click Panna 1 Time - Marupadium Double Click Panna Marupadium 1 Time
  // CSS Class Illa da - Direct animate() da - Maraiyathu da
  // =========================================

  function buttonAnimation(post) {
    const button = getLikeButton(post);
    if (!button) return;
    button.style.setProperty("overflow", "visible", "important");
    button.style.setProperty("opacity", "1", "important");
    button.style.setProperty("visibility", "visible", "important");
    const icon = button.querySelector("svg, i, img, span");
    if (!icon) return;
    icon.style.setProperty("opacity", "1", "important");
    icon.style.setProperty("visibility", "visible", "important");
    icon.style.setProperty("overflow", "visible", "important");
    try { icon.getAnimations().forEach(a => a.cancel()); } catch(e) {}
    icon.animate([
      { transform: "scale(1)", opacity: 1, offset: 0 },
      { transform: "scale(1.5)", opacity: 1, offset: 0.2 },
      { transform: "scale(0.9)", opacity: 1, offset: 0.4 },
      { transform: "scale(1.35)", opacity: 1, offset: 0.6 },
      { transform: "scale(0.95)", opacity: 1, offset: 0.8 },
      { transform: "scale(1)", opacity: 1, offset: 1 }
    ], { duration: 600, easing: "ease-out", fill: "forwards" });
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
  // ✅ DOUBLE TAP
  // =========================================

  function handleDoubleTap(media, postId, post, x, y) {
    blockClickUntil = Date.now() + 700;
    showBigHeart(media, x, y);
    buttonAnimation(post);
    toggleLike(postId, post, true);
    setTimeout(() => paintLike(post, true), 50);
  }

  // =========================================
  // MOBILE TOUCH
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
  // LAPTOP SINGLE CLICK
  // =========================================

  document.addEventListener("click", event => {
    return;
  }, true);

  // =========================================
  // NORMAL LIKE BUTTON CLICK
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
  // CSS - Killa Heart Maraiyathu da - Overflow Visible da
  // =========================================

  function addStyles() {
    if (document.getElementById("pixoro-v39-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-v39-css";
    style.textContent = `
      .like-btn, .like-button, [data-like-btn] { background:transparent !important; border:none !important; outline:none !important; box-shadow:none !important; padding:0 !important; overflow:visible !important; opacity:1 !important; visibility:visible !important; }
      .like-btn svg, .like-button svg, [data-like-btn] svg { background:transparent !important; border:none !important; box-shadow:none !important; outline:none !important; transform-origin: center !important; flex-shrink: 0 !important; opacity:1 !important; visibility:visible !important; overflow:visible !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color:#FF3040 !important; background:transparent !important; }
      .like-btn.liked svg, .like-button.liked svg { fill:#FF3040 !important; }
      .pixoro-big-heart { pointer-events:none !important; background:transparent !important; border:none !important; box-shadow:none !important; }
      [data-like-count], .like-count, .likes-count { transform:none !important; animation:none !important; flex-shrink: 0 !important; background:transparent !important; border:none !important; font-size:14px !important; line-height:1 !important; }
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
