
/* =====================================================
   PIXORO FEED - V1005
   LIKE LOGIC ONLY IN js/like.js
   Existing Supabase + Follow + Comments + Share + Save
===================================================== */
(function () {
  'use strict';

  let loading = false;

  function getClient() {
    return window.getSupa
      ? window.getSupa()
      : window.supa || window.supabaseClient || null;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c];
    });
  }

  function safeURL(value) {
    try {
      const url = new URL(value, location.href);
      return ['https:', 'http:'].includes(url.protocol)
        ? escapeHTML(url.href)
        : '';
    } catch {
      return '';
    }
  }

  function feedTime(time) {
    if (!time) return '';

    const date = new Date(time);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';

    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short'
    });
  }

  // Local likes shared with like.js
  if (!(window.FEED_LIKES instanceof Set)) {
    try {
      window.FEED_LIKES = new Set(
        JSON.parse(localStorage.getItem('pixoro_likes') || '[]')
          .map(String)
      );
    } catch {
      window.FEED_LIKES = new Set();
    }
  }

  function saveLocalLikes() {
    try {
      localStorage.setItem(
        'pixoro_likes',
        JSON.stringify([...window.FEED_LIKES])
      );
    } catch {}
  }

  async function loadFeed() {
    const feed = document.getElementById('feed');

    if (!feed || loading) return;

    const supa = getClient();

    if (!supa) {
      feed.innerHTML =
        '<p style="color:#ff5ea8;text-align:center;padding:25px">Database connection not ready</p>';
      return;
    }

    loading = true;

    try {
      let MY_ID = '';

      try {
        const result = await supa.auth.getSession();
        MY_ID = result.data?.session?.user?.id || '';
      } catch (error) {
        console.warn('PIXORO SESSION:', error);
      }

      const { data: posts, error } = await supa
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!posts || !posts.length) {
        feed.innerHTML =
          '<p style="color:white;text-align:center;padding:30px">No posts yet</p>';
        return;
      }

      // Load profiles
      const userIds = [
        ...new Set(posts.map(post => post.user_id).filter(Boolean))
      ];

      const profileMap = {};

      if (userIds.length) {
        const { data: profiles, error: profileError } = await supa
          .from('profiles')
          .select('id,username,avatar_url')
          .in('id', userIds);

        if (profileError) {
          console.warn('PIXORO PROFILE:', profileError);
        }

        (profiles || []).forEach(profile => {
          profileMap[String(profile.id)] = profile;
        });
      }

      // Load current user's likes and saves
      const likedSet = new Set();
      const savedSet = new Set();

      if (MY_ID) {
        const postIds = posts.map(post => post.id);

        const [likesResult, savesResult] = await Promise.all([
          supa
            .from('likes')
            .select('post_id')
            .eq('user_id', MY_ID)
            .in('post_id', postIds),

          supa
            .from('saves')
            .select('post_id')
            .eq('user_id', MY_ID)
            .in('post_id', postIds)
        ]);

        if (likesResult.error) {
          console.warn('PIXORO LIKES LOAD:', likesResult.error);
        }

        if (savesResult.error) {
          console.warn('PIXORO SAVES LOAD:', savesResult.error);
        }

        (likesResult.data || []).forEach(item => {
          likedSet.add(String(item.post_id));
        });

        (savesResult.data || []).forEach(item => {
          savedSet.add(String(item.post_id));
        });

        likedSet.forEach(id => window.FEED_LIKES.add(id));
        saveLocalLikes();
      }

      feed.innerHTML = posts.map(post => {
        const id = escapeHTML(String(post.id ?? ''));
        const rawId = String(post.id ?? '');

        const profile = profileMap[String(post.user_id)] || {};

        const username = escapeHTML(
          profile.username || post.username || 'Pixoro User'
        );

        const caption = escapeHTML(post.caption || '');

        const pfp = safeURL(
          profile.avatar_url || post.avatar_url || ''
        );

        const media = String(
          post.image_url ||
          post.media_url ||
          post.photo_url ||
          post.url ||
          ''
        );

        const safeMedia = safeURL(media);

        const isVideo =
          post.media_type === 'video' ||
          /\.(mp4|mov|webm)(\?|$)/i.test(media);

        const letter = username.charAt(0).toUpperCase();

        const isMine =
          MY_ID && String(post.user_id) === String(MY_ID);

        const isLiked =
          likedSet.has(rawId) || window.FEED_LIKES.has(rawId);

        const isSaved = savedSet.has(rawId);

        const baseCount = Math.max(
          0,
          parseInt(post.likes_count, 10) || 0
        );

        const likeCount = Math.max(
          baseCount,
          isLiked ? 1 : 0
        );

        const commentCount = Math.max(
          0,
          parseInt(post.comments_count, 10) || 0
        );

        const shareCount = Math.max(
          0,
          parseInt(post.shares_count, 10) || 0
        );

        return `
          <article class="post" data-post-id="${id}">

            <div class="postTop">

              <div style="display:flex;align-items:center;gap:10px">

                <div class="pfpRing">
                  <div class="pfpInner">
                    ${
                      pfp
                        ? `<img src="${pfp}" loading="lazy" onerror="this.remove()">`
                        : `<div class="avaLetterHome">${letter}</div>`
                    }
                  </div>
                </div>

                <div>
                  <b>${username}</b>
                  <div style="font-size:11px;color:#888">
                    ${feedTime(post.created_at)}
                  </div>
                </div>

              </div>

              ${
                isMine
                  ? `<span style="font-size:22px;color:#fff;cursor:pointer">⋯</span>`
                  : `<button class="followBtnPost"
                      onclick="pixoroToggleFollow('${username}',this)">
                      Follow
                    </button>`
              }

            </div>

            <div class="postMedia" data-post-media="${id}">

              ${
                safeMedia
                  ? (
                      isVideo
                        ? `<video class="main"
                            src="${safeMedia}"
                            muted
                            playsinline
                            loop
                            preload="metadata"></video>`
                        : `<img class="main"
                            src="${safeMedia}"
                            loading="lazy"
                            alt="PIXORO post">`
                    )
                  : `<p style="padding:25px;color:#aaa">Media unavailable</p>`
              }

            </div>

            <div class="actions">

              <div class="left">

                <button
                  type="button"
                  data-like-btn="${id}"
                  data-liked="${isLiked ? '1' : '0'}"
                  aria-pressed="${isLiked ? 'true' : 'false'}"
                  class="act${isLiked ? ' liked' : ''}"
                  onclick="event.stopPropagation(); if(window.pixoroToggleLike) window.pixoroToggleLike('${id}',this.closest('article'))"
                >

                  <svg viewBox="0 0 24 24">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
                  </svg>

                  <span data-like-count="${id}">${likeCount}</span>

                </button>

                <button
                  type="button"
                  class="act"
                  onclick="if(window.openComments) window.openComments('${id}')"
                >

                  <svg viewBox="0 0 24 24">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>

                  <span data-comment-count="${id}">${commentCount}</span>

                </button>

                <button
                  type="button"
                  class="act"
                  onclick="if(window.sharePost) window.sharePost('${id}')"
                >

                  <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 22 15 22 11 13 2 9 22 2"/>
                  </svg>

                  <span data-share-count="${id}">${shareCount}</span>

                </button>

              </div>

              <button
                type="button"
                data-save-btn="${id}"
                class="act${isSaved ? ' saved' : ''}"
                onclick="if(window.pixoroToggleSave) window.pixoroToggleSave('${id}',this)"
              >

                <svg viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>

              </button>

            </div>

            <div style="padding:0 14px 6px;color:white;font-size:14px">
              <b>${username}</b> ${caption}
            </div>

          </article>
        `;
      }).join('');

      // Tell like.js and other feed modules that feed is ready
      window.dispatchEvent(new Event('pixoroFeedLoaded'));

      // Only call the existing painter. Do not define a second like function.
      if (typeof window.pixoroPaintAllLikes === 'function') {
        window.pixoroPaintAllLikes();
      }

    } catch (error) {
      console.error('PIXORO FEED ERROR:', error);

      feed.innerHTML =
        '<p style="color:#ff5ea8;text-align:center;padding:25px">Feed load failed. Check database connection.</p>';

    } finally {
      loading = false;
    }
  }

  window.loadFeed = loadFeed;

  function init() {
    loadFeed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
