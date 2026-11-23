/* PIXORO FEED - BLACK SCREEN FIX + 2ND PHOTO STYLE DA */
(function () {
  'use strict';
  let loading = false;
  function getClient(){ return window.getSupa ? window.getSupa() : window.supa || null; }
  function escapeHTML(v){ return String(v||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeURL(v){ try{ let u=new URL(v, location.href); return ['https:','http:'].includes(u.protocol)?escapeHTML(u.href):''; }catch{ return ''; } }
  function feedTime(t){ if(!t) return ''; let d=new Date(t), n=new Date(), diff=Math.floor((n-d)/1000); if(diff<60) return 'Just now'; if(diff<3600) return Math.floor(diff/60)+'m'; if(diff<86400) return Math.floor(diff/3600)+'h'; return d.toLocaleDateString([],{day:'numeric',month:'short'}); }

  async function loadFeed(){
    const feed = document.getElementById('feed');
    if(!feed || loading) return;
    const supa = getClient();
    if(!supa){ feed.innerHTML='<p style="color:#ff5ea8;text-align:center;padding:25px">Database connection not ready</p>'; return; }
    loading = true;
    try{
      const { data: posts, error } = await supa.from('posts').select('*').order('created_at',{ascending:false}).limit(50);
      if(error) throw error;
      if(!posts || !posts.length){ feed.innerHTML='<p style="color:white;text-align:center;padding:30px">No posts yet</p>'; return; }

      // ✅ Profile Photo edukka da
      let ids = [...new Set(posts.map(p=>p.user_id).filter(Boolean))];
      let profMap = {};
      if(ids.length){
        let { data: profs } = await supa.from('profiles').select('id,username,avatar_url').in('id', ids);
        (profs||[]).forEach(p=> profMap[String(p.id)] = p);
      }

      feed.innerHTML = posts.map(post=>{
        const id = String(post.id||'');
        const prof = profMap[String(post.user_id)] || {};
        const username = escapeHTML(prof.username || post.username || 'Pixoro User');
        const caption = escapeHTML(post.caption||'');
        const pfp = prof.avatar_url || post.avatar_url || '';
        const media = post.image_url || post.media_url || post.photo_url || post.url || '';
        const safeMedia = safeURL(media);
        const video = post.media_type==='video' || /\.(mp4|mov|webm)(\?|$)/i.test(media);
        const letter = username.charAt(0).toUpperCase();

        return `
        <article class="post" data-post-id="${id}">
          <div class="postTop">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="pfpRing"><div class="pfpInner">${pfp ? `<img src="${pfp}" onerror="this.remove()">` : `<div class="avaLetterHome">${letter}</div>`}</div></div>
              <div><b>${username}</b><div style="font-size:11px;color:#888">${feedTime(post.created_at)}</div></div>
            </div>
            <button class="followBtnPost" onclick="pixoroToggleFollow('${username}',this)">Follow</button>
          </div>
          <div class="postMedia" onclick="pixoroFeedTap('${id}', this, event)">
            ${safeMedia ? (video ? `<video class="main" src="${safeMedia}" muted playsinline loop></video>` : `<img class="main" src="${safeMedia}" loading="lazy">`) : '<p style="padding:25px;color:#aaa">Media unavailable</p>'}
          </div>
          <div class="actions">
            <div class="left" style="display:flex;gap:14px;align-items:center">
              <button data-like-btn="${id}" class="act" style="display:flex;gap:6px;align-items:center;background:none;border:0;color:#fff;font-size:17px" onclick="pixoroDoubleTapLike('${id}', this.closest('.post').querySelector('.postMedia'))">♡ <span data-like-count="${id}">${post.likes_count||0}</span></button>
              <button class="act" style="display:flex;gap:6px;align-items:center;background:none;border:0;color:#fff;font-size:17px" onclick="if(window.openComments) window.openComments('${id}')">💬 <span>0</span></button>
              <button class="act" style="background:none;border:0;color:#fff;font-size:20px">↗</button>
            </div>
            <button data-save-btn="${id}" class="act" style="margin-left:auto;background:none;border:0;color:#fff;font-size:20px" onclick="pixoroToggleSave('${id}',this)">🔖</button>
          </div>
          <div style="padding:0 14px 6px;color:white;font-size:14px"><b>${username}</b> ${caption}</div>
        </article>`;
      }).join('');
    }catch(err){
      console.error('PIXORO FEED ERROR:', err);
      feed.innerHTML='<p style="color:#ff5ea8;text-align:center;padding:25px">Feed load failed. Check database connection.</p>';
    }finally{ loading=false; }
  }
  window.loadFeed = loadFeed;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadFeed);
  else loadFeed();
})();
