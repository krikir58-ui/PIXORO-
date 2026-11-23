// ✅ FEED.JS - FINAL DA

async function loadFeed(){
  let feedList = document.getElementById('feedList');
  if(!feedList) return;

  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return;

  let { data: posts } = await s.from('posts').select('*').order('created_at', { ascending: false });
  if(!posts || posts.length === 0){
    feedList.innerHTML = '<p style="text-align:center;padding:20px">Innum Post eh illa da</p>';
    return;
  }

  feedList.innerHTML = posts.map(p => {
    let img = p.image_url || p.media_url || p.photo_url || p.url || '';
    let isVideo = img.endsWith('.mp4') || img.endsWith('.mov') || img.endsWith('.webm') || p.media_type === 'video';

    return `
    <div class="post">
      <div class="post-top">
        <img src="${p.avatar_url || 'https://via.placeholder.com/32'}">
        <b>${p.username || 'Pixoro User'}</b>
      </div>

      <div class="postMedia" onclick="pixoroFeedTap('${p.id}', this, event)">
        ${img ? (isVideo
          ? `<video src="${img}" muted playsinline loop></video>`
          : `<img src="${img}">`)
        : ''}
      </div>

      <div style="padding:10px 12px;display:flex;gap:14px;font-size:22px">
        <span data-like-btn="${p.id}" onclick="pixoroDoubleTapLike('${p.id}', this.closest('.post').querySelector('.postMedia'))">🤍</span>
        <span>💬</span>
        <span>↗️</span>
      </div>

      <div style="padding:0 12px 12px;font-size:14px">
        <b><span data-like-count="${p.id}">${p.likes_count || 0}</span> likes</b>
        <div class="post-cap"><b>${p.username || ''}</b> ${p.caption || ''}</div>
      </div>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadFeed);
window.loadFeed = loadFeed;
