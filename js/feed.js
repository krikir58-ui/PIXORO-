/* =====================================================
   PIXORO LIKE V59 - CORRECTED - FINAL DA
   LIKE / UNLIKE / DOUBLE TAP HEART / SUPABASE SAVE
   FEED V1035 COMPATIBLE
   ===================================================== */
(function () {
  "use strict";
  if (window.PIXORO_LIKE_V59) return;
  window.PIXORO_LIKE_V59 = true;
  const LIKES_TABLE = "likes";
  let client = null;
  let currentUserId = null;
  let busy = new Set();
  let lastTap = 0;
  let lastTapPost = null;
  let blockClickUntil = 0;
  window.FEED_LIKES = window.FEED_LIKES || new Set();
  window.FEED_COUNTS = window.FEED_COUNTS || {};
  function getClient() { return window.getSupa ? window.getSupa() : window.supa || window.supabaseClient || null; }
  // ✅ V59 FIX 2 - Supabase la Irundhu User ah Edu da - window.currentUser Mattum Nambaathe da
  async function getUserId() {
    if (window.currentUser?.id || window.user?.id || window.currentUserId) return window.currentUser?.id || window.user?.id || window.currentUserId;
    client = getClient(); if (!client?.auth?.getUser) return null;
    try { const { data } = await client.auth.getUser(); currentUserId = data?.user?.id || null; return currentUserId; } catch { return null; }
  }
  function getPost(element) { return element?.closest("article.post[data-post-id]") || element?.closest("[data-post-id]"); }
  function getPostId(element) { const post = getPost(element); return post?.dataset.postId || post?.dataset.id || null; }
  function getLikeButton(post) { return post?.querySelector('.like-btn, [data-like-btn], [data-action="like"], .like-button'); }
  function getLikeCount(post) { return post?.querySelector(".like-count, [data-like-count]"); }
  function isLiked(id) { return window.FEED_LIKES.has(String(id)); }
  function saveLocal() { try { localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES])); localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS)); } catch (e) {} }
  function loadLocal() { try { const likes = JSON.parse(localStorage.getItem("pixoro_likes") || "[]"); const counts = JSON.parse(localStorage.getItem("pixoro_counts") || "{}"); window.FEED_LIKES = new Set(likes.map(String)); window.FEED_COUNTS = counts || {}; } catch (e) {} }
  // ✅ V59 FIX 1 - paintLike - SVG + PATH ku Fill Red da - Color Mattum Podhaathu da
  function paintLike(post) {
    if (!post) return;
    const id = getPostId(post); if (!id) return;
    const button = getLikeButton(post); if (!button) return;
    const liked = isLiked(id);
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.dataset.liked = liked ? "true" : "false";
    button.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    button.querySelectorAll("svg, path, i").forEach(el => {
      if (el.tagName === "SVG" || el.tagName === "PATH") {
        el.setAttribute("fill", liked ? "#FF3040" : "none");
        el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
        el.style.setProperty("stroke", liked ? "#FF3040" : "#fff", "important");
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("visibility", "visible", "important");
      }
      if (el.tagName === "I") el.style.setProperty("color", liked ? "#FF3040" : "#fff", "important");
    });
    void button.offsetWidth;
  }
  function paintCount(post) {
    if (!post) return;
    const id = getPostId(post); if (!id) return;
    const countElement = getLikeCount(post); if (!countElement) return;
    const value = Number(window.FEED_COUNTS[id] ?? countElement.textContent ?? 0);
    countElement.textContent = Math.max(0, value);
  }
  function paintAll() { document.querySelectorAll("article.post[data-post-id], [data-post-id]").forEach(post => { paintLike(post); paintCount(post); }); }
  // ✅ V59 FIX 3 - Emoji Heart Illa da - Gradient SVG Heart da - V1038 CSS kooda Same da
  function showBigHeart(media) {
    if (!media) return;
    const old = media.querySelector(".pixoro-big-heart"); if (old) old.remove();
    const gid = "pixoroGrad" + Date.now() + Math.floor(Math.random() * 10000);
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block;filter:drop-shadow(0 0 14px rgba(255,61,240,.8))"><defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF0A33"/><stop offset="30%" stop-color="#FF3DF0"/><stop offset="60%" stop-color="#A259FF"/><stop offset="85%" stop-color="#FF8A00"/><stop offset="100%" stop-color="#FFD600"/></linearGradient></defs><path fill="url(#${gid})" stroke="#fff" stroke-width="1.2" stroke-linejoin="round" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    Object.assign(heart.style, { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) scale(.3)", width: "90px", height: "90px", pointerEvents: "none", zIndex: "999", opacity: "0", transition: "transform .25s ease, opacity .25s ease", background: "transparent", border: "none" });
    if (getComputedStyle(media).position === "static") media.style.position = "relative";
    media.appendChild(heart);
    requestAnimationFrame(() => { heart.style.opacity = "1"; heart.style.transform = "translate(-50%, -50%) scale(1.2)"; });
    setTimeout(() => { heart.style.opacity = "0"; heart.style.transform = "translate(-50%, -50%) scale(1.6)"; }, 450);
    setTimeout(() => heart.remove(), 750);
  }
  function getMedia(post) { return post?.querySelector(".post-media, .postMedia, .post-media-wrap"); }
  async function serverSave(postId, liked) {
    client = getClient(); currentUserId = await getUserId(); if (!client || !currentUserId) return;
    try {
      if (liked) { const { error } = await client.from(LIKES_TABLE).upsert({ post_id: postId, user_id: currentUserId }, { onConflict: "post_id,user_id" }); if (error) throw error; }
      else { const { error } = await client.from(LIKES_TABLE).delete().eq("post_id", postId).eq("user_id", currentUserId); if (error) throw error; }
    } catch (error) { console.error("PIXORO LIKE SAVE ERROR:", error); }
  }
  async function toggleLike(post, doubleTap) {
    const postId = getPostId(post); if (!postId || busy.has(postId)) return;
    // ✅ V59 FIX - Double Tap na Already Liked na Unlike Pannaathe da - Liked ah Vechukko da
    if (doubleTap && isLiked(postId)) { showBigHeart(getMedia(post)); paintLike(post); return; }
    const oldLiked = isLiked(postId);
    busy.add(postId);
    const countElement = getLikeCount(post);
    const oldCount = Number(window.FEED_COUNTS[postId] ?? countElement?.textContent ?? 0);
    const newLiked = !oldLiked;
    if (newLiked) window.FEED_LIKES.add(postId); else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = Math.max(0, oldCount + (newLiked ? 1 : -1));
    paintLike(post); paintCount(post); saveLocal();
    if (doubleTap && newLiked) showBigHeart(getMedia(post));
    await serverSave(postId, newLiked);
    busy.delete(postId);
  }
  async function loadMyLikes() {
    client = getClient(); currentUserId = await getUserId();
    if (!client || !currentUserId) { paintAll(); return; }
    try {
      const { data, error } = await client.from(LIKES_TABLE).select("post_id").eq("user_id", currentUserId);
      if (error) throw error;
      // ✅ V59 FIX - DB la Illana Local ah Azhikkaathe da - Merge Pannu da - Max Count da
      (data || []).forEach(row => window.FEED_LIKES.add(String(row.post_id)));
      const ids = [...new Set([...document.querySelectorAll("[data-post-id]")].map(p => String(p.dataset.postId || p.dataset.id)).filter(Boolean))];
      for (const id of ids) { const { count } = await client.from(LIKES_TABLE).select("*", { count: "exact", head: true }).eq("post_id", id); if (count !== null && count !== undefined) window.FEED_COUNTS[id] = Math.max(Number(window.FEED_COUNTS[id] || 0), Number(count)); }
      saveLocal(); paintAll();
    } catch (error) { console.error("PIXORO LOAD LIKES ERROR:", error); paintAll(); }
  }
  document.addEventListener("click", function (event) {
    if (Date.now() < blockClickUntil) { event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); return; }
    const button = event.target.closest('.like-btn, [data-like-btn], [data-action="like"]'); if (!button) return;
    event.preventDefault(); event.stopPropagation();
    const post = getPost(button); if (!post) return;
    toggleLike(post, false);
  }, true);
  document.addEventListener("touchend", function (event) {
    const media = event.target.closest(".post-media, .postMedia, .post-media-wrap"); if (!media) return;
    if (event.target.closest("button, a, input, textarea, select")) return;
    const post = getPost(media); if (!post) return;
    const now = Date.now(); const postId = getPostId(post);
    if (lastTapPost === postId && now - lastTap < 320) {
      event.preventDefault(); blockClickUntil = Date.now() + 700;
      toggleLike(post, true);
      lastTap = 0; lastTapPost = null; return;
    }
    lastTap = now; lastTapPost = postId;
  }, { passive: false });
  document.addEventListener("dblclick", function (event) {
    const media = event.target.closest(".post-media, .postMedia, .post-media-wrap"); if (!media) return;
    if (event.target.closest("button, a, input, textarea, select")) return;
    const post = getPost(media); if (!post) return;
    toggleLike(post, true);
  });
  // ✅ V59 FIX - Final CSS ah Body Kadasiya Podu da - feed.css ah Vida Jeyikkum da
  function addStyles() {
    let old = document.getElementById("pixoro-like-final-css"); if (old) old.remove();
    const s = document.createElement("style"); s.id = "pixoro-like-final-css";
    s.textContent = `.like-btn.liked svg, .like-btn.liked svg path, button[data-like-btn].liked svg, button[data-like-btn].liked svg path{fill:#FF3040 !important;stroke:#FF3040 !important;} .like-btn:not(.liked) svg, .like-btn:not(.liked) svg path{fill:none !important;stroke:#fff !important;} .post-media .pixoro-big-heart,.postMedia .pixoro-big-heart{display:block !important;opacity:0 !important;}`;
    document.body.appendChild(s);
  }
  window.pixoroPaintAllLikes = paintAll; window.pixoroLoadLikes = loadMyLikes; window.pixoroToggleLike = toggleLike;
  document.addEventListener("pixoro-feed-rendered", paintAll);
  document.addEventListener("pixoro-supa-ready", () => setTimeout(loadMyLikes, 100));
  loadLocal(); addStyles(); paintAll();
  setTimeout(loadMyLikes, 500);
})();
