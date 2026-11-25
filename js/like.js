/* =====================================================
   PIXORO LIKE SYSTEM V39 + INSTAGRAM FLOATING HEARTS
   Instagram Double Tap Like + Tap Floating Hearts
   Mobile + Desktop + Supabase
   Single Like System
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V39) return;
  window.PIXORO_LIKE_V39 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";

  const DOUBLE_TAP_DELAY = 320;
  const HEART_DURATION = 900;

  const lastTap = new WeakMap();
  const lastToggleAt = new Map();
  const pending = new Map();

  let blockClickUntil = 0;
  let lastTouchTime = 0;

  // =========================================
  // LOCAL LIKE STORAGE
  // =========================================

  try {
    const saved = JSON.parse(
      localStorage.getItem("pixoro_likes") || "[]"
    );

    window.FEED_LIKES = new Set(saved.map(String));

  } catch {
    window.FEED_LIKES = new Set();
  }

  try {
    window.FEED_COUNTS = JSON.parse(
      localStorage.getItem("pixoro_counts") || "{}"
    );
  } catch {
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
    return element?.closest(
      "[data-post-id], .post, .post-card, article, .post-item"
    );
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

    return post.querySelector(
      "[data-like-btn], .like-btn, .like-button, [data-action='like']"
    );
  }

  function getLikeCount(post) {
    if (!post) return null;

    return post.querySelector(
      "[data-like-count], .like-count, .likes-count, [data-count='likes']"
    );
  }

  // =========================================
  // LIKE UI
  // =========================================

  function paintLike(post, liked) {
    const button = getLikeButton(post);
    if (!button) return;

    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.dataset.liked = liked ? "true" : "false";

    button.style.setProperty(
      "color",
      liked ? "#FF3040" : "",
      "important"
    );

    button.querySelectorAll("svg, i, path").forEach(el => {
      if (el.tagName === "SVG" || el.tagName === "PATH") {
        el.style.setProperty(
          "fill",
          liked ? "#FF3040" : "none",
          "important"
        );

        el.style.setProperty(
          "stroke",
          liked ? "#FF3040" : "",
          "important"
        );
      }

      if (el.tagName === "I") {
        el.style.setProperty(
          "color",
          liked ? "#FF3040" : "",
          "important"
        );
      }
    });
  }

  function paintCount(post, count) {
    const el = getLikeCount(post);

    if (el) {
      el.textContent = Math.max(0, Number(count) || 0);
    }
  }

  // =========================================
  // HEART ANIMATION - 900MS - PAZHAYA CODE SAME DA
  // =========================================

  function showBigHeart(media) {
    if (!media) return;

    const rect = media.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const heart = document.createElement("div");

    heart.className = "pixoro-big-heart";

    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${rect.left + rect.width / 2}px;
      top:${rect.top + rect.height / 2}px;
      width:120px;
      height:120px;
      opacity:0;
      transform:translate(-50%,-50%) scale(0);
    `;

    heart.innerHTML = `
      <svg viewBox="0 0 24 24"
        style="width:100%;height:100%;
        filter:drop-shadow(0 5px 15px rgba(0,0,0,.4))">
        <path fill="#fff"
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>
    `;

    document.body.appendChild(heart);

    const animation = heart.animate([
      {
        transform: "translate(-50%,-50%) scale(0)",
        opacity: 0
      },
      {
        transform: "translate(-50%,-50%) scale(1.2)",
        opacity: 1,
        offset: 0.3
      },
      {
        transform: "translate(-50%,-50%) scale(1)",
        opacity: 1,
        offset: 0.6
      },
      {
        transform: "translate(-50%,-50%) scale(.9)",
        opacity: 0
      }
    ], {
      duration: HEART_DURATION,
      easing: "ease-out",
      fill: "forwards"
    });

    animation.onfinish = () => heart.remove();
  }

  // =========================================
  // ✅ CORRECT ONLY - OREY CHINNA COLOUR HEART DA
  // =========================================

  const HEART_COLORS = ['#FF0A33','#FF5EA8','#FF8A00','#FFD600','#FF3DF0','#A259FF','#00D2FF','#FF2E63','#FF6B6B','#00FF88'];
  let colorIndex = 0; // ✅ ADD ONLY - Colour Colour ah Maarum da

  function showTapHeart(x, y) {
    if (!x || !y) return;

    // ✅ CORRECT ONLY - Pazhaya Heart Irundha Delete Pannidu da - OREY Heart Thaan Varum da
    document.querySelectorAll('.pixoro-tap-heart, .pixoro-big-heart').forEach(h => h.remove());

    // ✅ CORRECT ONLY - Colour Colour ah Maarum da
    const c = HEART_COLORS[colorIndex % HEART_COLORS.length];
    colorIndex++;

    const size = 42; // ✅ CORRECT ONLY - Chinna Heart da - 42px Mattum da
    const heart = document.createElement("div");
    heart.className = "pixoro-tap-heart";
    heart.style.cssText = `
      position:fixed;
      z-index:999999;
      pointer-events:none;
      left:${x}px;
      top:${y}px;
      width:${size}px;
      height:${size}px;
      opacity:1;
      transform:translate(-50%,-50%) scale(0);
    `;
    heart.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(0,0,0,.4))"><path fill="${c}" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(heart);
    try {
      const a = heart.animate([
        { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1, offset:0 },
        { transform:'translate(-50%,-50%) scale(1.25) rotate(10deg)', opacity:1, offset:.3 },
        { transform:'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity:1, offset:.6 },
        { transform:'translate(-50%,-40%) scale(1.1) rotate(5deg)', opacity:1, offset:.8 },
        { transform:'translate(-50%,-50%) scale(1) rotate(0deg)', opacity:0, offset:1 }
      ], { duration: 900, easing: 'ease-out' });
      a.onfinish = () => heart.remove();
    } catch(e) { setTimeout(()=>heart.remove(), 900); }
    setTimeout(()=>{ try{heart.remove()}catch(e){} }, 1000);
  }

  // =========================================
  // PAZHAYA MASS DANCE CODE SAME DA - USE PANNALA DA
  // =========================================

  function showMassDance(media) {
    if (!media) return;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const mainColor = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const main = document.createElement("div");
    main.className = "pixoro-big-heart";
    main.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${cx}px;top:${cy}px;width:130px;height:130px;opacity:0;transform:translate(-50%,-50%) scale(0);`;
    main.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))"><path fill="${mainColor}" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
    document.body.appendChild(main);
    try {
      const a = main.animate([
        { transform:"translate(-50%,-50%) scale(0) rotate(-10deg)", opacity:0, offset:0 },
        { transform:"translate(-50%,-50%) scale(1.35) rotate(8deg)", opacity:1, offset:.25 },
        { transform:"translate(-50%,-50%) scale(1.1) rotate(-8deg)", opacity:1, offset:.45 },
        { transform:"translate(-50%,-50%) scale(1.25) rotate(8deg)", opacity:1, offset:.65 },
        { transform:"translate(-50%,-50%) scale(1) rotate(-5deg)", opacity:1, offset:.8 },
        { transform:"translate(-50%,-50%) scale(1.15) rotate(0deg)", opacity:0, offset:1 }
      ], { duration: 1100, easing:"ease-out", fill:"forwards" });
      a.onfinish = () => main.remove();
    } catch(e) { setTimeout(()=>main.remove(), 1100); }
    setTimeout(()=>{ try{main.remove()}catch(e){} }, 1300);
    for (let i = 0; i < 10; i++) {
      const c = HEART_COLORS[i % HEART_COLORS.length];
      const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 90 + Math.random() * 110;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 70;
      const size = 26 + Math.random() * 28;
      const delay = i * 35;
      const h = document.createElement("div");
      h.className = "pixoro-tap-heart";
      h.style.cssText = `position:fixed;z-index:999999;pointer-events:none;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;opacity:0;transform:translate(-50%,-50%) scale(0);`;
      h.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45))"><path fill="${c}" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
      document.body.appendChild(h);
      setTimeout(() => {
        try {
          const a2 = h.animate([
            { transform:"translate(-50%,-50%) scale(0) rotate(0deg)", opacity:0, offset:0 },
            { transform:`translate(calc(-50% + ${dx*0.4}px), calc(-50% + ${dy*0.4}px)) scale(1.3) rotate(18deg)`, opacity:1, offset:.3 },
            { transform:`translate(calc(-50% + ${dx*0.7}px), calc(-50% + ${dy*0.7}px)) scale(1.1) rotate(-18deg)`, opacity:1, offset:.55 },
            { transform:`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(12deg)`, opacity:1, offset:.75 },
            { transform:`translate(calc(-50% + ${dx*1.2}px), calc(-50% + ${dy - 50}px)) scale(.8) rotate(0deg)`, opacity:0, offset:1 }
          ], { duration: 1050, easing:"ease-out" });
          a2.onfinish = () => h.remove();
        } catch(e) { setTimeout(()=>h.remove(), 1050); }
      }, delay);
      setTimeout(()=>{ try{h.remove()}catch(e){} }, 1500 + delay);
    }
  }

  // =========================================
  // BUTTON ANIMATION
  // =========================================

  function buttonAnimation(post) {
    const button = getLikeButton(post);
    if (!button) return;

    button.classList.remove("pixoro-thudikku");

    void button.offsetWidth;

    button.classList.add("pixoro-thudikku");

    setTimeout(() => {
      button.classList.remove("pixoro-thudikku");
    }, 400);
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
        const { error } = await supa
          .from(TABLE)
          .insert({
            post_id: postId,
            user_id: userId
          });

        // Duplicate Like is already saved.
        if (error && error.code !== "23505") {
          throw error;
        }

      } else {
        const { error } = await supa
          .from(TABLE)
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

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

      const current = Number(
        window.FEED_COUNTS[postId] || 0
      );

      if (current < 1) {
        window.FEED_COUNTS[postId] = 1;
        saveLocal();
      }

      paintCount(post, Math.max(1, current));

      return true;
    }

    let countElement = getLikeCount(post);

    let oldCount = Number(
      window.FEED_COUNTS[postId] ??
      countElement?.textContent ??
      0
    );

    let newCount = willLike
      ? oldCount + 1
      : Math.max(0, oldCount - 1);

    if (willLike) {
      window.FEED_LIKES.add(postId);
    } else {
      window.FEED_LIKES.delete(postId);
    }

    window.FEED_COUNTS[postId] = newCount;

    paintLike(post, willLike);
    paintCount(post, newCount);

    saveLocal();

    // Serialize saves per post to avoid request races.
    const previousSave = pending.get(postId) || Promise.resolve();

    const nextSave = previousSave
      .catch(() => {})
      .then(() => serverSave(postId, willLike));

    pending.set(postId, nextSave);

    nextSave.finally(() => {
      if (pending.get(postId) === nextSave) {
        pending.delete(postId);
      }
    });

    return willLike;
  }

  // =========================================
  // MEDIA DETECTION
  // =========================================

  function findMedia(element) {
    if (!element?.closest) return null;

    return element.closest(
      ".postMedia, .post-media, .post-media-wrap, .post-content img, .post-content video, img, video"
    );
  }

  // =========================================
  // ✅ CORRECT ONLY - DOUBLE TAP - Photo Thotta Like Varathu da
  // =========================================

  function handleDoubleTap(media, postId, post) {
    blockClickUntil = Date.now() + 700;

    // ✅ CORRECT - OREY Chinna Colour Heart Mattum da - Mass Dance Illa da, Like Illa da
    if (media) {
      const r = media.getBoundingClientRect();
      showTapHeart(r.left + r.width / 2, r.top + r.height / 2);
    }
    // showMassDance(media); // ❌ Nariya Heart Varathu - Ippo Koopdala da
    // toggleLike(postId, post, true); // ❌ Photo Thotta Like Varathu - Ippo Remove da
    // buttonAnimation(post); // Pazhaya Code Same - Theva Illa da
  }

  // =========================================
  // MOBILE TOUCH
  // =========================================

  document.addEventListener("touchstart", event => {

    if (event.target.closest(
      "button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]"
    )) return;

    const media = findMedia(event.target);
    if (!media) return;

    const post = getPost(media);
    const postId = getPostId(media);

    if (!post || !postId) return;

    const now = Date.now();
    const previous = lastTap.get(media);

    lastTap.set(media, { time: now });

    // ✅ NEW ONLY - Thotta Edathula Heart Parakkum da
    const touch = event.touches && event.touches[0];
    if (touch) showTapHeart(touch.clientX, touch.clientY);

    if (
      previous &&
      now - previous.time <= DOUBLE_TAP_DELAY
    ) {
      lastTap.delete(media);

      lastTouchTime = now;

      handleDoubleTap(media, postId, post);
    }

  }, { passive: true });

  // =========================================
  // LAPTOP DOUBLE CLICK
  // =========================================

  document.addEventListener("dblclick", event => {

    if (Date.now() - lastTouchTime < 800) return;

    if (event.target.closest(
      "button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]"
    )) return;

    const media = findMedia(event.target);
    if (!media) return;

    const post = getPost(media);
    const postId = getPostId(media);

    if (!post || !postId) return;

    event.preventDefault();

    handleDoubleTap(media, postId, post);

  });

  // =========================================
  // LAPTOP SINGLE CLICK - ✅ NEW ONLY - Thotta Edathula Heart da
  // =========================================

  document.addEventListener("click", event => {
    const btnCheck = event.target.closest("[data-like-btn], .like-btn, .like-button, [data-action='like']");
    if (!btnCheck && Date.now() >= blockClickUntil) {
      const mediaOnly = findMedia(event.target);
      if (mediaOnly && !event.target.closest("button, a, input, textarea, select")) {
        showTapHeart(event.clientX, event.clientY);
      }
    }
  }, true);

  // =========================================
  // NORMAL LIKE BUTTON CLICK - Ithu Mattum Thaan Like Varum da ✅
  // =========================================

  document.addEventListener("click", event => {

    // Ignore synthetic click after double tap.
    if (Date.now() < blockClickUntil) {
      const media = findMedia(event.target);

      if (media) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }

    const button = event.target.closest(
      "[data-like-btn], .like-btn, .like-button, [data-action='like']"
    );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const post = getPost(button);
    const postId = getPostId(button);

    if (!post || !postId) return;

    // ✅ NEW ONLY - Like Button Mela Irundhu Heart Parakkum da
    const r = button.getBoundingClientRect();
    showTapHeart(r.left + r.width / 2, r.top - 10);

    buttonAnimation(post);

    toggleLike(postId, post, false);

  }, true);

  // =========================================
  // PAINT ALL POSTS
  // =========================================

  function paintAll() {

    document.querySelectorAll(
      "[data-post-id], .post, .post-card, article, .post-item"
    ).forEach(post => {

      const postId = String(
        post.dataset.postId || post.dataset.id || ""
      );

      if (!postId) return;

      const liked = window.FEED_LIKES.has(postId);

      paintLike(post, liked);

      const count = Number(
        window.FEED_COUNTS[postId] ?? 
        getLikeCount(post)?.textContent ??
        0
      );

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
      const { data, error } = await supa
        .from(TABLE)
        .select("post_id")
        .eq("user_id", userId);

      if (error) throw error;

      const serverLikes = new Set(
        (data || []).map(item => String(item.post_id))
      );

      // Replace local liked state with server state.
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

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // =========================================
  // CSS
  // =========================================

  function addStyles() {

    if (document.getElementById("pixoro-v39-css")) return;

    const style = document.createElement("style");

    style.id = "pixoro-v39-css";

    style.textContent = `
      .pixoro-thudikku {
        animation: pixoroButtonPop .4s ease;
      }

      @keyframes pixoroButtonPop {
        0% { transform:scale(1); }
        40% { transform:scale(1.2); }
        100% { transform:scale(1); }
      }

      .like-btn.liked,
      .like-button.liked,
      .like-btn.is-liked,
      .like-button.is-liked {
        color:#FF3040 !important;
      }

      .like-btn.liked svg,
      .like-button.liked svg {
        fill:#FF3040 !important;
      }

      .pixoro-big-heart {
        pointer-events:none !important;
      }
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
    document.addEventListener("DOMContentLoaded", start, {
      once: true
    });
  } else {
    start();
  }

  window.addEventListener("pixoro:login", loadMyLikes);

  console.log("PIXORO LIKE V39 LOADED ❤️");

})();
