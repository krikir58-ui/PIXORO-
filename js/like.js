/* =====================================================
   PIXORO LIKE V89
   LIKE BUTTON  = LIKE / UNLIKE - SMOOTH DA
   PHOTO DOUBLE TAP = POP HEART + LIKE ONLY
   SUPABASE = SERVER SAVE
   + COMMENT MODAL GUARD DA
   + V89 FIX DA - Home Pink Heart Illa da - Reels Heart Tha Home kum da - 52px da
   + V89 FIX DA - Like Button Thotta - Double Tap Mari Ye - Naduvula POP Heart Varum da
   + V89 FIX DA - Flying Heart FULL Thookiten da - Button la Irundhu Parakka Vendaam da
   + V89 FIX DA - pointerdown la Pudikkuren da - feed.js Stop Panna Mudiyaathu da
   ===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V89) return;
  window.PIXORO_LIKE_V89 = true;

  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 300;
  const HEART_DURATION = 1000;

  const lastTap = new Map();
  const pending = new Map();
  const revisions = new Map();

  let suppressMediaClickUntil = 0;
  let heartId = 0;
  let syncRunning = false;
  let syncAgain = false;

  function getSupa() {
    return window.getSupa?.() ||
      window.supa ||
      window.supabaseClient ||
      null;
  }

  async function getUserId() {
    const supa = getSupa();
    if (!supa) return null;
    try {
      const { data, error } = await supa.auth.getSession();
      if (error) throw error;
      const id = data?.session?.user?.id || null;
      window.ME_ID = id;
      return id;
    } catch (error) {
      console.error("PIXORO AUTH:", error);
      return null;
    }
  }

  window.FEED_LIKES = new Set();
  window.FEED_COUNTS = {};

  try {
    window.FEED_LIKES = new Set(
      JSON.parse(localStorage.getItem("pixoro_likes") || "[]").map(String)
    );
    window.FEED_COUNTS = JSON.parse(
      localStorage.getItem("pixoro_counts") || "{}"
    );
  } catch (error) {
    window.FEED_LIKES = new Set();
    window.FEED_COUNTS = {};
  }

  function saveLocal() {
    try {
      localStorage.setItem("pixoro_likes", JSON.stringify([...window.FEED_LIKES]));
      localStorage.setItem("pixoro_counts", JSON.stringify(window.FEED_COUNTS));
    } catch (error) {}
  }

  function getPost(element) {
    return element?.closest("article.post[data-post-id], .post[data-post-id]") || null;
  }

  function getPostId(element) {
    const post = getPost(element);
    return String(post?.dataset?.postId || post?.dataset?.id || element?.dataset?.postId || "");
  }

  function getLikeButton(post) {
    if (!post) return null;
    if (post.matches?.("[data-like-btn], .like-btn, .like-button")) return post;
    return post.querySelector("[data-like-btn], .like-btn, .like-button");
  }

  function getLikeCount(post) {
    return post?.querySelector("[data-like-count], .like-count, .likes-count, [data-count='likes'], .rCount") || null;
  }

  function findMedia(element) {
    return element?.closest(".postMedia, .post-media, .post-media-wrap") || null;
  }

  function paintLike(post, liked) {
    const button = getLikeButton(post);
    if (!button) return;
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.classList.toggle("active", liked);
    button.dataset.liked = String(liked);
    button.setAttribute("aria-pressed", String(liked));
    button.style.setProperty("color", liked ? "#FF3040" : "#FFFFFF", "important");
    button.querySelectorAll("svg, svg *").forEach(el => {
      el.style.setProperty("fill", liked ? "#FF3040" : "none", "important");
      el.style.setProperty("stroke", liked ? "#FF3040" : "#FFFFFF", "important");
    });
  }

  function paintCount(post, count) {
    const el = getLikeCount(post);
    if (!el) return;
    el.textContent = String(Math.max(0, Number(count) || 0));
  }

  function paintAll() {
    document.querySelectorAll("article.post[data-post-id], .post[data-post-id]").forEach(post => {
      const id = String(post.dataset.postId || post.dataset.id || "");
      if (!id) return;
      paintLike(post, window.FEED_LIKES.has(id));
      if (window.FEED_COUNTS[id] !== undefined) paintCount(post, window.FEED_COUNTS[id]);
    });
  }

  function showBigHeart(media, x, y) {
    if (!media) return;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = Number.isFinite(x) ? x : rect.left + rect.width / 2;
    const py = Number.isFinite(y) ? y : rect.top + rect.height / 2;
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${px}px;top:${py}px;width:52px;height:52px;transform:translate(-50%,-50%) scale(0);opacity:0;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 8px 18px rgba(255,48,64,.55))"><path fill="#FF3040" stroke="#FFFFFF" stroke-width="1.2" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    const anim = heart.animate([
      { transform: "translate(-50%,-50%) scale(0)", opacity: 0 },
      { transform: "translate(-50%,-50%) scale(1.4)", opacity: 1, offset: .18 },
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: .42 },
      { transform: "translate(-50%,-65%) scale(1.05)", opacity: 1, offset: .70 },
      { transform: "translate(-50%,-120%) scale(.8)", opacity: 0 }
    ], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    anim.onfinish = () => heart.remove();
  }

  window.pixoroShowHeartDance = showBigHeart;
  window.showBigHeart = showBigHeart;

  function showUnlikeHeart(button) { return; }

  function buttonAnimation(post) {
    const icon = getLikeButton(post)?.querySelector("svg");
    if (!icon) return;
    icon.getAnimations().forEach(a => a.cancel());
    icon.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.06)", offset: .4 },
      { transform: "scale(1)" }
    ], { duration: 150, easing: "ease-out" });
  }

  async function serverSave(postId, liked) {
    const supa = getSupa();
    if (!supa) throw new Error("Supabase client not ready");
    const userId = await getUserId();
    if (!userId) throw new Error("Please login first");
    if (liked) {
      const { error } = await supa.from(TABLE).upsert({ post_id: postId, user_id: userId }, { onConflict: "post_id,user_id", ignoreDuplicates: true });
      if (error) throw error;
    } else {
      const { error } = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId);
      if (error) throw error;
    }
  }

  function queueServerSave(postId, liked, revision, previousLiked, previousCount, post) {
    const previousRequest = pending.get(postId) || Promise.resolve();
    const nextRequest = previousRequest.catch(() => {}).then(() => serverSave(postId, liked)).catch(error => {
      console.error("PIXORO LIKE SAVE ERROR:", error);
      if (revisions.get(postId) === revision) {
        if (previousLiked) window.FEED_LIKES.add(postId);
        else window.FEED_LIKES.delete(postId);
        window.FEED_COUNTS[postId] = previousCount;
        saveLocal();
        paintLike(post, previousLiked);
        paintCount(post, previousCount);
      }
    });
    pending.set(postId, nextRequest);
    nextRequest.then(() => { if (pending.get(postId) === nextRequest) pending.delete(postId); });
    return nextRequest;
  }

  function toggleLike(postId, post, forceLike = false) {
    if (!postId || !post) return false;
    postId = String(postId);
    const alreadyLiked = window.FEED_LIKES.has(postId);
    const willLike = forceLike ? true : !alreadyLiked;
    if (forceLike && alreadyLiked) { paintLike(post, true); return true; }
    const countEl = getLikeCount(post);
    const oldCount = window.FEED_COUNTS[postId] !== undefined ? Number(window.FEED_COUNTS[postId]) : Number(countEl?.textContent || 0);
    const previousCount = Math.max(0, oldCount);
    const previousLiked = alreadyLiked;
    const newCount = willLike ? previousCount + 1 : Math.max(0, previousCount - 1);
    if (willLike) window.FEED_LIKES.add(postId);
    else window.FEED_LIKES.delete(postId);
    window.FEED_COUNTS[postId] = newCount;
    const revision = (revisions.get(postId) || 0) + 1;
    revisions.set(postId, revision);
    saveLocal();
    paintLike(post, willLike);
    paintCount(post, newCount);
    queueServerSave(postId, willLike, revision, previousLiked, previousCount, post);
    return willLike;
  }

  window.pixoroToggleLike = toggleLike;
  window.pixoroDoLike = (postId, button) => { const post = getPost(button); return toggleLike(postId, post, true); };
  window.likePost = window.pixoroDoLike;

  function handleDoubleTap(media, postId, post, x, y) {
    suppressMediaClickUntil = Date.now() + 500;
    showBigHeart(media, x, y);
    toggleLike(postId, post, true);
  }

  document.addEventListener("pointerdown", event => {
    if (event.target.closest && (event.target.closest("#commentModal") || event.target.closest("[data-comment-like]") || event.target.closest("[data-like]"))) return;
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const post = getPost(event.target);
    if (!post) return;
    const postId = getPostId(event.target);
    if (!postId) return;
    const media = findMedia(event.target);
    if (!media) return;
    const now = Date.now();
    const previous = lastTap.get(postId);
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY) {
      lastTap.delete(postId);
      handleDoubleTap(media, postId, post, event.clientX, event.clientY);
    } else {
      lastTap.set(postId, { time: now, x: event.clientX, y: event.clientY });
    }
  }, true);

  document.addEventListener("click", event => {
    if (event.target.closest && (event.target.closest("#commentModal") || event.target.closest("[data-comment-like]") || event.target.closest("[data-like]"))) return;
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button");
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const post = getPost(button);
      const postId = getPostId(button);
      if (!post || !postId) return;
      buttonAnimation(post);
      toggleLike(postId, post, false);
      return;
    }
    if (Date.now() < suppressMediaClickUntil && event.target.closest(".postMedia, .post-media, .post-media-wrap")) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  async function syncVisiblePosts() {
    if (syncRunning) { syncAgain = true; return; }
    const posts = [...document.querySelectorAll("article.post[data-post-id], .post[data-post-id]")];
    const postMap = new Map();
    posts.forEach(post => { const id = String(post.dataset.postId || post.dataset.id || ""); if (id) postMap.set(id, post); });
    const ids = [...postMap.keys()];
    if (!ids.length) return;
    const supa = getSupa();
    const userId = await getUserId();
    if (!supa || !userId) { paintAll(); return; }
    syncRunning = true;
    const startingRevisions = new Map();
    ids.forEach(id => { startingRevisions.set(id, revisions.get(id) || 0); });
    try {
      let allRows = []; let from = 0; const pageSize = 1000;
      while (true) {
        const { data, error } = await supa.from(TABLE).select("post_id,user_id").in("post_id", ids).range(from, from + pageSize - 1);
        if (error) throw error;
        const rows = data || []; allRows = allRows.concat(rows);
        if (rows.length < pageSize) break;
        from += pageSize;
      }
      const counts = {}; const serverLiked = new Set();
      ids.forEach(id => counts[id] = 0);
      allRows.forEach(row => {
        const id = String(row.post_id);
        counts[id] = (counts[id] || 0) + 1;
        if (String(row.user_id) === String(userId)) serverLiked.add(id);
      });
      ids.forEach(id => {
        if ((revisions.get(id) || 0) !== startingRevisions.get(id)) return;
        if (serverLiked.has(id)) window.FEED_LIKES.add(id);
        else window.FEED_LIKES.delete(id);
        window.FEED_COUNTS[id] = counts[id];
      });
      saveLocal(); paintAll();
    } catch (error) {
      console.error("PIXORO SERVER SYNC ERROR:", error); paintAll();
    } finally {
      syncRunning = false;
      if (syncAgain) { syncAgain = false; setTimeout(syncVisiblePosts, 150); }
    }
  }

  window.pixoroSyncLikes = syncVisiblePosts;
  window.pixoroPaintAllLikes = paintAll;

  function start() { paintAll(); syncVisiblePosts(); }
  window.addEventListener("pixoro-feed-rendered", () => { setTimeout(syncVisiblePosts, 100); });
  window.addEventListener("pixoro-reels-rendered", () => { setTimeout(syncVisiblePosts, 100); });
  window.addEventListener("pixoro-supa-ready", () => { setTimeout(syncVisiblePosts, 100); });
  window.addEventListener("pixoro:login", () => { window.FEED_LIKES.clear(); window.FEED_COUNTS = {}; saveLocal(); setTimeout(syncVisiblePosts, 100); });
  window.addEventListener("pixoro:logout", () => { window.ME_ID = null; window.FEED_LIKES.clear(); window.FEED_COUNTS = {}; saveLocal(); paintAll(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  console.log("PIXORO LIKE V89 READY ❤️");

  (function pixoroKillOldHeart(){
    var obs = new MutationObserver(function(){
      document.querySelectorAll(".pixoro-slow-float, .pixoro-soft-float, .pixoro-center-pop, .pixoro-reel-center-heart").forEach(function(el){ el.remove(); });
    });
    obs.observe(document.body, { childList:true, subtree:true });
  })();

  /* ===== ✅ V89 - Like Button Thotta - Double Tap Mari Ye - Naduvula POP Heart da ===== */
  /* ✅ Flying Heart Illa da - dx / dy / calc() / left !important Ellam Illa da */
  (function pixoroLikeButtonPopHeart(){
    function isLikedNow(btn){
      if(!btn) return false;
      if(btn.classList.contains("liked") || btn.classList.contains("is-liked")) return true;
      if(btn.dataset && btn.dataset.liked === "true") return true;
      if(btn.getAttribute("aria-pressed") === "true") return true;
      var svg = btn.querySelector("svg");
      if(svg){
        var f = (svg.getAttribute("fill") || "") + " " + (svg.style.fill || "") + " " + (btn.style.color || "");
        if(f.indexOf("FF3040") !== -1) return true;
        var path = svg.querySelector("path");
        if(path && (path.getAttribute("fill") || "").indexOf("FF3040") !== -1) return true;
      }
      return false;
    }
    function isLikeButton(btn){
      if(!btn) return false;
      if(btn.closest("#commentModal")) return false;
      if(btn.matches("[data-like-btn], .like-btn, .like-button")) return true;
      // ✅ Home - First `act` Mattum Tha Heart da - Comment / Share / Save Illa da
      if(btn.classList.contains("act")){
        var parent = btn.parentElement;
        if(parent){
          var acts = parent.querySelectorAll(".act");
          if(acts.length && acts[0] === btn) return true;
        }
        var wrap = btn.closest(".rActions, .actions, .post-actions, .left");
        if(wrap && wrap.querySelector(".act") === btn) return true;
        return false;
      }
      return false;
    }
    // ✅ V89 KEY - pointerdown la Ye POP da - click ku Kaathula Illa da - feed.js Stop Panna Mudiyaathu da
    document.addEventListener("pointerdown", function(e){
      if(e.target.closest && e.target.closest("#commentModal")) return;
      var btn = e.target.closest ? e.target.closest("[data-like-btn], .like-btn, .like-button, .act") : null;
      if(!isLikeButton(btn)) return;
      if(isLikedNow(btn)) return; // ✅ Unlike na Heart Vendaam da
      var post = btn.closest("article.post, .post, .reel, .reel-item, [data-post-id]");
      var media = post ? post.querySelector(".postMedia, .post-media, .post-media-wrap, .reel-media, video, img.main") : null;
      if(!media) media = document.querySelector("video");
      if(!media) return;
      // ✅ Double Tap Mari Ye - Naduvula POP da - Flying Illa da - Orey Idathula Nikkathu da
      var r = media.getBoundingClientRect();
      if(!r.width) return;
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      showBigHeart(media, cx, cy);
    }, true);
  })();
})();
