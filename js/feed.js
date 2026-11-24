/* PIXORO FEED - FINAL CORRECTED DA - NO DOUBLE LIKE DA - NO BLOCK DA */
(function () {
  'use strict';
  let loading = false;
  function getClient(){ return window.getSupa ? window.getSupa() : window.supa || null; }
  function escapeHTML(v){ return String(v||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeURL(v){ try{ let u=new URL(v, location.href); return ['https:','http:'].includes(u.protocol)?escapeHTML(u.href):''; }catch{ return ''; } }
  function feedTime(t){ if(!t) return ''; let d=new Date(t), n=new Date(), diff=Math.floor((n-d)/1000); if(diff<60) return 'Just now'; if(diff<3600) return Math.floor(diff/60)+'m'; if(diff<86400) return Math.floor(diff/3600)+'h'; return d.toLocaleDateString([],{day:'numeric',month:'short'}); }

  /* ✅ BLOCK REMOVE - Story Click Block Aaga Kudathu da */
  function unblockStories(){
    const bar = document.getElementById('storyBar');
    if(bar){ bar.style.pointerEvents='auto'; bar.style.zIndex='10'; bar.style.position='relative'; }
    document.querySelectorAll('.sItem, .sRing, .sAddWrap, .sAddImg').forEach(el=>{
      el.style.pointerEvents='auto'; el.style.cursor='pointer';
    });
    // ✅ Mela irukura Overlay / Top Note Block pannama Paathuko da
    const note = document.getElementById('pixoroTopNote');
    if(note) note.style.pointerEvents='none';
  }

  /* ✅ STORY - Thotta Direct Page ku Poku da - Box Illa da */
  async function loadStories(){
    const bar = document.getElementById('storyBar') || document.getElementById('storyBox');
    if(!bar) return;
    const supa = getClient();
    if(!supa) return;
    try{
      let MY_ID = '';
      try{ let { data:{session} } = await supa.auth.getSession(); MY_ID = session?.user?.id || ''; }catch{}

      let myPfp = '', myHasStory = false;
      if(MY_ID){
        let { data: me } = await supa.from('profiles').select('avatar_url,username').eq('id', MY_ID).maybeSingle();
        myPfp = me?.avatar_url || '';
      }

      let { data: stories } = await supa.from('stories').select('*').order('created_at',{ascending:false}).limit(30);
      stories = stories || [];

      // ✅ Enakku Story irukka nu Paaru da - Iruntha View, Illana Add da
      if(MY_ID) myHasStory = stories.some(s=> String(s.user_id)===String(MY_ID));

      let seenUser = new Set();
      let items = stories.filter(s=>{
        if(seenUser.has(String(s.user_id))) return false;
        seenUser.add(String(s.user_id));
        return true;
      });
      // ✅ En Story ah List la Double Vara Kudathu da
      items = items.filter(s=> String(s.user_id)!==String(MY_ID));

      let ids = [...new Set(items.map(s=>s.user_id).filter(Boolean))];
      let profMap = {};
      if(ids.length){
        let { data: profs } = await supa.from('profiles').select('id,username,avatar_url').in('id', ids);
        (profs||[]).forEach(p=> profMap[String(p.id)] = p);
      }

      let html = `
        <div class="sItem" data-story-user="me" data-has-story="${myHasStory ? '1':'0'}">
          <div class="sAddWrap">
            ${myPfp ? `<img class="sAddImg" src="${safeURL(myPfp)}">` : `<div class="sAddImg" style="display:grid;place-items:center;font-size:22px;font-weight:900">+</div>`}
            <div class="sAddPlus">+</div>
          </div>
          <div class="sName">My Story</div>
        </div>`;

      html += items.map(s=>{
        const prof = profMap[String(s.user_id)] || {};
        const name = escapeHTML(prof.username || 'User');
        const pfp = prof.avatar_url || s.media_url || '';
        const letter = name.charAt(0).toUpperCase();
        return `
        <div class="sItem" data-story-user="${escapeHTML(String(s.user_id))}">
          <div class="sRing"><div class="sRingInner">
            ${pfp ? `<img src="${safeURL(pfp)}" onerror="this.remove()">` : `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);display:grid;place-items:center;font-weight:900">${letter}</div>`}
          </div></div>
          <div class="sName">${name}</div>
        </div>`;
      }).join('');

      let row = document.getElementById('storyRow') || document.getElementById('storyBox');
      if(row) row.innerHTML = html;
      else bar.innerHTML = html;

      unblockStories();

    }catch(e){ console.error('STORY LOAD ERROR:', e); }
  }

  /* ✅ CLICK - Delegation da - Vera Handler Block panna Mudiyathu da */
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.sItem');
    if(!item) return;
    e.preventDefault(); e.stopPropagation();
    const uid = item.dataset.storyUser;
    if(uid === 'me'){
      // ✅ Story iruntha Paaru da, illana Add pannu da - Block Illa da
      if(item.dataset.hasStory === '1'){
        window.location.href = '/story.html?user=me';
      } else {
        window.location.href = '/add-story.html';
      }
      return;
    }
    window.location.href = '/story.html?user=' + encodeURIComponent(uid);
  }, true);

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
        if(!window.FEED_LIKES) window.FEED_LIKES = new Set();
        likedSet.forEach(id=> window.FEED_LIKES.add(id));
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
        const isLiked = likedSet.has(id) ? ' liked' : '';
        const isSaved = savedSet.has(id) ? ' saved' : '';
        return `
        <article class="post" data-post-id="${id}">
          <div class="postTop">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="pfpRing"><div class="pfpInner">${pfp ? `<img src="${pfp}" onerror="this.remove()">` : `<div class="avaLetterHome">${letter}</div>`}</div></div>
              <div><b>${username}</b><div style="font-size:11px;color:#888">${feedTime(post.created_at)}</div></div>
            </div>
            ${isMine ? `<span style="font-size:22px;color:#fff;cursor:pointer">⋯</span>` : `<button class="followBtnPost" onclick="pixoroToggleFollow('${username}',this)">Follow</button>`}
          </div>
          <div class="postMedia" onclick="pixoroFeedTap('${id}', this, event)">
            ${safeMedia ? (video ? `<video class="main" src="${safeMedia}" muted playsinline loop></video>` : `<img class="main" src="${safeMedia}" loading="lazy">`) : '<p style="padding:25px;color:#aaa">Media unavailable</p>'}
          </div>
          <div class="actions">
            <div class="left">
              <button data-like-btn="${id}" class="act${isLiked}">
                <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                <span data-like-count="${id}">${post.likes_count||0}</span>
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
  window.loadStories = loadStories;
  function init(){ loadStories(); loadFeed(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
