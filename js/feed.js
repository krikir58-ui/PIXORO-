/* ===== PIXORO FEED V1031 - CORRECTED - FULL ===== */
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
  // ✅ V1031 - @ Remove Pannum Helper da - Username la @ Vandha Thookidum da
  function cleanName(v){ return String(v||"").replace(/^@+/,"").trim(); }
  function safeURL(v){
    try{ const u = new URL(v, location.href); return ["https:","http:"].includes(u.protocol) ? esc(u.href) : ""; }catch{ return ""; }
  }
  function showFeedError(msg){
    let e = document.getElementById("feedError");
    if(e){ e.style.display = "block"; e.innerText = msg || "Feed Load Aagala da - Refresh Pannu da"; }
  }
  function hideFeedError(){
    let e = document.getElementById("feedError");
    if(e) e.style.display = "none";
  }
  async function loadPixoroFeed(){
    let feed = document.getElementById("feed");
    if(!feed || loading) return;
    let supa = getClient();
    if(!supa){
      _tried++;
      feed.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;font-weight:700">Feed Load Aaguthu da... 🔥</div>';
      if(_tried <= 3){ setTimeout(loadPixoroFeed, 1500); return; }
      feed.innerHTML = '<div style="color:#fff;text-align:center;padding:40px">Supabase Connect Aagala da ❌<br><br><button onclick="location.reload()" style="background:#FF2DCC;color:#fff;border:none;padding:12px 22px;border-radius:22px;font-weight:800">Retry Pannu da</button></div>';
      return;
    }
    loading = true;
    _tried = 0;
    hideFeedError();
    feed.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;font-weight:700">Feed Load Aaguthu da... 🔥</div>';
    try{
      let MY_ID = "";
      try{ let {data:{session}} = await supa.auth.getSession(); MY_ID = session?.user?.id || ""; window.ME_ID = MY_ID || window.ME_ID; }catch(_){}
      let r = await supa.from("posts").select("*").order("created_at",{ascending:false}).limit(100);
      if(r.error) throw r.error;
      let posts = Array.isArray(r.data) ? [...r.data] : [];
      // ✅ V1031 - Fake Reels Remove da - Feed la Posts Table Mattum Thaan da - Reels Merge Delete Panniten da
      let blocked = [];
      try{ if(window.ME_ID && typeof window.pixoroGetBlockedIds === 'function'){ blocked = await window.pixoroGetBlockedIds(); } }catch(_){}
      let mode = window.PIXORO_FEED_MODE || 'foryou';
      let clean = posts.filter(p=>{
        if(p.is_archived === true) return false;
        if(p.visibility === 'private_share') return false;
        if(p.user_id && blocked.includes(String(p.user_id))) return false;
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
        if(profileMap[String(MY_ID)].avatar_url){
          window.MY_PFP = profileMap[String(MY_ID)].avatar_url;
        }
      }
      // ✅ V1031 - Trend Bar Remove da - @Pixoro Duplicate Varathu da - Hide Panniten da
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
        // ✅ V1031 - @ Remove da - Username la @ Irundha Thookidum da
        let username = cleanName(prof.username || p.username || "Pixoro User");
        let avatar = safeURL(prof.avatar_url || p.avatar_url || "");
        let letter = esc(username.charAt(0).toUpperCase());
        let caption = esc(p.caption||"");
        let img = safeURL(p.image_url || p.media_url || p.video_url || "");
        let isVideo = /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(img) || String(p.media_type||"").toLowerCase()==="video" || String(p.media_type||"").toLowerCase()==="reel";
        let tick = (typeof window.goldTickHTML === 'function') ? window.goldTickHTML({username: username, user_id: owner, id: owner}) : '';
        let likes = Number(p.likes_count)||0;
        let comments = Number(p.comments_count)||0;
        let isMine = MY_ID && String(MY_ID) === owner;
        let time = p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "";
        return '<article class="post" data-id="'+esc(id)+'" data-owner="'+esc(owner)+'" style="background:#000;border-bottom:1px solid #222;padding-bottom:12px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:center;gap:10px;padding:12px">'
        // ✅ V1031 - Fake Photo Remove da - Avatar Illana Letter Mattum da - Empty Circle Illa da
        + '<div class="pfpRing" onclick="location.href=\'./profile.html?u='+esc(owner)+'\'" style="cursor:pointer"><div class="pfpInner">'+(avatar ? '<img src="'+avatar+'" onerror="this.remove()">' : '<span style="color:#fff;font-weight:800">'+letter+'</span>')+'</div></div>'
        // ✅ V1031 - @ Remove da - Pixoro Mattum Theriyum da
        + '<div style="flex:1;min-width:0"><b style="color:#fff;cursor:pointer" onclick="location.href=\'./profile.html?u='+esc(owner)+'\'">'+esc(username)+' '+tick+'</b><div style="color:#888;font-size:11px">'+esc(time)+'</div></div>'
        + (isMine ? '' : '<button class="followBtnPost" data-action="follow" data-follow-user="'+esc(username)+'" data-follow-username="'+esc(username)+'">Follow</button>')
        + '<button onclick="openPostMenu(\''+esc(id)+'\',\''+esc(owner)+'\',\''+esc(username)+'\')" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer">⋯</button>'
        + '</div>'
        + (img ? (isVideo ? '<video src="'+img+'" style="width:100%;aspect-ratio:4/5;object-fit:cover;background:#111" controls playsinline preload="metadata"></video>' : '<img src="'+img+'" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#111">') : '')
        + '<div style="display:flex;gap:18px;padding:10px 12px;align-items:center">'
        + '<button data-action="like" data-post-id="'+esc(id)+'" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;gap:6px"><span class="vIcon">❤️</span><span class="rCount" style="font-size:14px">'+likes+'</span></button>'
        + '<button onclick="openComment(\''+esc(id)+'\')" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">💬 <span style="font-size:14px">'+comments+'</span></button>'
        + '<button onclick="openShareModal ? openShareModal(\''+esc(id)+'\') : openShare(\''+esc(id)+'\')" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✈️</button>'
        + '<button onclick="savePostFeed(\''+esc(id)+'\', this)" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;margin-left:auto">🔖</button>'
        + '</div>'
        // ✅ V1031 - @ Remove da
        + '<div style="padding:0 12px 10px;color:#fff;font-size:14px"><b>'+esc(username)+'</b> '+caption+'</div>'
        + '</article>';
      }).join("");
      feed.querySelectorAll('[data-action="like"]').forEach(btn=>{
        btn.addEventListener("click", ()=>{
          let pid = btn.dataset.postId;
          let liked = btn.classList.toggle("liked");
          let cntEl = btn.querySelector(".rCount");
          let c = Number(cntEl?.textContent||0);
          if(cntEl) cntEl.textContent = liked ? c+1 : Math.max(0, c-1);
          let heart = btn.querySelector(".vIcon");
          if(heart){ try{ heart.getAnimations().forEach(a=>a.cancel()); }catch(_){} heart.animate([{transform:"scale(1)"},{transform:"scale(1.25)"},{transform:"scale(0.95)"},{transform:"scale(1)"}],{duration:280,easing:"ease-out"}); }
          (async()=>{
            try{
              if(!MY_ID) return;
              if(liked) await supa.from("likes").insert({post_id: pid, user_id: MY_ID});
              else await supa.from("likes").delete().eq("post_id", pid).eq("user_id", MY_ID);
            }catch(_){}
          })();
        });
      });
      feed.querySelectorAll('[data-action="follow"]').forEach(btn=>{
        btn.addEventListener("click", ()=>{
          if(window.pixoroToggleFollow) window.pixoroToggleFollow(btn.dataset.followUser||"", btn);
        });
      });
      if(window.pixoroLoadAvatars) window.pixoroLoadAvatars();
      if(window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
      if(window.pixoroCheckBell) window.pixoroCheckBell();
      window.dispatchEvent(new Event("pixoro-feed-rendered"));
    }catch(e){
      console.error("PIXORO FEED ERROR:", e);
      showFeedError("Feed Load Failed da - "+(e.message||""));
      feed.innerHTML = '<div style="color:#fff;text-align:center;padding:40px">Feed Load Failed da ❌<br><span style="color:#ff5ea8;font-size:13px">'+esc(e.message||"")+'</span><br><br><button onclick="location.reload()" style="background:#FF2DCC;color:#fff;border:none;padding:12px 22px;border-radius:22px;font-weight:800">Retry Pannu da</button></div>';
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
      if(btn) btn.style.opacity = "0.5";
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
