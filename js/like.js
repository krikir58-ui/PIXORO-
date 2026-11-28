/* =====================================================
   PIXORO LIKE V92
   LIKE BUTTON  = LIKE / UNLIKE - SMOOTH DA
   PHOTO DOUBLE TAP = POP HEART + LIKE ONLY
   SUPABASE = SERVER SAVE
   + V92 FIX DA - Instagram Mari Illa da - Simple POP Mattum Tha da
   + V92 FIX DA - Like Button Thotta - Button Ye POP Aagum da + Naduvula Heart POP Aagum da
   + V92 FIX DA - Heart Mela Pogathu da - Naduvula Ye POP Aagi Maraiyum da - 72px Red da
   + V92 FIX DA - Like Aana Odane Heart Varum da - toggleLike kulla Ye Heart Irukku da
   ===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V92) return;
  window.PIXORO_LIKE_V92 = true;

  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 300;
  const HEART_DURATION = 700;

  const lastTap = new Map();
  const pending = new Map();
  const revisions = new Map();

  let suppressMediaClickUntil = 0;
  let syncRunning = false;
  let syncAgain = false;
  let lastPopAt = 0;

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

  /* ✅ V92 - Simple POP Heart da - Instagram Mari Illa da - Gradient Illa da - Periya Heart Illa da */
  function showBigHeart(media, x, y) {
    let px = Number.isFinite(x) ? x : null;
    let py = Number.isFinite(y) ? y : null;
    if ((px === null || py === null) && media) {
      const rect = media.getBoundingClientRect();
      if (rect.width) { px = rect.left + rect.width / 2; py = rect.top + rect.height / 2; }
    }
    if (px === null) px = window.innerWidth / 2;
    if (py === null) py = window.innerHeight / 2;
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${px}px;top:${py}px;width:72px;height:72px;transform:translate(-50%,-50%) scale(0);opacity:0;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(255,48,64,.45))"><path fill="#FF3040" stroke="#FFFFFF" stroke-width="1.2" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    // ✅ V92 - Naduvula Ye POP da - Mela Pogathu da - translate(-50%,-50%) Apdiye Irukkum da
    const anim = heart.animate([
      { transform: "translate(-50%,-50%) scale(0)", opacity: 0 },
      { transform: "translate(-50%,-50%) scale(1.3)", opacity: 1, offset: .25 },
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: .45 },
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: .70 },
      { transform: "translate(-50%,-50%) scale(0.9)", opacity: 0 }
    ], { duration: HEART_DURATION, easing: "ease-out", fill: "forwards" });
    anim.onfinish = () => heart.remove();
  }

  window.pixoroShowHeartDance = showBigHeart;
  window.showBigHeart = showBigHeart;

  /* ✅ V92 KEY - Post ku POP Heart - Media Kedaikala na - Post Center - Adhuvum Illana - Screen Center da */
  function popHeartForPost(post) {
    const now = Date.now();
    if (now - lastPopAt < 350) return; // ✅ Double Heart Varathu da
    lastPopAt = now;
    if (!post) { showBigHeart(null, window.innerWidth / 2, window.innerHeight / 2); return; }
    const media = post.querySelector(".postMedia, .post-media, .post-media-wrap, .reel-media, video, img.main");
    if (media) {
      const r = media.getBoundingClientRect();
      if (r.width) { showBigHeart(media, r.left + r.width / 2, r.top + r.height / 2); return; }
    }
    const pr = post.getBoundingClientRect();
    if (pr.width) { showBigHeart(null, pr.left + pr.width / 2, pr.top + pr.height / 2); return; }
    showBigHeart(null, window.innerWidth / 2, window.innerHeight / 2);
  }

  function showUnlikeHeart(button) { return; }

  /* ✅ V92 - Like Button POP da - Button Ye Thullum da - 1 -> 1.45 -> 0.92 -> 1 da */
  function buttonAnimation(post) {
    const btn = getLikeButton(post);
    const icon = btn?.querySelector("svg");
    if (!btn && !icon) return;
    const el = icon || btn;
    el.getAnimations().forEach(a => a.cancel());
    el.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.45)", offset: .35 },
      { transform: "scale(0.92)", offset: .65 },
      { transform: "scale(1)" }
    ], { duration: 350, easing: "ease-out" });
    // ✅ Button Full Ah POP Aaganum da - SVG Mattum Illa da
    if (icon && btn !== icon) {
      btn.getAnimations().forEach(a => a.cancel());
      btn.animate([
        { transform: "scale(1)" },
        { transform: "scale(1.25)", offset: .35 },
        { transform: "scale(0.95)", offset: .65 },
        { transform: "scale(1)" }
      ], { duration: 350, easing: "ease-out" });
    }
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

    /* ✅ V92 KEY FIX DA - Like Aacha - Inga Ye POP da */
    /* ✅ Like Button Thotta - toggleLike Odum da - Adhaan POP Kandippa Varum da */
    /* ✅ Unlike na POP Varathu da - Like na Mattum Tha da */
    if (willLike) {
      buttonAnimation(post); // ✅ Button Ye POP Aagum da
      popHeartForPost(post); // ✅ Naduvula Heart POP Aagum da
    }

    queueServerSave(postId, willLike, revision, previousLiked, previousCount, post);
    return willLike;
  }

  window.pixoroToggleLike = toggleLike;
  window.pixoroDoLike = (postId, button) => { const post = getPost(button); return toggleLike(postId, post, true); };
  window.likePost = window.pixoroDoLike;

  function handleDoubleTap(media, postId, post, x, y) {
    suppressMediaClickUntil = Date.now() + 500;
    // ✅ V92 - Double Tap la Thani Heart Vendaam da - toggleLike la Ye POP Varum da - Double Varathu da
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
      // ✅ V92 - Click la Button POP Vendaam da - toggleLike la Ye POP Irukku da - Double Varathu da
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

  console.log("PIXORO LIKE V92 READY ❤️");

  (function pixoroKillOldHeart(){
    var obs = new MutationObserver(function(){
      document.querySelectorAll(".pixoro-slow-float, .pixoro-soft-float, .pixoro-center-pop, .pixoro-reel-center-heart").forEach(function(el){ el.remove(); });
    });
    obs.observe(document.body, { childList:true, subtree:true });
  })();

  /* ✅ V92 - Thani pointerdown Heart Illa da - toggleLike la Ye POP Irukku da - Double Varathu da */
})();
