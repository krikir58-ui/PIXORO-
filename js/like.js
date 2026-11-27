/* =====================================================
   PIXORO LIKE V62 FINAL
   INSTAGRAM STYLE DOUBLE TAP HEART - CENTER DANCE
   LIKE / UNLIKE / SUPABASE SYNC
   PHOTO + VIDEO + REELS
   ===================================================== */

(() => {
  "use strict";
  if (window.PIXORO_LIKE_V62) return;
  window.PIXORO_LIKE_V62 = true;

  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 350;
  const HEART_DURATION = 1000;
  const lastTap = new Map();
  const lastToggleAt = new Map();
  const pending = new Map();
  let suppressMediaClickUntil = 0;

  function getSupa() {
    return window.supa || window.supabaseClient || (typeof window.getSupa === "function" ? window.getSupa() : null);
  }
  async function getUserId() {
    if (window.ME_ID) return window.ME_ID;
    const supa = getSupa(); if (!supa) return null;
    try { const { data } = await supa.auth.getSession(); return data?.session?.user?.id || null; } catch { return null; }
  }

  try { window.FEED_LIKES = new Set(JSON.parse(localStorage.getItem("pixoro_likes") || "[]").map(String)); } catch { window.FEED_LIKES = new Set(); }
  try { window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts") || "{}"); } catch { window.FEED_COUNTS = {}; }
  function saveLocal() {
    try { localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES])); localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS)); } catch(e){}
  }

  function getPost(element) { return element?.closest("[data-post-id]"); }
  function getPostId(element) {
    const post = getPost(element);
    return String(element?.dataset?.postId || post?.dataset?.postId || post?.dataset?.id || "");
  }
  function getLikeButton(post) { return post?.querySelector("[data-like-btn], .like-btn, .like-button"); }
  function getLikeCount(post) { return post?.querySelector("[data-like-count], .like-count, .likes-count, [data-count='likes'], .rCount"); }
  function findMedia(element) {
    if (!element?.closest) return null;
    return element.closest(".postMedia, .post-media, .post-media-wrap") || element.closest("[data-post-id]");
  }

  function paintLike(post, liked) {
    const button = getLikeButton(post); if (!button) return;
    button.classList.toggle("liked", liked); button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked)); button.dataset.liked = String(liked);
    button.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    button.querySelectorAll("svg, svg path, i").forEach(el => {
      if (el.tagName === "SVG" || el.tagName === "PATH") {
        el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
        el.style.setProperty("stroke", liked ? "#FF3040" : "#fff", "important");
      }
      if (el.tagName === "I") el.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    });
  }
  function paintCount(post, count) { const el = getLikeCount(post); if (!el) return; el.textContent = Math.max(0, Number(count) || 0); }

  /* ✅ V62 FIX - BIG HEART DANCE DA - Center la - Left Right Dance da - Emoji Illa da - Gradient Mattum da */
  function showBigHeart(media, x, y) {
    if (!media) return;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // ✅ V62 FIX - Tap Panna Edathula Illa da - Center la Thaan da
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${startX}px;top:${startY}px;width:110px;height:110px;transform:translate(-50%,-50%) scale(0);opacity:0;display:block;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 0 18px rgba(255,45,149,.8))"><defs><linearGradient id="pixoroHeartV62"><stop offset="0%" stop-color="#FF1744"/><stop offset="50%" stop-color="#FF3DF0"/><stop offset="100%" stop-color="#FF8A00"/></linearGradient></defs><path fill="url(#pixoroHeartV62)" stroke="#fff" stroke-width=".5" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    const anim = heart.animate([
      { transform: "translate(-50%,-50%) scale(0) rotate(-15deg)", opacity: 0 },
      { transform: "translate(-50%,-55%) scale(1.35) rotate(10deg)", opacity: 1, offset: 0.15 },
      { transform: "translate(-50%,-50%) scale(1) rotate(-8deg)", opacity: 1, offset: 0.3 },
      { transform: "translate(-48%,-52%) scale(1.2) rotate(6deg)", opacity: 1, offset: 0.45 },
      { transform: "translate(-52%,-48%) scale(1.05) rotate(-5deg)", opacity: 1, offset: 0.6 },
      { transform: "translate(-50%,-50%) scale(1.15) rotate(3deg)", opacity: 1, offset: 0.75 },
      { transform: "translate(-50%,-60%) scale(1.45) rotate(0deg)", opacity: 0 }
    ], { duration: HEART_DURATION, easing: "cubic-bezier(.2,.9,.3,1.4)", fill: "forwards" });
    anim.onfinish = () => heart.remove();
  }
  window.pixoroShowHeartDance = (media) => showBigHeart(media);
  window.showBigHeart = showBigHeart;

  function buttonAnimation(post) {
    const button = getLikeButton(post); if (!button) return;
    const icon = button.querySelector("svg, i, img, span"); if (!icon) return;
    try { icon.getAnimations().forEach(a => a.cancel()); } catch(e){}
    icon.animate([{ transform: "scale(1)" },{ transform: "scale(1.45)", offset: .3 },{ transform: "scale(.9)", offset: .55 },{ transform: "scale(1.15)", offset: .75 },{ transform: "scale(1)" }], { duration: 450, easing: "ease-out" });
  }
  /* ✅ V62 FIX - Emoji Heart ah Full Delete Panniten da - Gradient Heart Mattum da */

  async function serverSave(postId, liked) {
    const supa = getSupa(); if (!supa) return;
    const userId = await getUserId(); if (!userId) return;
    try {
      if (liked) { const { error } = await supa.from(TABLE).upsert({ post_id: postId, user_id: userId }, { onConflict: "post_id,user_id" }); if (error) throw error; }
      else { const { error } = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId); if (error) throw error; }
    } catch (error) { console.error("PIXORO LIKE SAVE:", error); }
  }

  function toggleLike(postId, post, forceLike = false) {
    if (!postId || !post) return false;
    postId = String(postId);
    const now = Date.now(); const previous = lastToggleAt.get(postId) || 0;
    if (!forceLike && now - previous < 300) return window.FEED_LIKES.has(postId);
    lastToggleAt.set(postId, now);
    const alreadyLiked = window.FEED_LIKES.has(postId);
    const willLike = forceLike ? true : !alreadyLiked;
    if (forceLike && alreadyLiked) { paintLike(post, true); return true; }
    const countEl = getLikeCount(post);
    const oldCount = window.FEED_COUNTS[postId] !== undefined ? Number(window.FEED_COUNTS[postId]) : Number(countEl?.textContent || 0);
    const newCount = willLike ? oldCount + 1 : Math.max(0, oldCount - 1);
    if (willLike) window.FEED_LIKES.add(postId); else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = newCount; saveLocal();
    paintLike(post, willLike); paintCount(post, newCount);
    const previousRequest = pending.get(postId) || Promise.resolve();
    const nextRequest = previousRequest.catch(()=>{}).then(() => serverSave(postId, willLike));
    pending.set(postId, nextRequest);
    nextRequest.finally(() => { if (pending.get(postId) === nextRequest) pending.delete(postId); });
    return willLike;
  }
  window.pixoroDoLike = (postId, btn) => { const post = btn?.closest("[data-post-id]"); return toggleLike(postId, post, false); };
  window.likePost = window.pixoroDoLike;

  function handleDoubleTap(media, postId, post, x, y) {
    suppressMediaClickUntil = Date.now() + 450;
    showBigHeart(media || post, x, y);
    buttonAnimation(post);
    toggleLike(postId, post, true);
  }

  document.addEventListener("pointerdown", event => {
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const post = getPost(event.target); if (!post) return;
    const postId = getPostId(event.target); if (!postId) return;
    const media = findMedia(event.target); if (!media) return;
    const now = Date.now(); const previous = lastTap.get(postId);
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY) {
      lastTap.delete(postId);
      handleDoubleTap(media, postId, post, event.clientX, event.clientY);
    } else { lastTap.set(postId, { time: now, x: event.clientX, y: event.clientY }); }
  }, true);

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button");
    if (button) {
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      const post = getPost(button); const postId = getPostId(button); if (!post || !postId) return;
      const wasLiked = window.FEED_LIKES.has(String(postId));
      if (!wasLiked) { /* ✅ Emoji Illa da - Button Dance Mattum da */ }
      buttonAnimation(post); toggleLike(postId, post, false); return;
    }
    if (Date.now() < suppressMediaClickUntil && event.target.closest(".postMedia, .post-media, .post-media-wrap")) {
      event.preventDefault(); event.stopPropagation();
    }
  }, true);

  function paintAll() {
    document.querySelectorAll("[data-post-id]").forEach(post => {
      const postId = String(post.dataset.postId || post.dataset.id || ""); if (!postId) return;
      const liked = window.FEED_LIKES.has(postId); paintLike(post, liked);
      if (window.FEED_COUNTS[postId] !== undefined) paintCount(post, window.FEED_COUNTS[postId]);
    });
  }

  async function loadMyLikes() {
    paintAll();
    const supa = getSupa(); const userId = await getUserId(); if (!supa || !userId) return;
    try {
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
      if (error) throw error;
      window.FEED_LIKES = new Set((data || []).map(item => String(item.post_id)));
      // ✅ V62 FIX - Count ku N+1 Query Illa da - Feed la Varra likes_count Thaan Use Pannurom da
      saveLocal(); paintAll();
    } catch (error) { console.error("PIXORO LOAD LIKES:", error); }
  }

  function addStyles() {
    const old = document.getElementById("pixoro-like-v62-css"); if (old) old.remove();
    const style = document.createElement("style"); style.id = "pixoro-like-v62-css";
    style.textContent = `
      .like-btn, .like-button, [data-like-btn] { background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; overflow: visible !important; visibility: visible !important; }
      .like-btn svg, .like-button svg, [data-like-btn] svg { transform-origin: center !important; flex-shrink: 0 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color: #FF3040 !important; }
      .like-btn.liked svg, .like-button.liked svg, [data-like-btn].liked svg { fill: #FF3040 !important; stroke: #FF3040 !important; }
      .like-btn:not(.liked) svg, .like-btn:not(.liked) svg path, .like-button:not(.liked) svg path { fill: none !important; stroke: #fff !important; }
      .pixoro-big-heart { pointer-events: none !important; background: transparent !important; border: none !important; box-shadow: none !important; }
      [data-like-count], .like-count, .likes-count { flex-shrink: 0 !important; }
    `;
    document.head.appendChild(style);
  }

  window.pixoroToggleLike = toggleLike;
  window.pixoroPaintAllLikes = paintAll;
  window.addEventListener("pixoro-feed-rendered", () => setTimeout(paintAll, 50));
  window.addEventListener("pixoro-reels-rendered", () => setTimeout(paintAll, 50));
  window.addEventListener("pixoro-supa-ready", () => setTimeout(loadMyLikes, 100));
  window.addEventListener("pixoro:login", loadMyLikes);

  function start() { addStyles(); paintAll(); loadMyLikes(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
  console.log("PIXORO LIKE V62 LOADED ❤️💃");
})();
