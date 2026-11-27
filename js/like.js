/* ===== PIXORO LIKE V55 - V54 CORRECTED - INSTAGRAM 2026 DA ===== */
// ✅ V55 FIX 1 - posts Update Delete da - RLS Fail Varaathu da
// ✅ V55 FIX 2 - loadMyLikes la Count ah likes Table la Irundhu Edukkrom da - Pazhaya 0 Stuck Aagaathu da
// ✅ V55 FIX 3 - supa-ready ku Aprom Thaan loadMyLikes da - User ID Kedaikkum da
(() => {
  "use strict";
  if (window.PIXORO_LIKE_V55) return;
  window.PIXORO_LIKE_V55 = true;
  window.PIXORO_LIKE_V54 = true;
  function getSupa(){ return window.supa || window.supabaseClient || (typeof window.getSupa === 'function' ? window.getSupa() : null); }
  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 350;
  const HEART_DURATION = 900;
  const lastTap = new Map();
  const lastToggleAt = new Map();
  const pending = new Map();
  let blockClickUntil = 0;
  try { const saved = JSON.parse(localStorage.getItem("pixoro_likes") || "[]"); window.FEED_LIKES = new Set(saved.map(String)); } catch { window.FEED_LIKES = new Set(); }
  try { window.FEED_COUNTS = JSON.parse(localStorage.getItem("pixoro_counts") || "{}"); } catch { window.FEED_COUNTS = {}; }
  function saveLocal(){ try{ localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES])); localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS)); }catch(e){} }
  async function getUserId(){
    if (window.currentUser?.id) return window.currentUser.id;
    let supa = getSupa(); if (!supa) return null;
    try{ const { data, error } = await supa.auth.getUser(); if (error || !data?.user?.id) return null; return data.user.id; }catch{ return null; }
  }
  function getPost(element){ return element?.closest("[data-post-id]"); }
  function getPostId(element){
    const post = getPost(element);
    return String(element?.dataset?.postId || post?.dataset?.postId || post?.dataset?.id || "");
  }
  function getLikeButton(post){ if (!post) return null; return post.querySelector("[data-like-btn], .like-btn, .like-button"); }
  function getLikeCount(post){ if (!post) return null; return post.querySelector("[data-like-count], .like-count, .likes-count, [data-count='likes'], .rCount"); }
  function paintLike(post, liked){
    const button = getLikeButton(post); if (!button) return;
    button.classList.toggle("liked", liked); button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked)); button.dataset.liked = liked ? "true" : "false";
    button.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    button.style.setProperty("background", "transparent", "important");
    button.style.setProperty("border", "none", "important");
    button.style.setProperty("box-shadow", "none", "important");
    button.style.setProperty("outline", "none", "important");
    button.style.setProperty("overflow", "visible", "important");
    button.style.setProperty("opacity", "1", "important");
    button.style.setProperty("visibility", "visible", "important");
    button.querySelectorAll("svg, i, path").forEach(el => {
      el.style.setProperty("opacity", "1", "important"); el.style.setProperty("visibility", "visible", "important"); el.style.setProperty("overflow", "visible", "important");
      if (el.tagName === "SVG" || el.tagName === "PATH"){
        el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
        el.style.setProperty("stroke", liked ? "#FF3040" : "#fff", "important");
        el.style.setProperty("stroke-width", "1.8", "important");
      }
      if (el.tagName === "I"){ el.style.setProperty("color", liked ? "#FF3040" : "#fff", "important"); }
    });
  }
  function paintCount(post, count){
    const el = getLikeCount(post); if (!el) return;
    if (count === undefined || count === null || isNaN(Number(count))) return;
    el.textContent = Math.max(0, Number(count) || 0);
    el.style.transform = "none"; el.style.animation = "none"; el.style.fontSize = "14px"; el.style.lineHeight = "1"; el.style.display = "inline-block"; el.style.opacity = "1"; el.style.visibility = "visible";
  }
  function clearOldHearts(){ document.querySelectorAll(".pixoro-big-heart").forEach(h => { try{ h.remove(); }catch(e){} }); }
  function showBigHeart(media, touchX, touchY){
    if (!media) return;
    clearOldHearts();
    const rect = media.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const startX = (typeof touchX === 'number' && touchX > 0 ? touchX : rect.left + rect.width / 2);
    const startY = (typeof touchY === 'number' && touchY > 0 ? touchY : rect.top + rect.height / 2);
    const gid = 'pixoroGrad' + Date.now() + Math.floor(Math.random()*10000);
    const ring = document.createElement("div"); ring.className = "pixoro-big-heart";
    ring.style.cssText = `position:fixed;z-index:999998;pointer-events:none;left:${startX}px;top:${startY}px;width:14px;height:14px;transform:translate(-50%,-50%);border:2px solid #FF3DF0;border-radius:50%;opacity:0.9;background:transparent;`;
    document.body.appendChild(ring);
    ring.animate([{ transform: "translate(-50%,-50%) scale(0.5)", opacity: 0.9 },{ transform: "translate(-50%,-50%) scale(3)", opacity: 0 }], { duration: 600, easing: "ease-out", fill: "forwards" });
    setTimeout(()=>{ try{ring.remove()}catch(e){} }, 650);
    for (let i = 0; i < 6; i++){
      const s = document.createElement("div"); s.className = "pixoro-big-heart";
      const angle = (i / 6) * Math.PI * 2; const dx = Math.cos(angle) * 32; const dy = Math.sin(angle) * 32;
      s.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${startX}px;top:${startY}px;width:10px;height:10px;transform:translate(-50%,-50%);opacity:1;`;
      s.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%"><path fill="#FF3DF0" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
      document.body.appendChild(s);
      s.animate([{ transform: "translate(-50%,-50%) scale(0)", opacity: 1 },{ transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: 0.5 },{ transform: `translate(calc(-50% + ${dx * 1.4}px), calc(-50% + ${dy * 1.4}px)) scale(0)`, opacity: 0 }], { duration: 700, easing: "ease-out", fill: "forwards" });
      setTimeout(()=>{ try{s.remove()}catch(e){} }, 750);
    }
    const heart = document.createElement("div"); heart.className = "pixoro-big-heart";
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${startX}px;top:${startY}px;width:90px;height:90px;opacity:0;transform:translate(-50%,-50%) scale(0);background:transparent !important;border:none !important;box-shadow:none !important;display:block !important;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;background:transparent;display:block;filter:drop-shadow(0 0 14px rgba(255,61,240,.8))"><defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF0A33"/><stop offset="30%" stop-color="#FF3DF0"/><stop offset="60%" stop-color="#A259FF"/><stop offset="85%" stop-color="#FF8A00"/><stop offset="100%" stop-color="#FFD600"/></linearGradient></defs><path fill="url(#${gid})" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    const animation = heart.animate([{ transform: "translate(-50%,-50%) scale(0)", opacity: 0, offset: 0 },{ transform: "translate(-50%,-50%) scale(1.25)", opacity: 1, offset: 0.2 },{ transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.4 },{ transform: "translate(-50%,-50%) scale(1.1)", opacity: 1, offset: 0.6 },{ transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.8 },{ transform: "translate(-50%,-50%) scale(1)", opacity: 0, offset: 1 }], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    animation.onfinish = () => heart.remove(); setTimeout(()=>{ try{heart.remove()}catch(e){} }, 1000);
  }
  function showTapHeart(x, y) { return; }
  function showMassDance(media) { return; }
  function showButtonHeart(button){
    if (!button) return; const r = button.getBoundingClientRect(); if (!r.width) return; const gid = 'pixoroBtn' + Date.now() + Math.floor(Math.random()*10000);
    const heart = document.createElement("div"); heart.className = "pixoro-big-heart";
    const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${cx}px;top:${cy}px;width:34px;height:34px;opacity:0;transform:translate(-50%,-50%) scale(0.5);background:transparent !important;border:none !important;display:block !important;visibility:visible !important;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;background:transparent;display:block;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))"><defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF0A33"/><stop offset="50%" stop-color="#FF3DF0"/><stop offset="100%" stop-color="#FF8A00"/></linearGradient></defs><path fill="url(#${gid})" stroke="#fff" stroke-width="1.2" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    const a = heart.animate([
      { transform: "translate(-50%,-50%) scale(0.5)", opacity: 0, offset: 0 },
      { transform: "translate(-50%,-60%) scale(1.2)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%,-120%) scale(1)", opacity: 1, offset: 0.6 },
      { transform: "translate(-50%,-200%) scale(0.9)", opacity: 0, offset: 1 }
    ], { duration: 800, easing: "ease-out", fill: "forwards" });
    a.onfinish = () => heart.remove(); setTimeout(()=>{ try{heart.remove()}catch(e){} }, 900);
  }
  function buttonAnimation(post){
    const button = getLikeButton(post); if (!button) return;
    button.style.setProperty("overflow", "visible", "important"); button.style.setProperty("opacity", "1", "important"); button.style.setProperty("visibility", "visible", "important");
    const icon = button.querySelector("svg, i, img, span"); if (!icon) return;
    icon.style.setProperty("opacity", "1", "important"); icon.style.setProperty("visibility", "visible", "important"); icon.style.setProperty("overflow", "visible", "important");
    try { icon.getAnimations().forEach(a => a.cancel()); } catch(e) {}
    icon.animate([{ transform: "scale(1)", opacity: 1, offset: 0 },{ transform: "scale(1.5)", opacity: 1, offset: 0.2 },{ transform: "scale(0.9)", opacity: 1, offset: 0.4 },{ transform: "scale(1.35)", opacity: 1, offset: 0.6 },{ transform: "scale(0.95)", opacity: 1, offset: 0.8 },{ transform: "scale(1)", opacity: 1, offset: 1 }], { duration: 500, easing: "ease-out", fill: "forwards" });
  }
  // ✅ V55 FIX 1 - posts Update Full Delete da - likes Mattum da
  async function serverSave(postId, liked){
    let supa = getSupa(); if (!supa) return;
    const userId = await getUserId(); if (!userId) return;
    try{
      if (liked){ await supa.from(TABLE).upsert({ post_id: postId, user_id: userId }, { onConflict: "post_id,user_id" }); }
      else { await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId); }
    }catch(error){ console.log("PIXORO LIKE SYNC LATER:", error?.message); }
  }
  function toggleLike(postId, post, forceLike = false){
    if (!postId || !post) return false; postId = String(postId);
    const now = Date.now(); const prevAt = lastToggleAt.get(postId) || 0;
    if (!forceLike && now - prevAt < 300) return window.FEED_LIKES.has(postId);
    lastToggleAt.set(postId, now);
    const alreadyLiked = window.FEED_LIKES.has(postId); const willLike = forceLike ? true : !alreadyLiked;
    if (forceLike && alreadyLiked){ paintLike(post, true); return true; }
    const countEl = getLikeCount(post);
    const oldCount = (window.FEED_COUNTS[postId] !== undefined) ? Number(window.FEED_COUNTS[postId]) : Number(countEl?.textContent ?? 0);
    const newCount = willLike ? oldCount + 1 : Math.max(0, oldCount - 1);
    if (willLike) window.FEED_LIKES.add(postId); else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = newCount; saveLocal();
    paintLike(post, willLike); paintCount(post, newCount);
    const prev = pending.get(postId) || Promise.resolve();
    const next = prev.catch(()=>{}).then(()=> serverSave(postId, willLike));
    pending.set(postId, next); next.finally(()=>{ if (pending.get(postId) === next) pending.delete(postId); });
    return willLike;
  }
  function findMedia(element){ if (!element?.closest) return null; return element.closest(".postMedia, .post-media, .post-media-wrap") || element.closest("[data-post-id]"); }
  function handleDoubleTap(media, postId, post, x, y){
    blockClickUntil = Date.now() + 700;
    showBigHeart(media || post, x, y);
    buttonAnimation(post);
    toggleLike(postId, post, true);
  }
  document.addEventListener("touchstart", event => {
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const post = getPost(event.target); if (!post) return;
    const postId = getPostId(event.target); if (!postId) return;
    const media = findMedia(event.target) || post;
    const now = Date.now();
    const previous = lastTap.get(String(postId));
    const touchX = event.touches && event.touches[0] ? event.touches[0].clientX : null;
    const touchY = event.touches && event.touches[0] ? event.touches[0].clientY : null;
    lastTap.set(String(postId), { time: now, x: touchX, y: touchY });
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY){ lastTap.delete(String(postId)); handleDoubleTap(media, postId, post, touchX, touchY); }
  }, { passive: true, capture: true });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button"); if (button){
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      const post = getPost(button); const postId = getPostId(button); if (!post || !postId) return;
      const wasLiked = window.FEED_LIKES.has(String(postId));
      if (!wasLiked) showButtonHeart(button);
      buttonAnimation(post);
      toggleLike(postId, post, false);
      return;
    }
    if (Date.now() < blockClickUntil){ const post = getPost(event.target); if (post){ event.preventDefault(); return; } }
  }, true);
  function paintAll(){
    document.querySelectorAll("[data-post-id]").forEach(post => {
      const postId = String(post.dataset.postId || post.dataset.id || ""); if (!postId) return;
      const liked = window.FEED_LIKES.has(postId); paintLike(post, liked);
      if (window.FEED_COUNTS[postId] !== undefined){ paintCount(post, Number(window.FEED_COUNTS[postId])); }
    });
  }
  // ✅ V55 FIX 2 - Count ah likes Table la Irundhu Edu da
  async function loadMyLikes(){
    paintAll(); const userId = await getUserId(); let supa = getSupa(); if (!userId || !supa) return;
    try{
      const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId); if (error) throw error;
      (data || []).forEach(item => window.FEED_LIKES.add(String(item.post_id)));
      // ✅ Pazhaya 0 ah Clear Pannitu - Real Count ah Edu da
      const ids = [...new Set(document.querySelectorAll("[data-post-id]")).values()].map(p=>String(p.dataset.postId)).filter(Boolean);
      for(const id of ids){
        const { count } = await supa.from(TABLE).select("*", { count: "exact", head: true }).eq("post_id", id);
        if(count !== null && count !== undefined) window.FEED_COUNTS[id] = Number(count);
      }
      saveLocal(); paintAll();
    }catch(error){ console.error("PIXORO LOAD LIKES:", error); }
  }
  window.addEventListener("pixoro-feed-rendered", ()=> setTimeout(paintAll, 50));
  window.addEventListener("pixoro-reels-rendered", ()=> setTimeout(paintAll, 50));
  // ✅ V55 FIX 3 - supa-ready ku Aprom Thaan Load da
  window.addEventListener("pixoro-supa-ready", ()=> setTimeout(loadMyLikes, 100));
  function addStyles(){
    if (document.getElementById("pixoro-v39-css")) return;
    const style = document.createElement("style"); style.id = "pixoro-v39-css";
    style.textContent = `.like-btn, .like-button, [data-like-btn] { background:transparent !important; border:none !important; outline:none !important; box-shadow:none !important; padding:0 !important; overflow:visible !important; opacity:1 !important; visibility:visible !important; } .like-btn svg, .like-button svg, [data-like-btn] svg { background:transparent !important; border:none !important; box-shadow:none !important; outline:none !important; transform-origin: center !important; flex-shrink: 0 !important; opacity:1 !important; visibility:visible !important; overflow:visible !important; } .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color:#FF3040 !important; background:transparent !important; } .like-btn.liked svg, .like-button.liked svg { fill:#FF3040 !important; stroke:#FF3040 !important; } .like-btn:not(.liked) svg, .like-btn:not(.liked) svg path { fill:none !important; stroke:#fff !important; } .pixoro-big-heart { pointer-events:none !important; background:transparent !important; border:none !important; box-shadow:none !important; display:block !important; } [data-like-count], .like-count, .likes-count { transform:none !important; animation:none !important; flex-shrink: 0 !important; background:transparent !important; border:none !important; font-size:14px !important; line-height:1 !important; } .pixoro-tap-heart { display:none !important; opacity:0 !important; }`;
    document.head.appendChild(style);
  }
  window.pixoroToggleLike = toggleLike; window.pixoroPaintAllLikes = paintAll; window.showBigHeart = showBigHeart; window.pixoroTapHeart = showTapHeart; window.pixoroMassDance = showMassDance;
  function start(){ addStyles(); paintAll(); loadMyLikes(); }
  if (document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", start, { once: true }); } else { start(); }
  window.addEventListener("pixoro:login", loadMyLikes);
  console.log("PIXORO LIKE V55 LOADED ❤️");
})();
