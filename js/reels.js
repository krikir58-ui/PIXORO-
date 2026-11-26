// ===== PIXORO REELS - V1020 - FINAL CORRECT DA - Thani File Connect da =====
(function(){
"use strict";
let loading = false;

function getClient(){ return window.getSupa ? window.getSupa() : window.supa || window.supabaseClient || null; }
function escapeHTML(v){ return String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeURL(v){ try{ let u=new URL(v, location.href); return ['https:','http:'].includes(u.protocol)?escapeHTML(u.href):''; }catch{ return ''; } }

// ✅ Reels ku Thevaiyana Sheet / Mute Mattum Inga Irukku da
window.closeSheet = (id)=>{ document.getElementById(id)?.classList.remove("open"); document.getElementById(id)?.classList.remove("show"); };
function openSheet(id){ document.getElementById(id)?.classList.add("open"); document.getElementById(id)?.classList.add("show"); }
window.openSheet = openSheet;
window.toggleMuteAll = ()=>{ window._MUTED = !window._MUTED; document.querySelectorAll(".reel-main").forEach(v=> v.muted = !!window._MUTED); };

async function loadReels(){
  let wrap = document.getElementById("reelWrap");
  if(!wrap || loading) return;
  let supa = getClient();
  if(!supa){ wrap.innerHTML = `<div style="color:#fff;text-align:center;padding-top:40vh">Database not ready</div>`; return; }
  loading = true;
  try{
    let MY_ID = "";
    try{ let r = await supa.auth.getSession(); MY_ID = r.data?.session?.user?.id || ""; }catch(e){}

    let {data: posts, error} = await supa.from('posts').select('*').order('created_at',{ascending:false}).limit(50);
    if(error) throw error;

    try{
      let {data: reels} = await supa.from('reels').select('*').order('created_at',{ascending:false}).limit(50);
      (reels||[]).forEach(r=>{
        let dup = (posts||[]).some(p=> String(p.media_url||p.video_url||'') === String(r.media_url||r.video_url||''));
        if(!dup) posts.push({ id:'reel-'+r.id, user_id:r.user_id, caption:r.caption, media_url:r.media_url||r.video_url, video_url:r.video_url, media_type:'video', created_at:r.created_at, likes_count:0, comments_count:0 });
      });
    }catch(e){}

    let videos = (posts||[]).filter(p=>{
      let v = String(p.video_url || '').trim();
      let m = String(p.media_url || p.image_url || '').trim();
      if(v) return true;
      if(p.media_type === 'video' || p.is_reel === true) return true;
      if(/\.(mp4|mov|webm)(\?|$)/i.test(m) || m.includes('video')) return true;
      if(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(m)) return false;
      return !!m;
    });

    if(!videos.length){ wrap.innerHTML = `<div style="color:#fff;text-align:center;padding-top:40vh">Innum Reels Illa da 😅<br>Post la Video Upload Pannu da</div>`; return; }

    let userIds = [...new Set(videos.map(p=>p.user_id).filter(Boolean))];
    let profileMap = {};
    if(userIds.length){
      let {data: profiles} = await supa.from('profiles').select('id,username,avatar_url').in('id', userIds);
      (profiles||[]).forEach(p=> profileMap[String(p.id)] = p);
    }
    if(MY_ID && profileMap[String(MY_ID)]?.avatar_url){
      window.MY_PFP = profileMap[String(MY_ID)].avatar_url;
      document.querySelectorAll('#navPfp,.navPfp').forEach(n=> n.src = window.MY_PFP);
    }

    wrap.innerHTML = videos.map(p=>{
      let id = escapeHTML(String(p.id));
      let prof = profileMap[String(p.user_id)] || {};
      let username = escapeHTML(prof.username || p.username || 'Pixoro User');
      let caption = escapeHTML(p.caption || '');
      let pfp = safeURL(prof.avatar_url || p.avatar_url || '');
      let media = safeURL(String(p.video_url || p.media_url || p.image_url || ''));
      let letter = username.charAt(0).toUpperCase();
      return `
      <div class="reel" data-id="${id}" data-owner="${escapeHTML(String(p.user_id||''))}">
        <video class="reel-main" src="${media}" loop playsinline muted preload="metadata"></video>
        <div class="progress"></div>
        <div class="centerCtrl"><div class="centerIcon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>
        <div class="heartBurst"></div>
        <div class="btm">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="reel-pfp-wrap" onclick="openFriendProfile('${username}')">
              ${pfp ? `<img src="${pfp}" data-avatar-user="${escapeHTML(String(p.user_id||''))}" onerror="this.remove()">` : `<div style="width:100%;height:100%;background:#FF4D8D;display:flex;align-items:center;justify-content:center;font-weight:800">${letter}</div>`}
            </div>
            <span class="reel-username" onclick="openFriendProfile('${username}')">@${username}</span>
            <button class="followBtnPerusa" onclick="toggleFollow(this)">Follow</button>
          </div>
          <div class="reel-caption"><b>@${username}</b> ${caption}</div>
        </div>
        <div class="vBar">
          <div class="vBtn" onclick="likeReel('${id}',this,event)"><span class="vIcon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></span><span class="rCount">${p.likes_count||0}</span></div>
          <div class="vBtn" onclick="openComments('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>${p.comments_count||0}</span></div>
          <div class="vBtn" onclick="openShare('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg><span>Share</span></div>
          <div class="vBtn" onclick="saveReel('${id}',this)"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span>Save</span></div>
          <div class="vBtn tildeBtn" onclick="openSheet('viewerSheet');window._CUR='${id}'"><span>⋯</span></div>
          <div class="audioWrap"><div class="audioDiscInBar">${pfp ? `<img src="${pfp}" style="width:100%;height:100%;object-fit:cover">` : letter}</div></div>
        </div>
      </div>`;
    }).join("");

    let obs = new IntersectionObserver(es=>{
      es.forEach(en=>{
        let v = en.target.querySelector("video");
        if(!v) return;
        if(en.isIntersecting){ v.muted = !!window._MUTED; v.play().catch(()=>{}); window._CUR = en.target.dataset.id; }
        else v.pause();
      });
    },{threshold:0.6});
    document.querySelectorAll(".reel").forEach(r=> obs.observe(r));

    document.querySelectorAll(".reel").forEach(item=>{
      let last = 0;
      item.addEventListener("touchstart", e=>{
        if(e.target.closest(".vBar,.followBtnPerusa,.reel-pfp-wrap")) return;
        let now = Date.now();
        if(now - last < 320){
          let hb = item.querySelector(".heartBurst");
          hb.innerHTML = `<svg viewBox="0 0 24 24" fill="#ff3040" stroke="#fff" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
          hb.classList.remove("show"); void hb.offsetWidth; hb.classList.add("show");
          let btn = item.querySelector(".vBtn");
          // ✅ Double Tap Like - Thani File la Irukka likeReel ah Koopdu da
          if(btn && window.likeReel) window.likeReel(item.dataset.id, btn, null);
        }
        last = now;
      },{passive:true});
      item.querySelector("video").addEventListener("click", ()=>{
        let v = item.querySelector("video");
        let cc = item.querySelector(".centerCtrl");
        if(v.paused){ v.play(); cc.classList.remove("show"); } else { v.pause(); cc.classList.add("show"); }
      });
    });

    window.dispatchEvent(new Event('pixoro-reels-rendered'));
    if(window.pixoroLoadAvatars) window.pixoroLoadAvatars();

  }catch(e){
    console.error('REELS ERROR:', e);
    wrap.innerHTML = `<div style="color:#ff5ea8;text-align:center;padding-top:40vh">Reels load failed da</div>`;
  }finally{ loading = false; }
}

// ✅ Reels ku Mattum Thevaiyana Small Functions da - Like / Comment / Share / Save Inga Illa da
window.toggleFollow = (btn)=>{ btn.classList.toggle("following"); btn.textContent = btn.classList.contains("following") ? "Following" : "Follow"; };
window.openFriendProfile = (u)=>{ if(u) location.href="profile.html?user="+encodeURIComponent(u); };
window.editReel = ()=> window.closeSheet("ownerSheet");
window.shareQR = ()=>{ if(window.copyLinkSafe) window.copyLinkSafe(); else window.closeSheet("ownerSheet"); };
window.deleteSafe = ()=> window.closeSheet("ownerSheet");
window.notInterestedSafe = ()=> window.closeSheet("viewerSheet");
window.hideReelSafe = ()=> window.closeSheet("viewerSheet");
window.reportSafe = ()=> window.closeSheet("viewerSheet");

// ❌ THOOKITEN DA - Ithu Ellam Thani File la Irukku da - Inga Irundha Duplicate Aayidum da
// window.likeReel, window.openComments, window.postComment, window.openShare, window.saveReel, window.copyLinkSafe, window.shareWA

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", loadReels);
else loadReels();
})();
