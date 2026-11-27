/* =====================================================
   PIXORO LIKE V59
   LIKE / UNLIKE
   DOUBLE TAP HEART
   SUPABASE SAVE
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

  window.FEED_LIKES = window.FEED_LIKES || new Set();
  window.FEED_COUNTS = window.FEED_COUNTS || {};

  function getClient() {
    return window.getSupa
      ? window.getSupa()
      : window.supa || window.supabaseClient || null;
  }

  function getUserId() {
    return window.currentUser?.id ||
      window.user?.id ||
      window.currentUserId ||
      null;
  }

  function getPost(element) {
    return element?.closest("article.post[data-post-id]") ||
      element?.closest("[data-post-id]");
  }

  function getPostId(element) {
    const post = getPost(element);
    return post?.dataset.postId ||
      post?.dataset.id ||
      null;
  }

  function getLikeButton(post) {
    return post?.querySelector(
      '.like-btn, [data-like-btn], [data-action="like"]'
    );
  }

  function getLikeCount(post) {
    return post?.querySelector(
      ".like-count, [data-like-count]"
    );
  }

  function isLiked(id) {
    return window.FEED_LIKES.has(String(id));
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
    } catch (e) {}
  }

  function loadLocal() {
    try {
      const likes = JSON.parse(
        localStorage.getItem("pixoro_likes") || "[]"
      );

      const counts = JSON.parse(
        localStorage.getItem("pixoro_counts") || "{}"
      );

      window.FEED_LIKES = new Set(
        likes.map(String)
      );

      window.FEED_COUNTS = counts || {};
    } catch (e) {}
  }

  function paintLike(post) {
    if (!post) return;

    const id = getPostId(post);
    if (!id) return;

    const button = getLikeButton(post);
    if (!button) return;

    const liked = isLiked(id);

    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));

    const icon = button.querySelector(
      "svg, i, .like-icon"
    );

    if (icon) {
      icon.classList.toggle("liked", liked);
    }

    button.style.color = liked ? "#ff3040" : "";
  }

  function paintCount(post) {
    if (!post) return;

    const id = getPostId(post);
    if (!id) return;

    const countElement = getLikeCount(post);
    if (!countElement) return;

    const value = Number(
      window.FEED_COUNTS[id] ??
      countElement.textContent ??
      0
    );

    countElement.textContent = Math.max(0, value);
  }

  function paintAll() {
    document.querySelectorAll(
      "article.post[data-post-id]"
    ).forEach(post => {
      paintLike(post);
      paintCount(post);
    });
  }

  function showBigHeart(media) {
    if (!media) return;

    const old = media.querySelector(".pixoro-big-heart");
    if (old) old.remove();

    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.textContent = "♥";

    Object.assign(heart.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%) scale(.3)",
      fontSize: "100px",
      color: "#ff3040",
      pointerEvents: "none",
      zIndex: "999",
      opacity: "0",
      transition: "transform .25s ease, opacity .25s ease",
      textShadow: "0 3px 20px rgba(0,0,0,.25)"
    });

    const position = getComputedStyle(media).position;

    if (position === "static") {
      media.style.position = "relative";
    }

    media.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.opacity = "1";
      heart.style.transform =
        "translate(-50%, -50%) scale(1.2)";
    });

    setTimeout(() => {
      heart.style.opacity = "0";
      heart.style.transform =
        "translate(-50%, -50%) scale(1.6)";
    }, 450);

    setTimeout(() => heart.remove(), 750);
  }

  function getMedia(post) {
    return post?.querySelector(
      ".post-media, .postMedia, .post-media-wrap"
    );
  }

  async function serverSave(postId, liked) {
    if (!client || !currentUserId) return;

    try {
      if (liked) {
        const { error } = await client
          .from(LIKES_TABLE)
          .upsert(
            {
              post_id: postId,
              user_id: currentUserId
            },
            {
              onConflict: "post_id,user_id"
            }
          );

        if (error) throw error;
      } else {
        const { error } = await client
          .from(LIKES_TABLE)
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUserId);

        if (error) throw error;
      }
    } catch (error) {
      console.error("PIXORO LIKE SAVE ERROR:", error);
    }
  }

  async function toggleLike(post, doubleTap) {
    const postId = getPostId(post);
    if (!postId || busy.has(postId)) return;

    const oldLiked = isLiked(postId);

    busy.add(postId);

    const countElement = getLikeCount(post);

    const oldCount = Number(
      window.FEED_COUNTS[postId] ??
      countElement?.textContent ??
      0
    );

    const newLiked = !oldLiked;

    if (newLiked) {
      window.FEED_LIKES.add(postId);
    } else {
      window.FEED_LIKES.delete(postId);
    }

    window.FEED_COUNTS[postId] = Math.max(
      0,
      oldCount + (newLiked ? 1 : -1)
    );

    paintLike(post);
    paintCount(post);
    saveLocal();

    if (doubleTap && newLiked) {
      showBigHeart(getMedia(post));
    }

    await serverSave(postId, newLiked);

    busy.delete(postId);
  }

  async function loadMyLikes() {
    client = getClient();
    currentUserId = getUserId();

    if (!client || !currentUserId) {
      paintAll();
      return;
    }

    try {
      const { data, error } = await client
        .from(LIKES_TABLE)
        .select("post_id")
        .eq("user_id", currentUserId);

      if (error) throw error;

      window.FEED_LIKES = new Set(
        (data || []).map(row => String(row.post_id))
      );

      saveLocal();
      paintAll();

    } catch (error) {
      console.error("PIXORO LOAD LIKES ERROR:", error);
      paintAll();
    }
  }

  /* LIKE BUTTON CLICK */

  document.addEventListener("click", function (event) {
    const button = event.target.closest(
      '.like-btn, [data-like-btn], [data-action="like"]'
    );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const post = getPost(button);
    if (!post) return;

    toggleLike(post, false);
  }, true);

  /* DOUBLE TAP MEDIA */

  document.addEventListener("touchend", function (event) {
    const media = event.target.closest(
      ".post-media, .postMedia, .post-media-wrap"
    );

    if (!media) return;

    if (event.target.closest(
      "button, a, input, textarea, select"
    )) return;

    const post = getPost(media);
    if (!post) return;

    const now = Date.now();
    const postId = getPostId(post);

    if (
      lastTapPost === postId &&
      now - lastTap < 320
    ) {
      event.preventDefault();

      if (!isLiked(postId)) {
        toggleLike(post, true);
      } else {
        showBigHeart(media);
      }

      lastTap = 0;
      lastTapPost = null;
      return;
    }

    lastTap = now;
    lastTapPost = postId;

  }, { passive: false });

  /* DOUBLE CLICK FOR DESKTOP */

  document.addEventListener("dblclick", function (event) {
    const media = event.target.closest(
      ".post-media, .postMedia, .post-media-wrap"
    );

    if (!media) return;

    if (event.target.closest(
      "button, a, input, textarea, select"
    )) return;

    const post = getPost(media);
    if (!post) return;

    const postId = getPostId(post);

    if (!isLiked(postId)) {
      toggleLike(post, true);
    } else {
      showBigHeart(media);
    }
  });

  /* FEED RE-RENDER SUPPORT */

  window.pixoroPaintAllLikes = paintAll;
  window.pixoroLoadLikes = loadMyLikes;
  window.pixoroToggleLike = toggleLike;

  document.addEventListener(
    "pixoro-feed-rendered",
    paintAll
  );

  /* START */

  loadLocal();
  paintAll();

  setTimeout(loadMyLikes, 500);

})();
