/* ===== PIXORO REELS V1028 - FIXED - CORRECTED ===== */
(function () {
  "use strict";
  let loading = false;
  let observer = null;
  function getClient() {
    return window.getSupa ? window.getSupa() : window.supa || null;
  }
  function escapeHTML(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function safeURL(v) {
    try { const u = new URL(v, location.href); return ["https:", "http:"].includes(u.protocol) ? escapeHTML(u.href) : ""; } catch { return ""; }
  }
  function openSheet(id) { document.getElementById(id)?.classList.add("open", "show"); }
  window.openSheet = openSheet;
  window.closeSheet = function (id) { document.getElementById(id)?.classList.remove("open", "show"); };
  window.toggleMuteAll = function () {
    window._MUTED = !window._MUTED;
    document.querySelectorAll(".reel-main").forEach(v => { v.muted = !!window._MUTED; });
  };
  async function loadReels() {
    const wrap = document.getElementById("reelWrap");
    if (!wrap || loading) return;
    const supa = getClient();
    if (!supa) { wrap.innerHTML = '<div style="color:white;text-align:center;padding-top:40vh">Database not ready</div>'; return; }
    loading = true;
    try {
      let MY_ID = "";
      const sessionResult = await supa.auth.getSession();
      MY_ID = sessionResult.data?.session?.user?.id || "";
      const postResult = await supa.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
      if (postResult.error) throw postResult.error;
      let posts = Array.isArray(postResult.data) ? [...postResult.data] : [];
      const reelResult = await supa.from("reels").select("*").order("created_at", { ascending: false }).limit(50);
      if (!reelResult.error && Array.isArray(reelResult.data)) {
        reelResult.data.forEach(r => {
          const url = r.media_url || r.video_url || "";
          if (!url) return;
          const duplicate = posts.some(p => { const purl = p.video_url || p.media_url || p.image_url || ""; return purl === url; });
          if (!duplicate) {
            posts.push({ id: "reel-" + r.id, user_id: r.user_id, username: r.username, avatar_url: r.avatar_url, caption: r.caption, media_url: url, video_url: url, media_type: "video", created_at: r.created_at, likes_count: r.likes_count || 0, comments_count: r.comments_count || 0 });
          }
        });
      }
      const videos = posts.filter(p => {
        const url = String(p.video_url || p.media_url || p.image_url || "");
        return String(p.media_type || "").toLowerCase() === "video" || String(p.media_type || "").toLowerCase() === "reel" || /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
      });
      if (!videos.length) { wrap.innerHTML = '<div style="color:white;text-align:center;padding-top:40vh">Innum Reels Illa da 😅<br>Post la Video Upload Pannu da</div>'; return; }
      const userIds = [...new Set(videos.map(p => p.user_id).filter(Boolean))];
      const profileMap = {};
      if (userIds.length) {
        const profileResult = await supa.from("profiles").select("id,username,avatar_url").in("id", userIds);
        if (!profileResult.error) { (profileResult.data || []).forEach(p => { profileMap[String(p.id)] = p; }); }
      }
      if (MY_ID && profileMap[String(MY_ID)]?.avatar_url) {
        window.MY_PFP = profileMap[String(MY_ID)].avatar_url;
        document.querySelectorAll("#navPfp,.navPfp").forEach(n => { n.src = window.MY_PFP; });
      }
      if (observer) observer.disconnect();
      wrap.innerHTML = videos.map(p => {
        const id = String(p.id);
        const owner = String(p.user_id || "");
        const prof = profileMap[owner] || {};
        const username = String(prof.username || p.username || "Pixoro User");
        const caption = escapeHTML(p.caption || "");
        const safeName = escapeHTML(username);
        const pfp = safeURL(prof.avatar_url || p.avatar_url || "");
        const media = safeURL(p.video_url || p.media_url || p.image_url || "");
        const letter = escapeHTML(username.charAt(0).toUpperCase());
        return `
        <div class="reel" data-id="${escapeHTML(id)}" data-owner="${escapeHTML(owner)}">
          <video class="reel-main" src="${media}" loop playsinline muted preload="metadata"></video>
          <div class="progress"></div>
          <div class="centerCtrl"><div class="centerIcon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>
          <div class="heartBurst"></div>
          <div class="btm">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="reel-pfp-wrap" data-profile="${safeName}">${pfp ? `<img src="${pfp}" onerror="this.remove()">` : `<div style="width:100%;height:100%;background:#FF4D8D;display:flex;align-items:center;justify-content:center;font-weight:800">${letter}</div>`}</div>
              <span class="reel-username" data-profile="${safeName}">@${safeName}</span>
              <button class="followBtnPerusa" data-action="follow" data-follow-user="${safeName}" data-follow-username="${safeName}">Follow</button>
            </div>
            <div class="reel-caption"><b>@${safeName}</b> ${caption}</div>
          </div>
          <div class="vBar">
            <div class="vBtn" data-action="like"><span class="vIcon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></span><span class="rCount">${Number(p.likes_count) || 0}</span></div>
            <div class="vBtn" data-action="comments"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 8 8z"/></svg><span>${Number(p.comments_count) || 0}</span></div>
            <div class="vBtn" data-action="share"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg><span>Share</span></div>
            <div class="vBtn" data-action="save"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span>Save</span></div>
            <div class="vBtn tildeBtn" data-action="more"><span>⋯</span></div>
            <div class="audioWrap"><div class="audioDiscInBar">${pfp ? `<img src="${pfp}" style="width:100%;height:100%;object-fit:cover">` : letter}</div></div>
          </div>
        </div>`;
      }).join("");
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target.querySelector("video");
          if (!video) return;
          if (entry.isIntersecting) { video.muted = !!window._MUTED; window._CUR = entry.target.dataset.id; video.play().catch(() => {}); } else { video.pause(); }
        });
      }, { threshold: 0.6 });
      wrap.querySelectorAll(".reel").forEach(item => {
        observer.observe(item);
        const video = item.querySelector("video");
        video.addEventListener("click", () => {
          const center = item.querySelector(".centerCtrl");
          if (video.paused) { video.play().catch(() => {}); center?.classList.remove("show"); } else { video.pause(); center?.classList.add("show"); }
        });
        let lastTap = 0;
        item.addEventListener("touchend", e => {
          if (e.target.closest(".vBar,.followBtnPerusa,.reel-pfp-wrap,.reel-username")) return;
          const now = Date.now();
          if (now - lastTap < 320) {
            const heart = item.querySelector(".heartBurst");
            heart.innerHTML = `<svg viewBox="0 0 24 24" fill="#ff3040" stroke="#fff" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
            heart.classList.remove("show"); void heart.offsetWidth; heart.classList.add("show");
            const btn = item.querySelector('[data-action="like"]');
            if (btn && !btn.classList.contains("liked")) { if(window.likeReel) window.likeReel(item.dataset.id, btn); }
          }
          lastTap = now;
        }, { passive: true });
      });
      wrap.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const reel = btn.closest(".reel");
          const id = reel?.dataset.id;
          switch (btn.dataset.action) {
            case "like": if(window.likeReel) window.likeReel(id, btn); break;
            case "comments": window.openComments(id); break;
            case "share": window.openShare(id); break;
            case "save": window.saveReel(id, btn); break;
            // ✅ CORRECTED - Core oda Real Follow ah Koopdu da - Reels la Overwrite Pannathu da
            case "follow": if(window.pixoroToggleFollow) window.pixoroToggleFollow(btn.dataset.followUser || btn.dataset.followUsername || "", btn); break;
            case "more": window._CUR = id; openSheet("viewerSheet"); break;
          }
        });
      });
      wrap.querySelectorAll("[data-profile]").forEach(el => { el.addEventListener("click", () => { window.openFriendProfile(el.dataset.profile); }); });
      window.dispatchEvent(new Event("pixoro-reels-rendered"));
      if (window.pixoroLoadAvatars) window.pixoroLoadAvatars();
      // ✅ Follow Button ah Core kitta Paint Panna Sollu da
      if (window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
    } catch (e) {
      console.error("PIXORO REELS ERROR:", e);
      wrap.innerHTML = `<div style="color:#ff5ea8;text-align:center;padding-top:40vh">Reels load failed<br>${escapeHTML(e.message || "Unknown error")}</div>`;
    } finally { loading = false; }
  }
  // ❌ likeReel ah Inga Overwrite Panna Koodathu da - Core Guard Thaan Handle Pannum da - Heart Mattum Thudikkum da
  // ✅ CORRECTED - Save Real ah Pannu da - UI Mattum Illa da
  window.saveReel = function (id, el) {
    if(window.pixoroSave) window.pixoroSave(String(id||"").replace("reel-",""));
    el?.classList.toggle("saved");
  };
  // ❌ toggleFollow ah Inga Overwrite Panna Koodathu da - Core oda Real Follow Pochidum da
  window.openComments = function (id) { window._CUR = id; openSheet("commentSheet"); };
  window.postComment = function () { const input = document.getElementById("commentInput"); if (!input?.value.trim()) return; input.value = ""; };
  window.openShare = function (id) { window._CUR = id; openSheet("shareSheet"); };
  window.copyLinkSafe = function () { navigator.clipboard?.writeText(location.href); window.closeSheet("viewerSheet"); window.closeSheet("shareSheet"); };
  // ✅ CORRECTED - Profile ?u= Thaan da - ?user= Illa da
  window.openFriendProfile = function (username) {
    if (!username) return;
    location.href = "profile.html?u=" + encodeURIComponent(username);
  };
  window.editReel = () => window.closeSheet("ownerSheet");
  window.shareQR = () => window.copyLinkSafe();
  window.deleteSafe = () => window.closeSheet("ownerSheet");
  window.notInterestedSafe = () => window.closeSheet("viewerSheet");
  window.hideReelSafe = () => window.closeSheet("viewerSheet");
  window.reportSafe = () => window.closeSheet("viewerSheet");
  window.shareWA = function () { const url = "https://wa.me/?text=" + encodeURIComponent("Pixoro Reel Paaru 🔥 " + location.href); window.open(url, "_blank", "noopener"); };
  window.loadPixoroReels = loadReels;
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", loadReels); } else { loadReels(); }
})();
