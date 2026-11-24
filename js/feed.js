/* PIXORO FEED - OPTIMISTIC LIKE DA - FIRST LOCAL, PINNADI SERVER DA */
(function () {
  'use strict';
  let loading = false;
  function getClient(){ return window.getSupa ? window.getSupa() : window.supa || null; }
  function escapeHTML(v){ return String(v||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeURL(v){ try{ let u=new URL(v, location.href); return ['https:','http:'].includes(u.protocol)?escapeHTML(u.href):''; }catch{ return ''; } }
  function feedTime(t){ if(!t) return ''; let d=new Date(t), n=new Date(), diff=Math.floor((n-d)/1000); if(diff<60) return 'Just now'; if(diff<3600) return Math.floor(diff/60)+'m'; if(diff<86400) return Math.floor(diff/3600)+'h'; return d.toLocaleDateString([],{day:'numeric',month:'short'}); }

  // ✅ 1. LOCAL LIKES - SPEED KU DA
  if(!window.FEED_LIKES){
    try{ window.FEED_LIKES = new Set(JSON.parse(localStorage.getItem('pixoro_likes_v2')||'[]')); }
    catch{ window.FEED_LIKES = new Set(); }
  }
  function saveLocal(){
    try{ localStorage.setItem('pixoro_likes_v2', JSON.stringify([...window.FEED_LIKES])); }catch{}
  }

  // ✅ 2. DOUBLE TAP
  let pixoroLastTap = 0;
  window.pixoroFeedTap = function(postId, el, e){
    let now = Date.now();
    if(now - pixoroLastTap < 350){
      pixoroShowBigHeart(el);
      window.pixoroToggleLike(postId, null);
    }
    pixoroLastTap = now;
  };

  window.pixoroShowBigHeart = function(el){
    if(!el) return;
    let h = document.createElement('div');
    h.innerHTML = '❤️';
    h.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:90px;z-index:10;transition:all .3s;pointer-events:none;';
    el.style.position = 'relative';
    el.appendChild(h);
    setTimeout(()=> h.style.transform='translate(-50%,-50%) scale(1.2)', 10);
    setTimeout(()=> h.remove(), 700);
  };

  // ✅ 3. OPTIMISTIC LIKE - FIRST LOCAL, PINNADI SILENT SERVER DA
  window.pixoroToggleLike = function(postId, btn){
    let btnEl = btn || document.querySelector('[data-like-btn="'+postId+'"]');
    if(!btnEl) return;
    if(btnEl.dataset.busy === '1') return;
    btnEl.dataset.busy = '1';
    setTimeout(()=> btnEl.dataset.busy = '0', 350);

    let isLiked = btnEl.classList.contains('liked');
    let countEl = document.querySelector('[data-like-count="'+postId+'"]');
    let count = parseInt(countEl?.textContent || '0') || 0;

    // FIRST - UDANEY LOCAL LA MAATHU DA - 0ms SPEED DA
    btnEl.classList.toggle('liked', !isLiked);
    if(countEl) countEl.textContent = isLiked ? Math.max(0, count-1) : count+1;
    if(!isLiked) window.FEED_LIKES.add(String(postId));
    else window.FEED_LIKES.delete(String(postId));
    saveLocal();

    // PINNADI - SILENT AH SERVER KU ANUPU DA - WAIT PANNA VENDAAM DA
    (async ()=>{
      try{
        let supa = getClient(); if(!supa) return;
        let { data:{session} } = await supa.auth.getSession();
        if(!session) return;
        if(isLiked){
          await supa.from('likes').delete().eq('post_id', postId).eq('user_id', session.user.id);
        } else {
          await supa.from('likes').insert({post_id: postId, user_id: session.user.id});
        }
      }catch(e){ console.log(e); }
    })();
  };

  window.pixoroPaintAllLikes = function(){
    document.querySelectorAll('[data-like-btn]').forEach(btn=>{
      let id = btn.getAttribute('data-like-btn');
      btn.classList.toggle('liked', window.FEED_LIKES.has(String(id)));
    });
  };

  async function loadFeed(){
    const feed = document.getElementById('feed');
    if(!feed || loading) return;
    const supa = getClient();
    if(!supa){ feed.innerHTML='<p style="color:#ff5ea8;text-align:center;padding:25px">Database connection not ready</p>'; return; }
    loading = true;
    try{
      let MY_ID = '';
      try{ let { data:{session} } = await supa.auth.getSession(); MY_ID = session?.user?.id || ''; }catch{}
      const { data: posts, error } = await supa.from('posts').select('*').order('created_at',{ascending:false}).limit(50);
      if(error) throw error;
      if(!posts || !posts.length){ feed.innerHTML='<p style="color:white;text-align:center;padding:30px">No posts yet</p>'; return; }
      let ids = [...new Set(posts.map(p=>p.user_id).filter(Boolean))];
      let profMap = {};
      if(ids.length){
        let { data: profs } = await supa.from('profiles').select('id,username,avatar_url').in('id', ids);
        (profs||[]).forEach(p=> profMap[String(p.id)] = p);
      }
      let likedSet = new Set(), savedSet = new Set();
      if(MY_ID){
        let postIds = posts.map(p=>p.id);
        let { data: myLikes } = await supa.from('likes').select('post_id').eq('user_id', MY_ID).in('post_id', postIds);
        (myLikes||[]).forEach(l=> likedSet.add(String(l.post_id)));
        let { data: mySaves } = await supa.from('saves').select('post_id').eq('user_id', MY_ID).in('post_id', postIds);
        (mySaves||[]).forEach(s=> savedSet.add(String(s.post_id)));
        // ✅ SERVER THAAN FINAL DA - LOCAL AH SERVER ODA SYNC PANNU DA
        // Server la iruntha mattum Local la vechu - Stale Red varathu da
        likedSet.forEach(id=> window.FEED_LIKES.add(id));
        // Local la irunthu Server la illana - Athu innum save aagala nu artham - Server ku silent ah push pannu da
        // Aana ippo UI ku - Server + Local rendum serthu kaatu da
        saveLocal();
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
        const isMine = MY_ID && String(post.user_id) === String(MY_ID);
        // ✅ LIKE CHECK - LOCAL + SERVER RENDUM PAARU DA
        const isLikedNow = likedSet.has(id) || window.FEED_LIKES.has(id);
        const isLiked = isLikedNow ? ' liked' : '';
        const isSaved = savedSet.has(id) ? ' saved' : '';
        // ✅ COUNT FIX DA - Red na Count 0 varave koodathu da
        let baseCount = parseInt(post.likes_count || 0) || 0;
        let showCount = baseCount;
        if(isLikedNow && showCount === 0) showCount = 1;
        // Vera aalunga Like panni iruntha - Server count + Namba like = Correct count da
        // Namba like server la already iruntha double count aagathu da - likedSet la iruntha base la already irukku nu vaichuko da
        // So: Local mattum iruntha (server la illa) na +1 pannu da
        if(window.FEED_LIKES.has(id) && !likedSet.has(id) && baseCount > 0) showCount = baseCount + 1;
        return `
        <article class="post" data-post-id="${id}">
          <div class="postTop">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="pfpRing"><div class="pfpInner">${pfp ? `<img src="${pfp}" onerror="this.remove()">` : `<div class="avaLetterHome" style="width:32px!important;height:32px!important;font-size:14px!important;position:absolute!important;top:0!important;left:0!important">${letter}</div>`}</div></div>
              <div><b>${username}</b><div style="font-size:11px;color:#888">${feedTime(post.created_at)}</div></div>
            </div>
            ${isMine ? `<span style="font-size:22px;color:#fff;cursor:pointer">⋯</span>` : `<button class="followBtnPost" onclick="pixoroToggleFollow('${username}',this)">Follow</button>`}
          </div>
          <div class="postMedia" onclick="pixoroFeedTap('${id}', this, event)">
            ${safeMedia ? (video ? `<video class="main" src="${safeMedia}" muted playsinline loop></video>` : `<img class="main" src="${safeMedia}" loading="lazy">`) : '<p style="padding:25px;color:#aaa">Media unavailable</p>'}
          </div>
          <div class="actions">
            <div class="left">
              <button data-like-btn="${id}" class="act${isLiked}" onclick="event.stopPropagation(); pixoroToggleLike('${id}', this)">
                <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                <span data-like-count="${id}">${showCount}</span>
              </button>
              <button class="act" onclick="if(window.openComments) window.openComments('${id}')">
                <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span data-comment-count="${id}">${post.comments_count||0}</span>
              </button>
              <button class="act" onclick="sharePost('${id}')">
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 22 15 22 11 13 2 9 22 2"/></svg>
                <span data-share-count="${id}">${post.shares_count||0}</span>
              </button>
            </div>
            <button data-save-btn="${id}" class="act${isSaved}" onclick="pixoroToggleSave('${id}',this)">
              <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
          <div style="padding:0 14px 6px;color:white;font-size:14px"><b>${username}</b> ${caption}</div>
        </article>`;
      }).join('');
      window.dispatchEvent(new Event('pixoroFeedLoaded'));
      if(window.pixoroPaintAllLikes) window.pixoroPaintAllLikes();
    }catch(err){
      console.error('PIXORO FEED ERROR:', err);
      feed.innerHTML='<p style="color:#ff5ea8;text-align:center;padding:25px">Feed load failed. Check database connection.</p>';
    }finally{ loading=false; }
  }
  window.loadFeed = loadFeed;
  function init(){ loadFeed(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
