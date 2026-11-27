/* ===== PIXORO FEED V1035 - CORRECTED - INSTAGRAM 2026 LIKE + AVATAR DA ===== */
// ✅ V1035 FIX 1 - setupDoubleTap FULL DELETE da - like.js Mattum Like Pannum da - Unlike Aagaathu da
// ✅ V1035 FIX 2 - Avatar Fix da - Profile Photo Thaan Ella Page ku Varum da - G Letter Varaathu da
// ✅ V1035 FIX 3 - big-heart Div Delete da - like.js Thaan Periya Heart Kaattum da
(function(){
  "use strict";
  let loading = false;
  let _tried = 0;
  function getClient(){
    return (typeof window.getSupa === 'function') ? window.getSupa() : (window.supa || null);
  }
  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function cleanName(v){ return String(v||"").replace(/^@+/,"").trim(); }
  function safeURL(v){
    try{ const u = new URL(v, location.href); return ["https:","http:"].includes(u.protocol) ? esc(u.href) : ""; }catch{ return ""; }
  }
  // ✅ V1035 - En Photo va Eduthu Ella Edathula Podu da
  function getMyPhoto(){
    return window.MY_PFP || localStorage.getItem("pixoro_avatar") || localStorage.getItem("pixoro_pfp") || localStorage.getItem("my_avatar") || "";
  }
  function getAvatarFor(owner, prof, p, MY_ID){
    // 1. En Post na - En Profile Photo Thaan da
    if(MY_ID && String(owner) === String(MY_ID)){
      let mine = getMyPhoto() || prof?.avatar_url || p?.avatar_url || "";
      if(mine) return safeURL(mine);
    }
    // 2. Vera User na - profiles la Irukka Photo da
    let a = prof?.avatar_url || p?.avatar_url || "";
    return a ? safeURL(a) : "";
  }
  // ✅ V1035 - Profile Photo ah Ella Page ku Sync Pannu da - nav + story + feed
  async function pixoroSyncMyAvatar(MY_ID){
    let supa = getClient(); if(!supa || !MY_ID) return;
    try{
      let { data } = await supa.from("profiles").select("avatar_url,username").eq("id", MY_ID).single();
      let photo = data?.avatar_url || getMyPhoto();
      if(!photo) return;
      window.MY_PFP = photo;
      try{ localStorage.setItem("pixoro_avatar", photo); }catch(e){}
      // Nav + Story la Irukka En Photo ah Maathu da
      document.querySelectorAll(".myPfp, #navPfp, #myStoryImg").forEach(img=>{
        if(img && img.tagName === "IMG"){ img.src = photo; img.style.display = "block"; }
      });
      let letter = document.getElementById("myStoryLetter"); if(letter) letter.style.display = "none";
      // Feed la En Post ku Irukka Photo ah Maathu da
      document.querySelectorAll('[data-owner="'+MY_ID+'"] .feedPfpImg').forEach(img=>{ img.src = photo; img.style.display = "block"; });
      document.querySelectorAll('[data-owner="'+MY_ID+'"] .feedPfpLetter').forEach(s=>{ s.style.display = "none"; });
    }catch(e){}
  }
  window.pixoroSyncMyAvatar = pixoroSyncMyAvatar;

  async function loadPixoroFeed(){
    let feed = document.getElementById("feed");
    if(!feed || loading) return;
    let supa = getClient();
    if(!supa){
      _tried++;
      if(_tried <= 3){ setTimeout(loadPixoroFeed, 1500); return; }
      return;
    }
    loading = true;
    _tried = 0;
    if(!feed.innerHTML.trim() || feed.innerHTML.includes("Innum Post")){
      feed.innerHTML = '';
    }
    try{
      let MY_ID = "";
      try{ let {data:{session}} = await supa.auth.getSession(); MY_ID = session?.user?.id || ""; window.ME_ID = MY_ID || window.ME_ID; }catch(_){}
      // ✅ En Photo va Munnadiye Edu da
      if(MY_ID) await pixoroSyncMyAvatar(MY_ID);
      let r = await supa.from("posts").select("*").order("created_at",{ascending:false}).limit(100);
      if(r.error) throw r.error;
      let posts = Array.isArray(r.data) ? [...r.data] : [];
      let blocked = [];
      try{ if(window.ME_ID && typeof window.pixoroGetBlockedIds === 'function'){ blocked = await window.pixoroGetBlockedIds(); } }catch(_){}
      let mode = window.PIXORO_FEED_MODE || 'foryou';
      let clean = posts.filter(p=>{
        if(p.is_archived === true) return false;
        if(p.visibility === 'private_share') return false;
        if(p.user_id && blocked.includes(String(p.user_id))) return false;
        let uname = cleanName(p.username||"").toLowerCase();
        if(uname === "pixoro") return false;
        return true;
      });
      if(mode === 'following' && MY_ID){
        try{
          let {data:fl} = await supa.from("follows").select("following_id").eq("follower_id", MY_ID).eq("status","accepted");
          let ids = new Set((fl||[]).map(x=>String(x.following_id)));
          ids.add(String(MY_ID));
          clean = clean.filter(p=> ids.has(String(p.user_id)));
        }catch(_){}
      }
      clean.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
      if(!clean.length){
        feed.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;line-height:1.8;font-weight:700">Innum Post Illa da 😅<br><span style="color:#aaa;font-size:13px;font-weight:400">+ Button ah Thottu Post Podu da</span><br><br><button onclick="location.href=\'./create.html\'" style="background:#FF2DCC;color:#fff;border:none;padding:12px 22px;border-radius:22px;font-weight:800">+ Post Podu da</button></div>';
        return;
      }
      let userIds = [...new Set(clean.map(p=>p.user_id).filter(Boolean))];
      let profileMap = {};
      if(userIds.length){
        try{
          let pr = await supa.from("profiles").select("id,username,avatar_url").in("id", userIds);
          if(!pr.error) (pr.data||[]).forEach(p=>{ profileMap[String(p.id)] = p; });
        }catch(_){}
      }
      window.profileMap = profileMap;
      if(MY_ID && profileMap[String(MY_ID)]){
        window.ME_RAW = cleanName(profileMap[String(MY_ID)].username || window.ME_RAW);
        if(profileMap[String(MY_ID)].avatar_url){ window.MY_PFP = profileMap[String(MY_ID)].avatar_url; try{ localStorage.setItem("pixoro_avatar", window.MY_PFP); }catch(e){} }
      }
      try{
        let tb = document.getElementById("trendBar");
        if(tb){ tb.style.display = "none"; tb.innerHTML = ""; }
        let tn = document.getElementById("pixoroTopNote");
        if(tn) tn.style.display = "none";
      }catch(_){}
      feed.innerHTML = clean.map(p=>{
        let id = String(p.id);
        let owner = String(p.user_id||"");
        let prof = profileMap[owner] || {};
        let username = cleanName(prof.username || p.username || "Pixoro User");
        // ✅ V1035 - Avatar Fix da - En Photo na En Photo, Vera User na Avanga Photo da
        let avatar = getAvatarFor(owner, prof, p, MY_ID);
        let letter = esc(username.charAt(0).toUpperCase());
        let caption = esc(p.caption||"");
        let img = safeURL(p.image_url || p.media_url || p.video_url || "");
        let isVideo = /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(img) || String(p.media_type||"").toLowerCase()==="video" || String(p.media_type||"").toLowerCase()==="reel";
        let tick = (typeof window.goldTickHTML === 'function') ? window.goldTickHTML({username: username, user_id: owner, id: owner}) : '';
        let likes = Number(p.likes_count)||0;
        let comments = Number(p.comments_count)||0;
        let isMine = MY_ID && String(MY_ID) === owner;
        let time = p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "";
        return '<article class="post" data-post-id="'+esc(id)+'" data-id="'+esc(id)+'" data-owner="'+esc(owner)+'" style="background:#000;border-bottom:1px solid #222;padding-bottom:12px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:center;gap:10px;padding:12px">'
        // ✅ V1035 - ID Pakkathula Circle Photo da - Photo Illana Mattum Letter da - Photo Irundha Letter Varaathu da
        + '<div class="pfpRing" onclick="location.href=\'./profile.html?u='+esc(owner)+'\'" style="cursor:pointer"><div class="pfpInner">'+(avatar ? '<img class="feedPfpImg" src="'+avatar+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><span class="feedPfpLetter" style="color:#fff;font-weight:800;display:none">'+letter+'</span>' : '<span class="feedPfpLetter" style="color:#fff;font-weight:800">'+letter+'</span>')+'</div></div>'
        + '<div style="flex:1;min-width:0"><b style="color:#fff;cursor:pointer" onclick="location.href=\'./profile.html?u='+esc(owner)+'\'">'+esc(username)+' '+tick+'</b><div style="color:#888;font-size:11px">'+esc(time)+'</div></div>'
        + (isMine ? '' : '<button class="followBtnPost" data-action="follow" data-follow-user="'+esc(username)+'" data-follow-username="'+esc(username)+'">Follow</button>')
        + '<button onclick="openPostMenu(\''+esc(id)+'\',\''+esc(owner)+'\',\''+esc(username)+'\')" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer">⋯</button>'
        + '</div>'
        // ✅ V1035 - Photo Wrapper da - big-heart Delete da - like.js Thaan Heart Kaattum da
        + (img ? '<div class="post-media" data-post-id="'+esc(id)+'" style="position:relative;overflow:hidden">'
        + (isVideo ? '<video src="'+img+'" style="width:100%;aspect-ratio:4/5;object-fit:cover;background:#111" controls playsinline preload="metadata"></video>' : '<img src="'+img+'" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#111">')
        + '</div>' : '')
        + '<div style="display:flex;gap:18px;padding:10px 12px;align-items:center">'
        + '<button class="like-btn" data-like-btn="true" data-action="like" data-post-id="'+esc(id)+'" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg><span class="rCount like-count" data-like-count="true" style="color:#fff;font-size:14px">'+likes+'</span></button>'
        + '<button onclick="openComment(\''+esc(id)+'\')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 8 8z"/></svg><span style="color:#fff;font-size:14px">'+comments+'</span></button>'
        + '<button onclick="openShareModal ? openShareModal(\''+esc(id)+'\') : openShare(\''+esc(id)+'\')" style="background:none;border:none;cursor:pointer"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>'
        + '<button onclick="savePostFeed(\''+esc(id)+'\', this)" style="background:none;border:none;cursor:pointer;margin-left:auto"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>'
        + '</div>'
        + '<div style="padding:0 12px 10px;color:#fff;font-size:14px"><b>'+esc(username)+'</b> '+caption+'</div>'
        + '</article>';
      }).join("");
      feed.querySelectorAll('[data-action="follow"]').forEach(btn=>{
        btn.addEventListener("click", ()=>{
          if(window.pixoroToggleFollow) window.pixoroToggleFollow(btn.dataset.followUser||"", btn);
        });
      });
      if(window.pixoroLoadAvatars) window.pixoroLoadAvatars();
      if(window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
      if(window.pixoroCheckBell) window.pixoroCheckBell();
      if(MY_ID) pixoroSyncMyAvatar(MY_ID);
      window.dispatchEvent(new Event("pixoro-feed-rendered"));
      if(window.pixoroPaintAllLikes) setTimeout(()=>window.pixoroPaintAllLikes(), 50);
      // ❌ setupDoubleTap Call Delete da - like.js Thaan Pannum da
    }catch(e){
      console.error("PIXORO FEED ERROR:", e);
    }finally{
      loading = false;
    }
  }
  window.openComment = function(id){
    window._CUR = id;
    if(window.openComments) return window.openComments(id);
    let m = document.getElementById("commentModal");
    if(m) m.style.display = "block";
  };
  window.closeComment = function(){ let m = document.getElementById("commentModal"); if(m) m.style.display = "none"; };
  window.openPostMenu = function(id, owner, username){
    window._CUR = id; window._CUR_OWNER = owner; window._CUR_USER = username;
    let box = document.getElementById("postMenuBox");
    let sheet = document.getElementById("postMenu");
    if(box) box.innerHTML = '<div style="padding:16px;color:#fff;text-align:center">'
      + '<div onclick="openComment(\''+esc(id)+'\')" style="padding:12px;border-bottom:1px solid #333;cursor:pointer">💬 Comments</div>'
      + '<div onclick="openShare(\''+esc(id)+'\')" style="padding:12px;border-bottom:1px solid #333;cursor:pointer">✈️ Share</div>'
      + '<div onclick="closePostMenu()" style="padding:12px;cursor:pointer;color:#aaa">Cancel</div></div>';
    if(sheet) sheet.style.display = "block";
  };
  window.closePostMenu = function(){ let s = document.getElementById("postMenu"); if(s) s.style.display = "none"; };
  window.savePostFeed = async function(id, btn){
    try{
      if(window.pixoroSave) await window.pixoroSave(id);
      if(btn){ let svg = btn.querySelector("svg"); if(svg){ svg.setAttribute("fill","#fff"); svg.querySelector("path")?.setAttribute("fill","#fff"); } }
    }catch(_){}
  };
  window.setFeedMode = function(mode){
    window.PIXORO_FEED_MODE = mode || 'foryou';
    document.querySelectorAll('.feedTab').forEach(t=>t.classList.remove('active'));
    let map = {foryou:'tabForYou', following:'tabFollowing', latest:'tabLatest'};
    let el = document.getElementById(map[mode]||'tabForYou');
    if(el) el.classList.add('active');
    loading = false;
    loadPixoroFeed();
  };
  window.loadPixoroFeed = loadPixoroFeed;
  window.getPixoroFeed = loadPixoroFeed;
  window.addEventListener("pixoro-supa-ready", ()=>{ _tried = 0; loading = false; loadPixoroFeed(); });
  if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", loadPixoroFeed); }
  else { loadPixoroFeed(); }
})();
