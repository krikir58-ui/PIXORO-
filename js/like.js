/* =====================================================
   PIXORO LIKE SYSTEM V23 - FIXED
   Single = Slow Thudikku Mattum / Double = Safe Area White Heart
   ChatGPT V22 la Irundha Thappu Fix Panniten da
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V23) return;
  window.PIXORO_LIKE_V23 = true;

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
    const icon = button.querySelector("i, svg, span") || button;
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

  // ✅ V23 FIX 1 - Keezha Heart Slow Thudikku - 1 Touch 1 Time 0.8s Slow ah da
  function pixoroThudikku(btn){
    if(!btn) return;
    btn.classList.remove('thudikku');
    void btn.offsetWidth;
    btn.classList.add('thudikku');
    setTimeout(()=> btn.classList.remove('thudikku'), 850);
  }

  /* ---------- HEART CSS - SAFE + WHITE + SLOW THUDIKKU ---------- */

  function addHeartStyles() {
    if (document.getElementById("pixoro-like-v23-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-like-v23-css";
    style.textContent = `
      /* ✅ Keezha Heart Slow Thudikku da */
      @keyframes pixThudikku{
        0%{ transform:scale(1); }
        40%{ transform:scale(1.35); }
        70%{ transform:scale(0.95); }
        100%{ transform:scale(1); }
      }
      [data-like-btn].thudikku svg, .like-btn.thudikku svg, .like-button.thudikku svg,
      [data-like-btn].thudikku i, .like-btn.thudikku i{ animation:pixThudikku 0.8s ease-in-out 1 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color: #ff315d !important; }
      .pixoro-like-loading { opacity: .65; pointer-events: none; }
      /* ✅ SAFE AREA - Photo Container ku Veliya Heart Pogaathu da */
      .postMedia, .post-media, .post-media-wrap, .post-content, .post, .post-card { position:relative !important; }
    `;
    document.head.appendChild(style);
  }

  /* ---------- HEART ANIMATION - SAFE AREA + WHITE HEART ---------- */

  function showBigHeart(media) {
    if (!media) return;
    document.querySelectorAll('.pixoro-big-heart').forEach(h=>h.remove());

    // ✅ FIX - Photo oda Container ah Kandupidichu - Athukulla Thaan Heart da
    let container = media.closest ? (media.closest('.postMedia') || media.closest('.post-media') || media.closest('.post-media-wrap') || media.closest('.post') || media.closest('.post-card') || media.closest('article')) : null;
    if(!container) container = media;
    if(!container) return;

    let cs = window.getComputedStyle(container);
    if(cs.position === 'static') container.style.position = 'relative';
    container.style.overflow = 'hidden';

    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    // ✅ FIX - position:absolute + Photo kulla - fixed Illa da - Scroll Panna Kooda Photo Kooda Pogum da
    heart.style.cssText = 'position:absolute !important;z-index:99 !important;pointer-events:none !important;left:50% !important;top:50% !important;width:100px !important;height:100px !important;opacity:1 !important;transform:translate(-50%,-50%) scale(0.2);background:transparent !important;display:block !important;';
    // ✅ FIX - pixoro Mari White Heart da - Rainbow / Green Illa da
    heart.innerHTML = '<svg viewBox="0 0 24 24" style="width:100% !important;height:100% !important;display:block !important;filter:drop-shadow(0 8px 20px rgba(0,0,0,.5))"><path fill="#ffffff" stroke="#ffffff" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
    container.appendChild(heart);

    let t = 0;
    let anim = setInterval(()=>{
      t += 30;
      let scale = 0.2;
      if(t < 150) scale = 0.2 + (t / 150) * 1.0;
      else if(t < 300) scale = 1.2 - ((t - 150) / 150) * 0.25;
      else if(t < 450) scale = 0.95 + ((t - 300) / 150) * 0.15;
      else if(t < 600) scale = 1.1 - ((t - 450) / 150) * 0.1;
      else scale = 1;
      heart.style.transform = 'translate(-50%,-50%) scale('+scale+')';
      heart.style.opacity = '1';
      if(t >= 900){ clearInterval(anim); }
    }, 30);
    setTimeout(()=>{
      heart.style.transition = 'opacity 0.25s';
      heart.style.opacity = '0';
      setTimeout(()=>{ heart.remove(); }, 300);
    }, 900);
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

  /* ---------- LIKE / UNLIKE - NO ALERT - SILENT DA ---------- */

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
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
        paintLike(postId, true, post);
      }
      const count = await getLikeCountFromDB(postId);
      if (count !== null) {
        paintCount(postId, count, post);
      }
    } catch (error) {
      // ✅ FIX - Alert Delete Panniten da - Like Failed na Kooda UI ah Maatha Maatom da - Silent ah Log Mattum da
      console.error("PIXORO like failed - SILENT:", error);
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
    const currentTap = { time: now, x: event.clientX, y: event.clientY };
    lastTap.set(media, currentTap);
    if (
      previous &&
      now - previous.time <= DOUBLE_TAP_DELAY &&
      Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 45
    ) {
      lastTap.delete(media);
      // ✅ DOUBLE CLICK MATTUM - Naduvula Heart Varum da
      showBigHeart(media);
      const btn = getLikeButton(postId, post);
      if(btn) pixoroThudikku(btn);
      await toggleLike(postId, post, true);
    }
  });

  /* ---------- LIKE BUTTON CLICK - SINGLE TOUCH ---------- */

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
    // ✅ SINGLE TOUCH - Keezha Heart Slow ah Oru Vaati Thudikkum da - Naduvula Heart Varaathu da
    pixoroThudikku(button);
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
  window.addEventListener("pixoro:login", loadMyLikes);
  console.log("PIXORO Like V23 loaded successfully.");
})();
