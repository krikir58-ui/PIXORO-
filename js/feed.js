/* =====================================================
   PIXORO FEED V1044 FINAL - CORRECT DA 🔥❤️
   SUPABASE POST LOADING - LIKE LOGIC = like.js ONLY
   ===================================================== */

(() => {
  "use strict";

  if (window.PIXORO_FEED_V1044) return;
  window.PIXORO_FEED_V1044 = true;
  window.PIXORO_FEED_V1043 = true;
  window.PIXORO_FEED_V1042 = true;

  const POSTS_TABLE = "posts";
  const FEED_LIMIT = 100;

  let loading = false;
  let loaded = false;
  let retryCount = 0;

  function getClient() {
    return (
      window.getSupa?.() ||
      window.supa ||
      window.supabaseClient ||
      null
    );
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function getMedia(post) {
    return (
      post.image_url ||
      post.media_url ||
      post.photo_url ||
      post.url ||
      ""
    );
  }

  function getMediaType(post, url) {
    const type = String(post.media_type || "").toLowerCase();
    if (type.includes("video")) return "video";
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
      return "video";
    }
    return "image";
  }

  /* ✅ V1044 FIX 1 - #feed um Theduren da - FeedList Illanaalum Feed Varum da */
  function getFeedContainer() {
    return (
      document.getElementById("feedList") ||
      document.getElementById("feed") ||
      document.querySelector("#feed-list") ||
      document.querySelector(".feed-list") ||
      document.querySelector(".feedList")
    );
  }

  function getPostUser(post) {
    return (
      post.username ||
      post.user_name ||
      post.name ||
      post.profiles?.username ||
      "PIXORO USER"
    );
  }

  function getAvatar(post) {
    return (
      post.avatar_url ||
      post.profiles?.avatar_url ||
      ""
    );
  }

  function getPostCount(post) {
    const id = String(post.id || "");
    if (window.FEED_COUNTS && window.FEED_COUNTS[id] !== undefined) {
      return Math.max(0, Number(window.FEED_COUNTS[id]));
    }
    return Math.max(0, Number(post.likes_count || 0));
  }

  function mediaHTML(post) {
    const url = getMedia(post);
    if (!url) {
      return `<div class="post-media-empty">No media available</div>`;
    }
    const safeURL = escapeHTML(url);
    const type = getMediaType(post, url);
    if (type === "video") {
      return `
        <div class="post-media">
          <video
            class="postMedia"
            src="${safeURL}"
            playsinline
            preload="metadata"
            muted
            loop
            data-media="video">
          </video>
        </div>
      `;
    }
    return `
      <div class="post-media">
        <img
          class="postMedia"
          src="${safeURL}"
          alt="PIXORO post"
          loading="lazy"
          draggable="false"
          data-media="image">
      </div>
    `;
  }

  function postHTML(post) {
    const id = String(post.id || "");
    if (!id) return "";
    const username = escapeHTML(getPostUser(post));
    const avatar = escapeHTML(getAvatar(post));
    const caption = escapeHTML(post.caption || "");
    const count = getPostCount(post);

    const avatarHTML = avatar
      ? `<img src="${avatar}" alt="" class="post-avatar feedPfpImg">`
      : `<div class="post-avatar feedPfpImg post-avatar-empty">P</div>`;

    return `
      <article class="post" data-post-id="${escapeHTML(id)}" data-id="${escapeHTML(id)}">

        <div class="post-header">
          ${avatarHTML}
          <div class="post-user-info">
            <span class="post-username">${username}</span>
          </div>
          <button class="post-more" type="button" aria-label="More options">
            ⋯
          </button>
        </div>

        ${mediaHTML(post)}

        <div class="post-actions">

          <button
            type="button"
            class="like-btn"
            data-like-btn="true"
            aria-label="Like"
            aria-pressed="false">
            <svg viewBox="0 0 24 24"
              width="27"
              height="27"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
          </button>

          <button type="button" class="comment-btn" aria-label="Comments">
            <svg viewBox="0 0 24 24" width="26" height="26"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>
            </svg>
          </button>

          <button type="button" class="share-btn" aria-label="Share">
            <svg viewBox="0 0 24 24" width="26" height="26"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2 11 13"/>
              <path d="m22 2-7 20-4-9-9-4z"/>
            </svg>
          </button>

          <button type="button" class="save-btn" aria-label="Save">
            <svg viewBox="0 0 24 24" width="26" height="26"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 4h12v17l-6-4-6 4z"/>
            </svg>
          </button>

        </div>

        <div class="post-like-total">
          <span class="like-count" data-like-count="true">${count}</span>
          <span>likes</span>
        </div>

        <div class="post-caption">
          <strong>${username}</strong>
          <span>${caption}</span>
        </div>

        <div class="post-date">
          ${escapeHTML(post.created_at || "")}
        </div>

      </article>
    `;
  }

  async function loadFeed(force = false) {
    if (loading) return;
    if (loaded && !force) return;
    const supa = getClient();
    const container = getFeedContainer();
    /* ✅ V1044 FIX 2 - Supa Late ah Vanthaalum Thirumba Try Pannum da - Return Panna Maatam da */
    if (!supa) {
      if (retryCount < 10) {
        retryCount++;
        setTimeout(() => loadFeed(force), 500);
      } else {
        console.error("PIXORO: Supabase client not ready");
      }
      return;
    }
    retryCount = 0;
    if (!container) {
      console.error("PIXORO: feedList container not found");
      return;
    }
    loading = true;
    if (!loaded || force) {
      container.innerHTML = `
        <div class="feed-loading">
          Loading PIXORO posts...
        </div>
      `;
    }
    try {
      const { data, error } = await supa
        .from(POSTS_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(FEED_LIMIT);
      if (error) throw error;
      const posts = data || [];
      if (!posts.length) {
        container.innerHTML = `
          <div class="feed-empty">
            No posts yet. Be the first to share!
          </div>
        `;
        loaded = true;
        return;
      }
      container.innerHTML = posts.map(postHTML).join("");
      loaded = true;
      window.dispatchEvent(
        new Event("pixoro-feed-rendered")
      );
      if (typeof window.pixoroPaintAllLikes === "function") {
        window.pixoroPaintAllLikes();
      }
      setTimeout(() => {
        window.pixoroSyncLikes?.();
      }, 150);
    } catch (error) {
      console.error("PIXORO FEED ERROR:", error);
      container.innerHTML = `
        <div class="feed-error">
          <p>Unable to load posts.</p>
          <button type="button" id="pixoroFeedRetry">
            Try Again
          </button>
        </div>
      `;
      document.getElementById("pixoroFeedRetry")
        ?.addEventListener("click", () => loadFeed(true));
    } finally {
      loading = false;
    }
  }

  window.pixoroLoadFeed = loadFeed;
  window.pixoroRefreshFeed = () => {
    loaded = false;
    return loadFeed(true);
  };
  window.addEventListener("pixoro-supa-ready", () => {
    loadFeed(true);
  });
  window.addEventListener("pixoro:login", () => {
    loadFeed(true);
  });

  function start() {
    loadFeed();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, {
      once: true
    });
  } else {
    start();
  }
  console.log("PIXORO FEED V1044 READY");
})();
