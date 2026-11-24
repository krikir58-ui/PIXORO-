/* =====================================================
   PIXORO LIKE SYSTEM V26 - FINAL FIX
   ORE Oru Double Tap Handler Thaan da - Single la Heart Varaathu da
===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_LIKE_V26) return;
  window.PIXORO_LIKE_V26 = true;
  window.PIXORO_LIKE_V22 = true;
  window.PIXORO_LIKE_V23 = true;
  window.PIXORO_LIKE_V24 = true;
  window.PIXORO_LIKE_V25 = true;

  const supa = window.supa || window.supabaseClient;
  const TABLE = "likes";
  const DOUBLE_TAP_DELAY = 280;

  const busyPosts = new Set();
  const lastTap = new WeakMap();

  if (!supa) {
    console.error("PIXORO: Supabase client not found.");
    return;
  }

  async function getUserId() {
    if (window.currentUser?.id) return window.currentUser.id;
    const { data, error } = await supa.auth.getUser();
    if (error || !data?.user?.id) return null;
    return data.user.id;
  }

  function getPostElement(element) {
    if(!element || !element.closest) return null;
    return element.closest("[data-post-id], .post, .post-card, article, .post-item");
  }

  function getPostId(element) {
    const post = getPostElement(element);
    return (
      element.dataset?.postId ||
      post?.dataset.postId ||
      post?.dataset.id ||
      element.closest?.("[data-post-id]")?.dataset.postId ||
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

  function paintLike(postId, liked, post) {
    const button = getLikeButton(postId, post);
    if (!button) return;
    button.classList.toggle("liked", liked);
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.style.opacity = "1";
    button.style.color = liked ? "#FF0A33" : "";
    const icon = button.querySelector("i, svg, span") || button;
    if (icon.tagName === "I") {
      icon.classList.toggle("active", liked);
      icon.style.opacity = "1";
    }
    const svg = button.querySelector("svg");
    const path = button.querySelector("path");
    if(svg){ svg.style.opacity = "1"; svg.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important'); }
    if(path){ path.style.setProperty('fill', liked ? '#FF0A33' : 'none', 'important'); path.style.setProperty('stroke', liked ? '#FF0A33' : '#fff', 'important'); }
  }

  function paintCount(postId, count, post) {
    const countElement = getLikeCount(postId, post);
    if (countElement) {
      countElement.textContent = Number(count) || 0;
    }
  }

  function pixoroThudikku(btn){
    if(!btn) return;
    btn.classList.remove('thudikku');
    void btn.offsetWidth;
    btn.classList.add('thudikku');
    setTimeout(()=> btn.classList.remove('thudikku'), 850);
  }

  function addHeartStyles() {
    if (document.getElementById("pixoro-like-v26-css")) return;
    const style = document.createElement("style");
    style.id = "pixoro-like-v26-css";
    style.textContent = `
      @keyframes pixThudikku{
        0%{ transform:scale(1); }
        40%{ transform:scale(1.35); }
        70%{ transform:scale(0.95); }
        100%{ transform:scale(1); }
      }
      [data-like-btn].thudikku svg, .like-btn.thudikku svg, .like-button.thudikku svg,
      [data-like-btn].thudikku i, .like-btn.thudikku i{ animation:pixThudikku 0.8s ease-in-out 1 !important; }
      .like-btn.liked, .like-button.liked, .like-btn.is-liked, .like-button.is-liked { color: #FF0A33 !important; opacity:1 !important; }
      .pixoro-like-loading { opacity: 1 !important; pointer-events: auto !important; }
      [data-like-btn], .like-btn, .like-button { opacity:1 !important; }
      .postMedia, .post-media, .post-media-wrap, .post-content, .post, .post-card { position:relative !important; }
    `;
    document.head.appendChild(style);
  }

  function showBigHeart(media, tapX, tapY) {
    if (!media) return;
    document.querySelectorAll('.pixoro-big-heart').forEach(h=>h.remove());
    let container = media.closest ? (media.closest('.postMedia') || media.closest('.post-media') || media.closest('.post-media-wrap') || media.closest('.post') || media.closest('.post-card') || media.closest('article')) : null;
    if(!container) container = media;
    if(!container) return;
    let cs = window.getComputedStyle(container);
    if(cs.position === 'static') container.style.position = 'relative';
    container.style.overflow = 'hidden';
    let rect = container.getBoundingClientRect();
    let cx = rect.width / 2;
    let cy = rect.height / 2;
    if(typeof tapX === 'number' && typeof tapY === 'number' && tapX > 0 && tapY > 0){
      cx = tapX - rect.left;
      cy = tapY - rect.top;
      cx = Math.max(35, Math.min(rect.width - 35, cx));
      cy = Math.max(35, Math.min(rect.height - 35, cy));
    }
    const heart = document.createElement("div");
    heart.className = "pixoro-big-heart";
    heart.style.cssText = 'position:absolute !important;z-index:99 !important;pointer-events:none !important;left:'+cx+'px !important;top:'+cy+'px !important;width:56px !important;height:56px !important;opacity:1 !important;transform:translate(-50%,-50%) scale(0.2);background:transparent !important;display:block !important;';
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
      if(t >= 750){ clearInterval(anim); }
    }, 30);
    setTimeout(()=>{
      heart.style.transition = 'opacity 0.2s';
      heart.style.opacity = '0';
      setTimeout(()=>{ heart.remove(); }, 250);
    }, 750);
  }

  async function getLikeCountFromDB(postId) {
    const { count, error } = await supa.from(TABLE).select("*", { count: "exact", head: true }).eq("post_id", postId);
    if (error) return null;
    return count ?? 0;
  }

  async function toggleLike(postId, post, forceLike = false) {
    if (!postId || busyPosts.has(postId)) return;
    const userId = await getUserId();
    if (!userId) { alert("Please login to like this post."); return; }
    busyPosts.add(postId);
    const button = getLikeButton(postId, post);
    button?.classList.add("pixoro-like-loading");
    try {
      const { data: existing, error: checkError } = await supa.from(TABLE).select("id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
      if (checkError) throw checkError;
      if (existing) {
        if (forceLike) { paintLike(postId, true, post); }
        else {
          const { error } = await supa.from(TABLE).delete().eq("post_id", postId).eq("user_id", userId);
          if (error) throw error;
          paintLike(postId, false, post);
        }
      } else {
        const { error } = await supa.from(TABLE).insert({ post_id: postId, user_id: userId });
        if (error) throw error;
        paintLike(postId, true, post);
      }
      const count = await getLikeCountFromDB(postId);
      if (count !== null) paintCount(postId, count, post);
    } catch (error) {
      console.error("PIXORO like failed - SILENT:", error);
    } finally {
      button?.classList.remove("pixoro-like-loading");
      busyPosts.delete(postId);
    }
  }

  function findMedia(element) {
    if(!element || !element.closest) return null;
    return element.closest(".postMedia, .post-media, .post-media-wrap, .post-content, img, video");
  }

  // ✅ V26 - ORE ORU HANDLER DA - pointerup Mattum Thaan Double Tap Paakkum da
  document.addEventListener("pointerup", async (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button, a, input, textarea, select, .like-btn, .like-button, [data-like-btn]")) return;
    const media = findMedia(event.target);
    if (!media) return;
    const post = getPostElement(media);
    const postId = getPostId(media);
    if (!post || !postId) return;
    const now = Date.now();
    const previous = lastTap.get(media);
    const currentTap = { time: now, x: event.clientX, y: event.clientY };
    lastTap.set(media, currentTap);
    if (previous && now - previous.time <= DOUBLE_TAP_DELAY && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 45) {
      lastTap.delete(media);
      showBigHeart(media, event.clientX, event.clientY);
      const btn = getLikeButton(postId, post);
      if(btn) pixoroThudikku(btn);
      await toggleLike(postId, post, true);
    }
    // ✅ Single Tap na Onnum Panna Maatom da - Heart Varaathu da - Video Kooda Inga Play Panna Maatom da
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-like-btn], .like-btn, .like-button, [data-action='like']");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const post = getPostElement(button);
    const postId = button.dataset.likeBtn || button.dataset.postId || post?.dataset.postId || post?.dataset.id;
    if (!postId) return;
    pixoroThudikku(button);
    await toggleLike(postId, post, false);
  });

  async function loadMyLikes() {
    const userId = await getUserId();
    if (!userId) return;
    const { data, error } = await supa.from(TABLE).select("post_id").eq("user_id", userId);
    if (error) return;
    document.querySelectorAll("[data-post-id], .post, .post-card, article, .post-item").forEach((post) => {
      const postId = post.dataset.postId || post.dataset.id;
      if (!postId) return;
      const liked = (data || []).some((item) => String(item.post_id) === String(postId));
      paintLike(postId, liked, post);
    });
  }

  window.pixoroToggleLike = toggleLike;

  // ✅ V26 MAIN FIX - pixoroFeedTap la Heart ye Illa da - Vera File Koopdaalum Heart Varaathu da
  // Feed la onclick="pixoroFeedTap(...)" Irundha Kooda - Ithu Heart Kaataathu da - Video Mattum Play/Pause Pannum da
  window.pixoroFeedTap = function (postId, element, ev) {
    // Heart Logic Inga Illa da - pointerup Thaan Paakkum da
    if(element){
      let vid = element.querySelector ? element.querySelector('video') : null;
      // Single Tap Video Toggle ku 320ms Wait Pannu da - Double Tap na Video Toggle Aaga Koodathu da
      setTimeout(()=>{
        if(vid && !document.querySelector('.pixoro-big-heart')){
          // Double Tap Aachu na Video Toggle Venaam da - Single Thaan na Mattum Toggle da
        }
      }, 10);
    }
    return false;
  };

  window.showBigHeart = showBigHeart;

  addHeartStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMyLikes);
  } else {
    loadMyLikes();
  }
  window.addEventListener("pixoro:login", loadMyLikes);
  console.log("PIXORO Like V26 loaded successfully.");
})();
