
/* =====================================================
   PIXORO LIKE SYSTEM V22
   Double Tap Heart + Rainbow Animation + Supabase Likes
   Replace the complete old js/like.js with this file.
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V22) return;
  window.PIXORO_LIKE_V22 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 280;

  const busyPosts = new Set();
  const lastTap = new WeakMap();

  if (!supa) {
    console.error("PIXORO: Supabase client not found.");
    return;
  }

  /* ---------- USER ---------- */

  async function getUserId() {
    if (window.currentUser?.id) return window.currentUser.id;

    const { data, error } = await supa.auth.getUser();

    if (error || !data?.user?.id) return null;

    return data.user.id;
  }

  /* ---------- POST HELPERS ---------- */

  function getPostElement(element) {
    return element.closest(
      "[data-post-id], .post, .post-card, article, .post-item"
    );
  }

  function getPostId(element) {
    const post = getPostElement(element);

    return (
      element.dataset.postId ||
      post?.dataset.postId ||
      post?.dataset.id ||
      element.closest("[data-post-id]")?.dataset.postId ||
      null
    );
  }

  function getLikeButton(postId, post) {
    if (!post) return null;

    return (
      post.querySelector(`[data-like-btn="${postId}"]`) ||
      post.querySelector(".like-btn") ||
      post.querySelector(".like-button") ||
      post.querySelector('[data-action="like"]')
    );
  }

  function getLikeCount(postId, post) {
    if (!post) return null;

    return (
      post.querySelector(`[data-like-count="${postId}"]`) ||
      post.querySelector(".like-count") ||
      post.querySelector(".likes-count") ||
      post.querySelector('[data-count="likes"]')
    );
  }

  /* ---------- BUTTON DESIGN ---------- */

  function paintLike(postId, liked, post) {
    const button = getLikeButton(postId, post);

    if (!button) return;

    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));

    const icon =
      button.querySelector("i, svg, span") || button;

    if (icon.tagName === "I") {
      icon.classList.toggle("active", liked);
    }

    button.style.color = liked ? "#ff315d" : "";
  }

  function paintCount(postId, count, post) {
    const countElement = getLikeCount(postId, post);

    if (countElement) {
      countElement.textContent = Number(count) || 0;
    }
  }

  /* ---------- RAINBOW HEART CSS ---------- */

  function addHeartStyles() {
    if (document.getElementById("pixoro-like-v22-css")) return;

    const style = document.createElement("style");
    style.id = "pixoro-like-v22-css";

    style.textContent = `
      .pixoro-big-heart {
        position: fixed;
        z-index: 999999;
        pointer-events: none;
        font-size: 105px;
        line-height: 1;
        background: linear-gradient(
          45deg,
          #ff1744,
          #ff9100,
          #ffea00,
          #00e676,
          #00b0ff,
          #7c4dff,
          #ff1744
        );
        background-size: 300% 300%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 5px 18px rgba(255, 45, 120, .4));
        transform: translate(-50%, -50%) scale(.2);
        animation:
          pixoroHeartPop 1.05s ease forwards,
          pixoroRainbow 1.8s linear infinite;
      }

      @keyframes pixoroHeartPop {
        0% {
          transform: translate(-50%, -50%) scale(.2);
          opacity: 0;
        }
        18% {
          transform: translate(-50%, -50%) scale(1.18);
          opacity: 1;
        }
        32% {
          transform: translate(-50%, -50%) scale(.92);
          opacity: 1;
        }
        48% {
          transform: translate(-50%, -50%) scale(1.12);
          opacity: 1;
        }
        65% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(.85);
          opacity: 0;
        }
      }

      @keyframes pixoroRainbow {
        from { background-position: 0% 50%; }
        to { background-position: 300% 50%; }
      }

      .like-btn.liked,
      .like-button.liked,
      .like-btn.is-liked,
      .like-button.is-liked {
        color: #ff315d !important;
      }

      .pixoro-like-loading {
        opacity: .65;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);
  }

  /* ---------- HEART ANIMATION ---------- */

  function showBigHeart(media) {
    if (!media) return;

    const rect = media.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const heart = document.createElement("div");

    heart.className = "pixoro-big-heart";
    heart.textContent = "♥";

    heart.style.left = `${rect.left + rect.width / 2}px`;
    heart.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 1150);
  }

  /* ---------- DATABASE COUNT ---------- */

  async function getLikeCountFromDB(postId) {
    const { count, error } = await supa
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("PIXORO like count error:", error);
      return null;
    }

    return count ?? 0;
  }

  /* ---------- LIKE / UNLIKE ---------- */

  async function toggleLike(postId, post, forceLike = false) {
    if (!postId || busyPosts.has(postId)) return;

    const userId = await getUserId();

    if (!userId) {
      alert("Please login to like this post.");
      return;
    }

    busyPosts.add(postId);

    const button = getLikeButton(postId, post);

    button?.classList.add("pixoro-like-loading");

    try {
      const { data: existing, error: checkError } = await supa
        .from(TABLE)
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        if (forceLike) {
          paintLike(postId, true, post);
        } else {
          const { error } = await supa
            .from(TABLE)
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);

          if (error) throw error;

          paintLike(postId, false, post);
        }
      } else {
        const { error } = await supa
          .from(TABLE)
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;

        paintLike(postId, true, post);
      }

      const count = await getLikeCountFromDB(postId);

      if (count !== null) {
        paintCount(postId, count, post);
      }

    } catch (error) {
      console.error("PIXORO like failed:", error);
      alert("Like update failed. Please try again.");
    } finally {
      button?.classList.remove("pixoro-like-loading");
      busyPosts.delete(postId);
    }
  }

  /* ---------- DOUBLE TAP MEDIA ---------- */

  function findMedia(element) {
    return element.closest(
      ".postMedia, .post-media, .post-media-wrap, .post-content, img, video"
    );
  }

  document.addEventListener("pointerup", async (event) => {
    if (event.button !== 0) return;

    if (event.target.closest(
      "button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]"
    )) return;

    const media = findMedia(event.target);

    if (!media) return;

    const post = getPostElement(media);
    const postId = getPostId(media);

    if (!post || !postId) return;

    const now = Date.now();
    const previous = lastTap.get(media);

    const currentTap = {
      time: now,
      x: event.clientX,
      y: event.clientY
    };

    lastTap.set(media, currentTap);

    if (
      previous &&
      now - previous.time <= DOUBLE_TAP_DELAY &&
      Math.hypot(
        event.clientX - previous.x,
        event.clientY - previous.y
      ) < 45
    ) {
      lastTap.delete(media);

      showBigHeart(media);

      // Double tap only likes; it does not unlike.
      await toggleLike(postId, post, true);
    }
  });

  /* ---------- LIKE BUTTON CLICK ---------- */

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(
      "[data-like-btn], .like-btn, .like-button, [data-action='like']"
    );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const post = getPostElement(button);
    const postId =
      button.dataset.likeBtn ||
      button.dataset.postId ||
      post?.dataset.postId ||
      post?.dataset.id;

    if (!postId) {
      console.warn("PIXORO: Like button has no post ID.", button);
      return;
    }

    await toggleLike(postId, post, false);
  });

  /* ---------- INITIAL LIKE STATUS ---------- */

  async function loadMyLikes() {
    const userId = await getUserId();

    if (!userId) return;

    const { data, error } = await supa
      .from(TABLE)
      .select("post_id")
      .eq("user_id", userId);

    if (error) {
      console.error("PIXORO load likes error:", error);
      return;
    }

    document.querySelectorAll(
      "[data-post-id], .post, .post-card, article, .post-item"
    ).forEach((post) => {
      const postId = post.dataset.postId || post.dataset.id;
      if (!postId) return;

      const liked = (data || []).some(
        (item) => String(item.post_id) === String(postId)
      );

      paintLike(postId, liked, post);
    });
  }

  /* ---------- PUBLIC FUNCTION ---------- */

  window.pixoroToggleLike = toggleLike;

  window.pixoroFeedTap = function (postId, element) {
    const media = findMedia(element || document.querySelector(
      `[data-post-id="${postId}"]`
    ));

    if (media) showBigHeart(media);

    return toggleLike(postId, getPostElement(element), true);
  };

  /* ---------- START ---------- */

  addHeartStyles();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMyLikes);
  } else {
    loadMyLikes();
  }

  // Load again after login if the page is already open.
  window.addEventListener("pixoro:login", loadMyLikes);

  console.log("PIXORO Like V22 loaded successfully.");
})();
