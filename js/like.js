/* =====================================================
   PIXORO LIKE V70 FINAL - REELS MAARIYE DA 🔥❤️
   FEED = REELS - HEART MEDIA KULLA DA - BODY LA ILLA
   HEART 46px - SPEED 1000ms - LIKE=RED / UNLIKE=WHITE OUTLINE
   ===================================================== */

(() => {
  "use strict";
  if (window.PIXORO_LIKE_V70) return;
  window.PIXORO_LIKE_V70 = true;
  window.PIXORO_LIKE_V65 = true; window.PIXORO_LIKE_V66 = true; window.PIXORO_LIKE_V67 = true; window.PIXORO_LIKE_V68 = true; window.PIXORO_LIKE_V69 = true;

  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 300;
  const HEART_DURATION = 1000;
  const lastTap = new Map();
  const lastToggleAt = new Map();
  const pending = new Map();
  let suppressMediaClickUntil = 0;

  function getSupa() { return window.supa || window.supabaseClient || (typeof window.getSupa === "function" ? window.getSupa() : null); }
  async function getUserId() {
    if (window.ME_ID) return window.ME_ID;
    const supa = getSupa(); if (!supa) return null;
    try { const { data } = await supa.auth.getSession(); return data?.session?.user?.id || null; } catch { return null; }
  }

  try { window.FEED_LIKES = new Set(JSON.parse(localStorage.getItem("pixoro_likes") || "[]").map(String)); } catch { window.FEED_LIKES = new Set(); }
  try { window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts") || "{}"); } catch { window.FEED_COUNTS = {}; }
  function saveLocal() { try { localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES])); localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS)); } catch(e){} }

  function getPost(el) { return el?.closest("[data-post-id]"); }
  function getPostId(el) { const p = getPost(el); return String(el?.dataset?.postId || p?.dataset?.postId || p?.dataset?.id || ""); }
  function getLikeButton(post) { return post?.querySelector("[data-like-btn], .like-btn, .like-button"); }
  function getLikeCount(post) { return post?.querySelector("[data-like-count], .like-count, .likes-count, [data-count='likes'], .rCount"); }
  function findMedia(el) { if (!el?.closest) return null; return el.closest(".postMedia, .post-media, .post-media-wrap") || el.closest("[data-post-id]"); }

  function paintLike(post, liked) {
    const btn = getLikeButton(post); if (!btn) return;
    btn.classList.toggle("liked", liked);
    btn.classList.toggle("is-liked", liked);
    btn.classList.toggle("active", liked);
    btn.setAttribute("aria-pressed", String(liked));
    btn.dataset.liked = String(liked);
    btn.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    btn.querySelectorAll("svg, svg path, svg use, svg g").forEach(el => {
      el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
      el.style.setProperty("stroke", liked ? "#FF3040" : "#fff", "important");
      try { el.setAttribute("fill", liked ? "#FF3040" : "none"); el.setAttribute("stroke", liked ? "#FF3040" : "#fff"); } catch(e){}
    });
    btn.querySelectorAll("*").forEach(el => {
      el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
      el.style.setProperty("stroke", liked ? "#FF3040" : "#fff", "important");
    });
  }
  function paintCount(post, count) { const el = getLikeCount(post); if (!el) return; el.textContent = Math.max(0, Number(count) || 0); }

  /* ✅ V70 - REELS MAARI HEART DA - Media Kulla da - Body la Illa da */
  function showBigHeart(media, x, y) {
    if (!media) return;
    // ✅ Orey Heart da - Pazhaya Heart Irundha Delete da
    media.querySelectorAll(".pixoro-big-heart").forEach(el => el.remove());
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // ✅ Tap Panna Edam - Reels la Ippadi Thaan da
    const lx = (Number.isFinite(x) ? x : rect.left + rect.width / 2) - rect.left;
    const ly = (Number.isFinite(y) ? y : rect.top + rect.height / 2) - rect.top;
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    // ✅ 46px - Absolute - Media Kulla da
    heart.style.cssText = `position:absolute;z-index:99;pointer-events:none;left:${lx}px;top:${ly}px;width:46px;height:46px;transform:translate(-50%,-50%) scale(0);opacity:0;display:block;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 8px 18px rgba(255,45,149,.65))"><path fill="#FF2D95" stroke="#fff" stroke-width="0.6" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    if (getComputedStyle(media).position === "static") media.style.position = "relative";
    media.appendChild(heart);
    const anim = heart.animate([
      { transform: "translate(-50%,-50%) scale(0) rotate(-10deg)", opacity: 0 },
      { transform: "translate(-50%,-50%) scale(1.4) rotate(5deg)", opacity: 1, offset: 0.14 },
      { transform: "translate(-50%,-50%) scale(1) rotate(-3deg)", opacity: 1, offset: 0.24 },
      { transform: "translate(-50%,-50%) scale(1.08) rotate(2deg)", opacity: 1, offset: 0.35 },
      { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1, offset: 0.55 },
      { transform: "translate(-50%,-55%) scale(1) rotate(0deg)", opacity: 1, offset: 0.70 },
      { transform: "translate(-50%,-85%) scale(1) rotate(0deg)", opacity: 1, offset: 0.85 },
      { transform: "translate(-50%,-120%) scale(0.9) rotate(0deg)", opacity: 0 }
    ], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    anim.onfinish = () => heart.remove();
  }
  window.pixoroShowHeartDance = (media, x, y) => showBigHeart(media, x, y);
  window.showBigHeart = showBigHeart;

  function buttonAnimation(post) {
    const btn = getLikeButton(post); if (!btn) return;
    const icon = btn.querySelector("svg"); if (!icon) return;
    try { icon.getAnimations().forEach(a => a.cancel()); } catch(e){}
    icon.animate([{ transform: "scale(1)" },{ transform: "scale(1.5)", offset: .3 },{ transform: "scale(.9)", offset: .55 },{ transform: "scale(1.2)", offset: .75 },{ transform: "scale(1)" }], { duration: 400, easing: "ease-out" });
  }

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
    const now = Date.now(); const prev = lastToggleAt.get(postId) || 0;
    if (!forceLike && now - prev < 300) return window.FEED_LIKES.has(postId);
    lastToggleAt.set(postId, now);
    const already = window.FEED_LIKES.has(postId);
    const willLike = forceLike ? true : !already;
    if (forceLike && already) { paintLike(post, true); setTimeout(() => paintLike(post, true), 80); return true; }
    const countEl = getLikeCount(post);
    const oldCount = window.FEED_COUNTS[postId] !== undefined ? Number(window.FEED_COUNTS[postId]) : Number(countEl?.textContent || 0);
    const newCount = willLike ? oldCount + 1 : Math.max(0, oldCount - 1);
    if (willLike) window.FEED_LIKES.add(postId); else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = newCount; saveLocal();
    paintLike(post, willLike); paintCount(post, newCount);
    setTimeout(() => { paintLike(post, willLike); paintCount(post, newCount); }, 80);
    setTimeout(() => { paintLike(post, willLike); paintCount(post, newCount); }, 250);
    const prevReq = pending.get(postId) || Promise.resolve();
    const nextReq = prevReq.catch(()=>{}).then(() => serverSave(postId, willLike));
    pending.set(postId, nextReq);
    nextReq.finally(() => { if (pending.get(postId) === nextReq) pending.delete(postId); });
    return willLike;
  }

  window.pixoroDoLike = (postId, btn) => { const post = btn?.closest("[data-post-id]"); return toggleLike(postId, post, true); };
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
    const now = Date.now(); const prev = lastTap.get(postId);
    if (prev && now - prev.time <= DOUBLE_TAP_DELAY) { lastTap.delete(postId); handleDoubleTap(media, postId, post, event.clientX, event.clientY); }
    else { lastTap.set(postId, { time: now, x: event.clientX, y: event.clientY }); }
  }, true);

  document.addEventListener("click", event => {
    const btn = event.target.closest("[data-like-btn], .like-btn, .like-button");
    if (btn) {
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      const post = getPost(btn); const postId = getPostId(btn); if (!post || !postId) return;
      buttonAnimation(post);
      toggleLike(postId, post, false);
      return;
    }
    if (Date.now() < suppressMediaClickUntil && event.target.closest(".postMedia, .post-media, .post-media-wrap")) { event.preventDefault(); event.stopPropagation(); }
  }, true);

  function paintAll() {
    document.querySelectorAll("[data-post-id]").forEach(post => {
      const postId = String(post.dataset.postId || post.dataset.id || ""); if (!postId) return;
      paintLike(post, window.FEED_LIKES.has(postId));
      if (window.FEED_COUNTS[postId] !== undefined) paintCount(post, window.FEED_COUNTS[postId]);
    });
  }

  async function loadMyLikes() {
    const supa = getSupa(); const userId = await getUserId(); if (!supa || !userId) { paintAll(); return; }
    try {
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
      if (error) throw error;
      window.FEED_LIKES = new Set((data || []).map(item => String(item.post_id)));
      saveLocal(); paintAll();
    } catch (error) { console.error("PIXORO LOAD LIKES:", error); }
  }

  function addStyles() {
    const old = document.getElementById("pixoro-like-v70-css"); if (old) old.remove();
    const style = document.createElement("style"); style.id = "pixoro-like-v70-css";
    style.textContent = `
      .like-btn, .like-button, [data-like-btn] { background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; overflow: visible !important; visibility: visible !important; }
      .like-btn svg, .like-button svg, [data-like-btn] svg { transform-origin: center !important; flex-shrink: 0 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked, .like-btn.active { color: #FF3040 !important; }
      .like-btn.liked svg, .like-button.liked svg, [data-like-btn].liked svg, .like-btn.liked svg *, .like-button.liked svg * { fill: #FF3040 !important; stroke: #FF3040 !important; }
      .like-btn.liked svg path, .like-button.liked svg path, [data-like-btn].liked svg path { fill: #FF3040 !important; stroke: #FF3040 !important; }
      .like-btn:not(.liked) svg, .like-btn:not(.liked) svg path, .like-button:not(.liked) svg path { fill: none !important; stroke: #fff !important; }
      .pixoro-big-heart { pointer-events: none !important; background: transparent !important; border: none !important; box-shadow: none !important; }
      .post-media, .postMedia, .post-media-wrap { position: relative !important; overflow: hidden !important; }
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
  console.log("PIXORO LIKE V70 LOADED ❤️🔥 REELS STYLE - HEART INSIDE MEDIA");
})();
