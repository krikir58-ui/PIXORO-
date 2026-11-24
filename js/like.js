
/* ==========================================
   PIXORO LIKE V21 - COMPLETE
   Center Rainbow Heart + Slow Double Pulse
   Supabase Like / Unlike
========================================== */

(() => {
  "use strict";

  if (window._PIXORO_LIKE_V21) return;
  window._PIXORO_LIKE_V21 = true;

  console.log("PIXORO LIKE V21 LOADED ❤️");

  const likes = window.FEED_LIKES instanceof Set
    ? window.FEED_LIKES : new Set();

  window.FEED_LIKES = likes;

  const locks = new Set();
  const tapState = new Map();
  let meId = null;

  try {
    JSON.parse(localStorage.getItem("pixoro_likes") || "[]")
      .forEach(id => likes.add(String(id)));
  } catch(e) {}

  function saveLocal() {
    try {
      localStorage.setItem("pixoro_likes", JSON.stringify([...likes]));
    } catch(e) {}
  }

  function supa() {
    return window.getSupa ? window.getSupa() : window.supa;
  }

  function findButton(id) {
    return [...document.querySelectorAll("[data-like-btn]")]
      .find(b => String(b.getAttribute("data-like-btn")) === String(id));
  }

  function findCount(id) {
    return [...document.querySelectorAll("[data-like-count]")]
      .find(c => String(c.getAttribute("data-like-count")) === String(id));
  }

  // Animation CSS
  const css = document.createElement("style");
  css.id = "pixoro-like-v21-css";
  css.textContent = `
    [data-like-btn] {
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation;
      cursor: pointer;
    }

    [data-like-btn].liked svg,
    [data-like-btn].liked svg path {
      fill: #ff1744 !important;
      stroke: #ff1744 !important;
    }

    [data-like-btn].pix-heart-pulse svg {
      animation: pixButtonBeat .9s ease-in-out 1;
    }

    @keyframes pixButtonBeat {
      0% { transform: scale(1); }
      35% { transform: scale(1.25); }
      65% { transform: scale(.94); }
      100% { transform: scale(1); }
    }

    .pix-center-heart {
      position: fixed !important;
      width: 120px !important;
      height: 120px !important;
      top: 50% !important;
      left: 50% !important;
      z-index: 2147483000 !important;
      pointer-events: none !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      opacity: 0;
      animation: pixCenterBeat 1.4s ease-in-out forwards;
      filter: drop-shadow(0 5px 18px rgba(255,0,100,.4));
    }

    .pix-center-heart svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    @keyframes pixCenterBeat {
      0% {
        opacity: 0;
        transform: translate(-50%,-50%) scale(.2);
      }
      15% {
        opacity: 1;
        transform: translate(-50%,-50%) scale(1.15);
      }
      30% {
        transform: translate(-50%,-50%) scale(.95);
      }
      45% {
        transform: translate(-50%,-50%) scale(1.12);
      }
      60% {
        transform: translate(-50%,-50%) scale(.96);
      }
      75% {
        transform: translate(-50%,-50%) scale(1.04);
      }
      100% {
        opacity: 0;
        transform: translate(-50%,-50%) scale(.9);
      }
    }

    @media(prefers-reduced-motion:reduce) {
      .pix-center-heart,
      [data-like-btn].pix-heart-pulse svg {
        animation-duration: .01ms !important;
      }
    }
  `;

  document.getElementById(css.id)?.remove();
  document.head.appendChild(css);

  // Center gradient heart
  function showBigHeart() {
    document.querySelectorAll(".pix-center-heart")
      .forEach(h => h.remove());

    const id = "pixGradient" + Date.now();

    const heart = document.createElement("div");
    heart.className = "pix-center-heart";

    heart.innerHTML = `
      <svg viewBox="0 0 24 24">
        <defs>
          <linearGradient id="${id}"
            x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffb000"/>
            <stop offset="48%" stop-color="#ff315e"/>
            <stop offset="100%" stop-color="#e000ff"/>
          </linearGradient>
        </defs>
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"
          fill="url(#${id})"/>
      </svg>
    `;

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }

  function paintButton(btn, liked) {
    if (btn) btn.classList.toggle("liked", liked);
  }

  function pulseButton(btn) {
    if (!btn) return;

    btn.classList.remove("pix-heart-pulse");
    void btn.offsetWidth;
    btn.classList.add("pix-heart-pulse");

    setTimeout(() => btn.classList.remove("pix-heart-pulse"), 950);
  }

  function updateCount(id, value) {
    const el = findCount(id);
    if (el) el.textContent = Math.max(0, value);
  }

  async function getSession(s) {
    const { data, error } = await s.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      location.href = "./login.html";
      return null;
    }
    meId = data.session.user.id;
    window.ME_ID = meId;
    return meId;
  }

  // Load actual likes from Supabase
  async function pixoroLoadMyLikes() {
    const s = supa();
    if (!s) return;

    try {
      const userId = await getSession(s);
      if (!userId) return;

      const { data, error } = await s
        .from("likes")
        .select("post_id")
        .eq("user_id", userId);

      if (error) throw error;

      likes.clear();
      (data || []).forEach(row => likes.add(String(row.post_id)));

      saveLocal();
      pixoroPaintAllLikes();

    } catch(e) {
      console.error("PIXORO LOAD LIKES:", e.message);
    }
  }

  function pixoroPaintAllLikes() {
    document.querySelectorAll("[data-like-btn]").forEach(btn => {
      const id = String(btn.getAttribute("data-like-btn"));
      paintButton(btn, likes.has(id));
    });
  }

  // Get actual count, avoids client-side count drift
  async function refreshCount(s, id) {
    const { count, error } = await s
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    if (!error && count !== null) updateCount(id, count);
  }

  // Like / Unlike
  async function pixoroToggleLike(postId, btn) {
    postId = String(postId);

    if (locks.has(postId)) return false;

    const s = supa();
    if (!s) return false;

    btn = btn || findButton(postId);
    if (!btn) return false;

    locks.add(postId);

    const wasLiked = likes.has(postId);

    try {
      const userId = await getSession(s);
      if (!userId) return false;

      if (wasLiked) {
        const { error } = await s
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;

        likes.delete(postId);

      } else {
        const { error } = await s
          .from("likes")
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error && error.code !== "23505") throw error;

        likes.add(postId);
        pulseButton(btn);
      }

      paintButton(btn, !wasLiked);
      saveLocal();

      await refreshCount(s, postId);
      return !wasLiked;

    } catch(e) {
      console.error("PIXORO LIKE ERROR:", e.message);
      return wasLiked;
    } finally {
      locks.delete(postId);
    }
  }

  // Double tap: like only, never unlike
  async function pixoroDoubleTapLike(postId) {
    postId = String(postId);

    showBigHeart();

    if (likes.has(postId)) return true;

    const btn = findButton(postId);
    if (!btn) return false;

    return await pixoroToggleLike(postId, btn);
  }

  // Feed double-tap handler
  window.pixoroFeedTap = function(postId, el, ev) {
    if (ev?.target?.closest?.(
      "button, a, input, [data-like-btn]"
    )) return;

    if (ev?.cancelable) ev.preventDefault();

    const now = Date.now();
    const previous = tapState.get(String(postId));

    if (previous && now - previous.time < 450) {
      clearTimeout(previous.timer);
      tapState.delete(String(postId));
      pixoroDoubleTapLike(postId);
      return;
    }

    const state = {
      time: now,
      timer: setTimeout(() => {
        if (tapState.get(String(postId)) !== state) return;

        tapState.delete(String(postId));

        const video = el?.querySelector?.("video");
        if (video) {
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        }
      }, 470)
    };

    tapState.set(String(postId), state);
  };

  // Like button click handler
  if (!window._pixoroLikeV21Click) {
    window._pixoroLikeV21Click = true;

    document.addEventListener("click", e => {
      const btn = e.target.closest?.("[data-like-btn]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      pixoroToggleLike(
        btn.getAttribute("data-like-btn"),
        btn
      );
    }, true);
  }

  // Public functions
  window.pixoroToggleLike = pixoroToggleLike;
  window.pixoroDoubleTapLike = pixoroDoubleTapLike;
  window.showBigHeart = showBigHeart;
  window.pixoroPaintLikeBtn = paintButton;
  window.pixoroPaintAllLikes = pixoroPaintAllLikes;
  window.pixoroLoadMyLikes = pixoroLoadMyLikes;

  function init() {
    pixoroPaintAllLikes();
    pixoroLoadMyLikes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.addEventListener("pixoroFeedLoaded", () => {
    setTimeout(pixoroPaintAllLikes, 100);
  });

})();
