
/* PIXORO FEED - BLACK SCREEN FIX */

(function () {
  'use strict';

  let loading = false;

  function getClient() {
    if (typeof window.getSupa === 'function') {
      return window.getSupa();
    }
    return window.supa || null;
  }

  async function loadFeed() {
    const feed = document.getElementById('feed');
    const errorBox = document.getElementById('feedError');

    if (!feed || loading) return;

    const supa = getClient();

    if (!supa) {
      feed.innerHTML =
        '<p style="color:#ff5ea8;text-align:center;padding:25px">Database connection not ready</p>';
      if (errorBox) errorBox.style.display = 'block';
      return;
    }

    loading = true;

    try {
      const { data: posts, error } = await supa
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!posts || posts.length === 0) {
        feed.innerHTML =
          '<p style="color:white;text-align:center;padding:30px">No posts yet</p>';
        if (errorBox) errorBox.style.display = 'none';
        return;
      }

      feed.innerHTML = posts.map(post => {
        const id = String(post.id || '');
        const username = escapeHTML(post.username || 'Pixoro User');
        const caption = escapeHTML(post.caption || '');

        const media =
          post.image_url ||
          post.media_url ||
          post.photo_url ||
          post.url || '';

        const safeMedia = safeURL(media);
        const video =
          post.media_type === 'video' ||
          /\.(mp4|mov|webm)(\?|$)/i.test(media);

        return `
          <article class="post" data-post-id="${escapeHTML(id)}">

            <div class="postTop">
              <b>${username}</b>
            </div>

            <div class="postMedia">
              ${
                safeMedia
                  ? video
                    ? `<video class="main" src="${safeMedia}" controls muted playsinline loop></video>`
                    : `<img class="main" src="${safeMedia}" alt="Post" loading="lazy">`
                  : '<p style="padding:25px;color:#aaa">Media unavailable</p>'
              }
            </div>

            <div class="actions">
              <div class="left">
                <button class="act" type="button"
                  data-like-btn="${escapeHTML(id)}"
                  aria-label="Like">♡</button>

                <button class="act" type="button"
                  aria-label="Comment"
                  onclick="if(window.openComments) window.openComments('${escapeHTML(id)}')">♡</button>

                <button class="act" type="button"
                  aria-label="Share"
                  onclick="if(navigator.share) navigator.share({url:location.origin+location.pathname+'?post=${encodeURIComponent(id)}'}).catch(()=>{})">↗</button>
              </div>
            </div>

            <div style="padding:0 12px 12px;color:white">
              <b><span data-like-count="${escapeHTML(id)}">${Number(post.likes_count) || 0}</span> likes</b>
              <div style="margin-top:6px"><b>${username}</b> ${caption}</div>
            </div>

          </article>
        `;
      }).join('');

      if (errorBox) errorBox.style.display = 'none';

    } catch (err) {
      console.error('PIXORO FEED ERROR:', err);

      feed.innerHTML =
        '<p style="color:#ff5ea8;text-align:center;padding:25px">Feed load failed. Check database connection.</p>';

      if (errorBox) errorBox.style.display = 'block';

    } finally {
      loading = false;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
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

  window.loadFeed = loadFeed;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeed);
  } else {
    loadFeed();
  }

})();
