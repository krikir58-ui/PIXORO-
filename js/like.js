/* =====================================================
   PIXORO LIKE V75
   LIKE BUTTON  = LIKE / UNLIKE - SMOOTH DA - Comment Mari da
   PHOTO DOUBLE TAP = POP HEART + LIKE ONLY
   SUPABASE = SERVER SAVE
   + COMMENT MODAL GUARD DA - Comment Like ah like.js Thodathu da
   + COMMENT LIKE CHINNA DA - Perusa Heart Parakkaathu da
   + V73 FIX DA - Like Button Click la Mela Heart Parakkaathu da - Button 1.15x Smooth Mattum Thudikkum da
   + V74 ADD DA - Home Heart Less Thudikkum da - 1.06x Chinna Beat Mattum da - Like / Unlike Panna Chinna Heart Mella Mela Poi Maraiyum da - 1100ms Slow da
   + V75 CORRECT ADD DA - 80ms Timing Thappu Illa da - MutationObserver da - Class Maariya Udane Pudikkum da - Unlike na White Heart Tha Varum da - Pink Varaathu da
   ===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V75) return;
  window.PIXORO_LIKE_V75 = true;

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
      localStorage.setItem(
        "pixoro_likes",
        JSON.stringify([...window.FEED_LIKES])
      );

      localStorage.setItem(
        "pixoro_counts",
        JSON.stringify(window.FEED_COUNTS)
      );
    } catch (error) {}
  }

  /* ARTICLE ONLY - FIXED */

  function getPost(element) {
    return element?.closest(
      "article.post[data-post-id], .post[data-post-id]"
    ) || null;
  }

  function getPostId(element) {
    const post = getPost(element);

    return String(
      post?.dataset?.postId ||
      post?.dataset?.id ||
      element?.dataset?.postId ||
      ""
    );
  }

  function getLikeButton(post) {
    if (!post) return null;

    if (post.matches?.(
      "[data-like-btn], .like-btn, .like-button"
    )) return post;

    return post.querySelector(
      "[data-like-btn], .like-btn, .like-button"
    );
  }

  function getLikeCount(post) {
    return post?.querySelector(
      "[data-like-count], .like-count, .likes-count, [data-count='likes'], .rCount"
    ) || null;
  }

  function findMedia(element) {
    return element?.closest(
      ".postMedia, .post-media, .post-media-wrap"
    ) || null;
  }

  /* UI */

  function paintLike(post, liked) {
    const button = getLikeButton(post);
    if (!button) return;

    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.classList.toggle("active", liked);

    button.dataset.liked = String(liked);
    button.setAttribute("aria-pressed", String(liked));

    button.style.setProperty(
      "color",
      liked ? "#FF3040" : "#FFFFFF",
      "important"
    );

    button.querySelectorAll("svg, svg *").forEach(el => {
      el.style.setProperty(
        "fill",
        liked ? "#FF3040" : "none",
        "important"
      );

      el.style.setProperty(
        "stroke",
        liked ? "#FF3040" : "#FFFFFF",
        "important"
      );
    });
  }

  function paintCount(post, count) {
    const el = getLikeCount(post);
    if (!el) return;

    el.textContent = String(Math.max(0, Number(count) || 0));
  }

  function paintAll() {
    document.querySelectorAll(
      "article.post[data-post-id], .post[data-post-id]"
    ).forEach(post => {
      const id = String(
        post.dataset.postId || post.dataset.id || ""
      );

      if (!id) return;

      paintLike(post, window.FEED_LIKES.has(id));

      if (window.FEED_COUNTS[id] !== undefined) {
        paintCount(post, window.FEED_COUNTS[id]);
      }
    });
  }

  /* POP HEART */

  function showBigHeart(media, x, y) {
    if (!media) return;

    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = Number.isFinite(x)
      ? x
      : rect.left + rect.width / 2;

    const py = Number.isFinite(y)
      ? y
      : rect.top + rect.height / 2;

    const heart = document.createElement("div");
    const gid = "pixoroV70Heart" + (++heartId);

    heart.className = "pixoro-big-heart";

    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${px}px;
      top:${py}px;
      width:84px;
      height:84px;
      transform:translate(-50%,-50%) scale(0);
      opacity:0;
    `;

    heart.innerHTML = `
      <svg viewBox="0 0 24 24"
        style="width:100%;height:100%;
        filter:drop-shadow(0 8px 18px rgba(255,45,149,.6))">
        <defs>
          <linearGradient id="${gid}">
            <stop offset="0%" stop-color="#FF2D95"/>
            <stop offset="55%" stop-color="#FF5E8A"/>
            <stop offset="100%" stop-color="#C86BFF"/>
          </linearGradient>
        </defs>
        <path
          fill="url(#${gid})"
          stroke="#FFFFFF"
          stroke-width=".6"
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
        />
      </svg>
    `;

    document.body.appendChild(heart);

    const anim = heart.animate([
      {
        transform: "translate(-50%,-50%) scale(0)",
        opacity: 0
      },
      {
        transform: "translate(-50%,-50%) scale(1.4)",
        opacity: 1,
        offset: .18
      },
      {
        transform: "translate(-50%,-50%) scale(1)",
        opacity: 1,
        offset: .42
      },
      {
        transform: "translate(-50%,-65%) scale(1.05)",
        opacity: 1,
        offset: .70
      },
      {
        transform: "translate(-50%,-120%) scale(.8)",
        opacity: 0
      }
    ], {
      duration: HEART_DURATION,
      easing: "ease-out",
      fill: "forwards"
    });

    anim.onfinish = () => heart.remove();
  }

  window.pixoroShowHeartDance = showBigHeart;
  window.showBigHeart = showBigHeart;

  /* ✅ CORRECTED DA - Like Button ku Nerra Ye Mela Poi Maraiyum da - Comment Nera Pogaathu da */
  /* ✅ V73 - Idhu Function Appadiye Irukku da - Aana Like Button Click la Ippo Koopda Maattom da - Double Tap ku Mattum Illa - Ippo Yaarum Koopda Maattanga da */
  function showUnlikeHeart(button) {
    // ✅ V72 ADD - Comment Button na Perusa Heart Parakka Koodathu da
    if (!button) return;
    if (button.closest && (button.closest("#commentModal") || button.closest("[data-comment-like]") || button.closest("[data-like]"))) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width) return;
    let x = rect.left + rect.width / 2;
    x = Math.max(26, Math.min(x, window.innerWidth - 26));
    const y = rect.top - 6;
    const heart = document.createElement("div");
    heart.className = "pixoro-unlike-heart";
    heart.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${x}px;top:${y}px;width:44px!important;height:44px!important;transform:translate(-50%,-50%) scale(1);opacity:1;`;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:44px!important;height:44px!important;filter:drop-shadow(0 8px 18px rgba(255,45,149,.6))"><path fill="#FF2D95" stroke="#FFFFFF" stroke-width=".6" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    const anim = heart.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: "translate(-50%,-90%) scale(0.9)", opacity: 0.9, offset: 0.3 },
      { transform: "translate(-50%,-160%) scale(0.7)", opacity: 0.5, offset: 0.65 },
      { transform: "translate(-50%,-220%) scale(0.4)", opacity: 0 }
    ], { duration: 900, easing: "ease-out", fill: "forwards" });
    anim.onfinish = () => heart.remove();
  }

  /* BUTTON ANIMATION */

  function buttonAnimation(post) {
    const icon = getLikeButton(post)?.querySelector("svg");
    if (!icon) return;

    icon.getAnimations().forEach(a => a.cancel());

    /* ✅ V73 CORRECT - 1.30x / 250ms -> 1.15x / 180ms da - Comment Mari Smooth da - Romba Thudikkaathu da */
    icon.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.15)", offset: .4 },
      { transform: "scale(1)" }
    ], {
      duration: 180,
      easing: "ease-out"
    });
  }

  /* SERVER SAVE */

  async function serverSave(postId, liked) {
    const supa = getSupa();
    if (!supa) throw new Error("Supabase client not ready");

    const userId = await getUserId();
    if (!userId) throw new Error("Please login first");

    if (liked) {
      const { error } = await supa
        .from(TABLE)
        .upsert(
          {
            post_id: postId,
            user_id: userId
          },
          {
            onConflict: "post_id,user_id",
            ignoreDuplicates: true
          }
        );

      if (error) throw error;
    } else {
      const { error } = await supa
        .from(TABLE)
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
    }
  }

  /* QUEUED SAVE */

  function queueServerSave(
    postId,
    liked,
    revision,
    previousLiked,
    previousCount,
    post
  ) {
    const previousRequest =
      pending.get(postId) || Promise.resolve();

    const nextRequest = previousRequest
      .catch(() => {})
      .then(() => serverSave(postId, liked))
      .catch(error => {
        console.error("PIXORO LIKE SAVE ERROR:", error);

        if (revisions.get(postId) === revision) {
          if (previousLiked) {
            window.FEED_LIKES.add(postId);
          } else {
            window.FEED_LIKES.delete(postId);
          }

          window.FEED_COUNTS[postId] = previousCount;

          saveLocal();
          paintLike(post, previousLiked);
          paintCount(post, previousCount);
        }
      });

    pending.set(postId, nextRequest);

    nextRequest.then(() => {
      if (pending.get(postId) === nextRequest) {
        pending.delete(postId);
      }
    });

    return nextRequest;
  }

  /* LIKE / UNLIKE */

  function toggleLike(postId, post, forceLike = false) {
    if (!postId || !post) return false;

    postId = String(postId);

    const alreadyLiked = window.FEED_LIKES.has(postId);
    const willLike = forceLike ? true : !alreadyLiked;

    if (forceLike && alreadyLiked) {
      paintLike(post, true);
      return true;
    }

    const countEl = getLikeCount(post);

    const oldCount =
      window.FEED_COUNTS[postId] !== undefined
        ? Number(window.FEED_COUNTS[postId])
        : Number(countEl?.textContent || 0);

    const previousCount = Math.max(0, oldCount);
    const previousLiked = alreadyLiked;

    const newCount = willLike
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    if (willLike) {
      window.FEED_LIKES.add(postId);
    } else {
      window.FEED_LIKES.delete(postId);
    }

    window.FEED_COUNTS[postId] = newCount;

    const revision = (revisions.get(postId) || 0) + 1;
    revisions.set(postId, revision);

    saveLocal();
    paintLike(post, willLike);
    paintCount(post, newCount);

    queueServerSave(
      postId,
      willLike,
      revision,
      previousLiked,
      previousCount,
      post
    );

    return willLike;
  }

  window.pixoroToggleLike = toggleLike;

  window.pixoroDoLike = (postId, button) => {
    const post = getPost(button);
    return toggleLike(postId, post, true);
  };

  window.likePost = window.pixoroDoLike;

  /* PHOTO DOUBLE TAP */

  function handleDoubleTap(media, postId, post, x, y) {
    suppressMediaClickUntil = Date.now() + 500;

    showBigHeart(media, x, y);

    // Photo double tap only likes. It never unlikes.
    toggleLike(postId, post, true);
  }

  document.addEventListener("pointerdown", event => {
    // ✅ V72 ADD - Comment Modal / Comment Like na like.js Thodave Koodathu da
    if (event.target.closest && (event.target.closest("#commentModal") || event.target.closest("[data-comment-like]") || event.target.closest("[data-like]"))) return;
    if (event.target.closest(
      "button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]"
    )) return;

    const post = getPost(event.target);
    if (!post) return;

    const postId = getPostId(event.target);
    if (!postId) return;

    const media = findMedia(event.target);
    if (!media) return;

    const now = Date.now();
    const previous = lastTap.get(postId);

    if (
      previous &&
      now - previous.time <= DOUBLE_TAP_DELAY
    ) {
      lastTap.delete(postId);

      handleDoubleTap(
        media,
        postId,
        post,
        event.clientX,
        event.clientY
      );
    } else {
      lastTap.set(postId, {
        time: now,
        x: event.clientX,
        y: event.clientY
      });
    }
  }, true);

  /* LIKE BUTTON CLICK */

  document.addEventListener("click", event => {
    // ✅ V72 ADD - Comment Modal / Comment Like na like.js Thodave Koodathu da
    if (event.target.closest && (event.target.closest("#commentModal") || event.target.closest("[data-comment-like]") || event.target.closest("[data-like]"))) return;
    const button = event.target.closest(
      "[data-like-btn], .like-btn, .like-button"
    );

    if (button) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const post = getPost(button);
      const postId = getPostId(button);

      if (!post || !postId) return;

      /* ✅ V73 CORRECTED DA - Like Button Click la Mela Heart Parakka Koodathu da - showUnlikeHeart Call ah Thookiten da */
      /* showUnlikeHeart(button); */

      buttonAnimation(post);
      toggleLike(postId, post, false);
      return;
    }

    if (
      Date.now() < suppressMediaClickUntil &&
      event.target.closest(
        ".postMedia, .post-media, .post-media-wrap"
      )
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  /* SERVER SYNC */

  async function syncVisiblePosts() {
    if (syncRunning) {
      syncAgain = true;
      return;
    }

    const posts = [...document.querySelectorAll(
      "article.post[data-post-id], .post[data-post-id]"
    )];

    const postMap = new Map();

    posts.forEach(post => {
      const id = String(
        post.dataset.postId || post.dataset.id || ""
      );

      if (id) postMap.set(id, post);
    });

    const ids = [...postMap.keys()];
    if (!ids.length) return;

    const supa = getSupa();
    const userId = await getUserId();

    if (!supa || !userId) {
      paintAll();
      return;
    }

    syncRunning = true;

    // Protect local clicks made while the server query is running.
    const startingRevisions = new Map();

    ids.forEach(id => {
      startingRevisions.set(id, revisions.get(id) || 0);
    });

    try {
      let allRows = [];
      let from = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supa
          .from(TABLE)
          .select("post_id,user_id")
          .in("post_id", ids)
          .range(from, from + pageSize - 1);

        if (error) throw error;

        const rows = data || [];
        allRows = allRows.concat(rows);

        if (rows.length < pageSize) break;

        from += pageSize;
      }

      const counts = {};
      const serverLiked = new Set();

      ids.forEach(id => counts[id] = 0);

      allRows.forEach(row => {
        const id = String(row.post_id);

        counts[id] = (counts[id] || 0) + 1;

        if (String(row.user_id) === String(userId)) {
          serverLiked.add(id);
        }
      });

      ids.forEach(id => {
        // Do not overwrite a newer local click.
        if (
          (revisions.get(id) || 0) !==
          startingRevisions.get(id)
        ) return;

        if (serverLiked.has(id)) {
          window.FEED_LIKES.add(id);
        } else {
          window.FEED_LIKES.delete(id);
        }

        window.FEED_COUNTS[id] = counts[id];
      });

      saveLocal();
      paintAll();

    } catch (error) {
      console.error("PIXORO SERVER SYNC ERROR:", error);
      paintAll();

    } finally {
      syncRunning = false;

      if (syncAgain) {
        syncAgain = false;
        setTimeout(syncVisiblePosts, 150);
      }
    }
  }

  window.pixoroSyncLikes = syncVisiblePosts;
  window.pixoroPaintAllLikes = paintAll;

  /* STYLES */

  function addStyles() {
    if (document.getElementById("pixoro-like-v75-css")) return;

    const style = document.createElement("style");
    style.id = "pixoro-like-v75-css";

    style.textContent = `
      .like-btn,
      .like-button,
      [data-like-btn] {
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        overflow: visible !important;
        cursor: pointer !important;
        -webkit-tap-highlight-color: transparent !important;
        min-width: 40px !important;
        min-height: 40px !important;
        padding: 5px !important;
        margin-left: 2px !important;
        flex-shrink: 0 !important;
      }

      .like-btn svg,
      .like-button svg,
      [data-like-btn] svg {
        transform-origin: center !important;
        flex-shrink: 0 !important;
        overflow: visible !important;
        width: 28px !important;
        height: 28px !important;
      }

      .like-btn.liked,
      .like-button.liked,
      [data-like-btn].liked {
        color: #FF3040 !important;
      }

      .like-btn.liked svg,
      .like-button.liked svg,
      [data-like-btn].liked svg,
      .like-btn.liked svg *,
      .like-button.liked svg * {
        fill: #FF3040 !important;
        stroke: #FF3040 !important;
      }

      .like-btn:not(.liked) svg,
      .like-button:not(.liked) svg,
      [data-like-btn]:not(.liked) svg {
        fill: none !important;
        stroke: #FFFFFF !important;
      }

      .pixoro-big-heart {
        pointer-events: none !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* ✅ CORRECTED DA - Unlike Heart ku Thaniya CSS da - 110px Rule Pudikkaathu da */
      .pixoro-unlike-heart {
        width: 44px !important;
        height: 44px !important;
        pointer-events: none !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      .pixoro-unlike-heart svg {
        width: 44px !important;
        height: 44px !important;
      }

      /* ✅ V73 - Comment Like - feed.css v1044 Kooda Match Aaganum da - 24px + Left da - like.js 16px Aakidathu da */
      #commentModal .pixoro-c-heart,
      #commentModal .pixoro-c-heart svg{
        width:24px!important; height:24px!important;
        margin-right:12px!important;
        animation:none!important; transform:none!important;
      }
      #commentModal .pixoro-c-heart:active{ transform:scale(1.1)!important; }
      #commentModal .pixoro-unlike-heart,
      #commentModal .pixoro-big-heart{ display:none!important; }

      /* ✅ Like Button Cut Aagaama - Parent Clip Panna Vidaama da */
      .post-actions, .post-footer, .actions, .post-action-bar, .rActions, .post-actions-row {
        overflow: visible !important;
        padding-left: 10px !important;
        padding-right: 6px !important;
      }

      [data-like-count],
      .like-count,
      .likes-count {
        flex-shrink: 0 !important;
      }
    `;

    document.head.appendChild(style);
  }

  /* EVENTS */

  function start() {
    addStyles();
    paintAll();
    syncVisiblePosts();
  }

  window.addEventListener("pixoro-feed-rendered", () => {
    setTimeout(syncVisiblePosts, 100);
  });

  window.addEventListener("pixoro-reels-rendered", () => {
    setTimeout(syncVisiblePosts, 100);
  });

  window.addEventListener("pixoro-supa-ready", () => {
    setTimeout(syncVisiblePosts, 100);
  });

  window.addEventListener("pixoro:login", () => {
    window.FEED_LIKES.clear();
    window.FEED_COUNTS = {};
    saveLocal();
    setTimeout(syncVisiblePosts, 100);
  });

  window.addEventListener("pixoro:logout", () => {
    window.ME_ID = null;
    window.FEED_LIKES.clear();
    window.FEED_COUNTS = {};
    saveLocal();
    paintAll();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, {
      once: true
    });
  } else {
    start();
  }

  console.log("PIXORO LIKE V75 READY ❤️");

  /* ===== ✅ V75 CORRECT ADD DA - Pazhaya 80ms ADD ah Delete Panniten da - MutationObserver da - Timing Thappu Illa da ===== */
  (function pixoroHomeHeartCorrectADD(){
    function addStyle(){
      if(document.getElementById("pixoro-home-heart-soft2")) return;
      var st = document.createElement("style");
      st.id = "pixoro-home-heart-soft2";
      st.textContent = `
        .pixoro-soft-float{
          position:fixed!important; z-index:999999!important; pointer-events:none!important;
          width:28px!important; height:28px!important;
          transform:translate(-50%,-50%) scale(1)!important; opacity:1!important;
        }
        .pixoro-soft-float svg{ width:28px!important; height:28px!important; display:block!important; }
      `;
      document.head.appendChild(st);
    }
    addStyle();
    var lastTouch = new WeakMap();
    document.addEventListener("pointerdown", function(e){
      var btn = e.target.closest ? e.target.closest("[data-like-btn], .like-btn, .like-button") : null;
      if(!btn || btn.closest("#commentModal")) return;
      lastTouch.set(btn, Date.now());
    }, true);
    function floatHeart(btn, liked){
      if(!btn || btn.closest("#commentModal")) return;
      var r = btn.getBoundingClientRect();
      if(!r.width) return;
      var d = document.createElement("div");
      d.className = "pixoro-soft-float";
      d.style.left = (r.left + r.width / 2) + "px";
      d.style.top = (r.top - 4) + "px";
      var fill = liked ? "#FF2D95" : "none";
      var stroke = liked ? "#FF2D95" : "#fff";
      d.innerHTML = '<svg viewBox="0 0 24 24" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
      document.body.appendChild(d);
      var anim = d.animate([
        { transform:"translate(-50%,-50%) scale(0.7)", opacity:0 },
        { transform:"translate(-50%,-50%) scale(1)", opacity:1, offset:0.2 },
        { transform:"translate(-50%,-140%) scale(0.95)", opacity:0.9, offset:0.6 },
        { transform:"translate(-50%,-260%) scale(0.8)", opacity:0 }
      ], { duration:1100, easing:"ease-out", fill:"forwards" });
      anim.onfinish = function(){ d.remove(); };
    }
    var prevLiked = new WeakMap();
    var obs = new MutationObserver(function(muts){
      muts.forEach(function(m){
        var btn = m.target;
        if(!btn.matches || !btn.matches("[data-like-btn], .like-btn, .like-button")) return;
        if(btn.closest("#commentModal")) return;
        var touched = lastTouch.get(btn) || 0;
        if(Date.now() - touched > 600) return;
        var nowLiked = btn.classList.contains("liked");
        if(prevLiked.get(btn) === nowLiked) return;
        prevLiked.set(btn, nowLiked);
        floatHeart(btn, nowLiked);
        var svg = btn.querySelector("svg");
        if(svg){
          svg.getAnimations().forEach(function(a){ a.cancel(); });
          svg.animate([
            { transform:"scale(1)" },
            { transform:"scale(1.06)", offset:0.4 },
            { transform:"scale(1)" }
          ], { duration:150, easing:"ease-out" });
        }
      });
    });
    obs.observe(document.documentElement, { attributes:true, attributeFilter:["class"], subtree:true });
  })();
})();
