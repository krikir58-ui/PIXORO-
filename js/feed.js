/* =====================================================
   PIXORO FEED V1042 - FULL CORRECT CODE DA 🔥
   DOUBLE TAP DELETE - LIKE ONLY IN like.js V67
   HEART 46px - SPEED 1000ms - LIKE=RED / UNLIKE=WHITE
   + COMMENT LIKE GUARD DA - like.js Comment Heart ah Thoda Koodathu da
   ===================================================== */

(function () {
"use strict";

let loading = false;
let retryCount = 0;

function getClient() {
  return typeof window.getSupa === "function"
    ? window.getSupa()
    : window.supa || window.supabaseClient || null;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function cleanName(v) {
  return String(v || "").replace(/^@+/, "").trim();
}

function safeURL(v) {
  try {
    const u = new URL(v, location.href);
    return ["https:", "http:"].includes(u.protocol)
      ? u.href
      : "";
  } catch {
    return "";
  }
}

function getMyPhoto() {
  return window.MY_PFP ||
    localStorage.getItem("pixoro_avatar") ||
    localStorage.getItem("pixoro_pfp") ||
    localStorage.getItem("my_avatar") ||
    "";
}

function getAvatar(owner, profile, post, myId) {
  if (myId && String(owner) === String(myId)) {
    return safeURL(
      getMyPhoto() ||
      profile?.avatar_url ||
      post?.avatar_url ||
      ""
    );
  }
  return safeURL(
    profile?.avatar_url ||
    post?.avatar_url ||
    ""
  );
}

/* AVATAR SYNC */
async function pixoroSyncMyAvatar(myId) {
  const supa = getClient();
  if (!supa || !myId) return;
  try {
    const { data, error } = await supa
      .from("profiles")
      .select("avatar_url,username")
      .eq("id", myId)
      .single();
    if (error) throw error;
    const photo = data?.avatar_url || getMyPhoto();
    if (!photo) return;
    window.MY_PFP = photo;
    try { localStorage.setItem("pixoro_avatar", photo); } catch (e) {}
    document.querySelectorAll(".myPfp,#navPfp,#myStoryImg").forEach(img => {
      if (img.tagName === "IMG") { img.src = photo; img.style.display = "block"; }
    });
    const letter = document.getElementById("myStoryLetter");
    if (letter) letter.style.display = "none";
  } catch (e) { console.warn("PIXORO AVATAR:", e); }
}
window.pixoroSyncMyAvatar = pixoroSyncMyAvatar;

/* EMPTY STATE */
function showEmpty(feed) {
  feed.innerHTML = `
    <div style="color:#fff;text-align:center;padding:45px 20px;line-height:1.8">
      <div style="font-size:35px">📸</div>
      <b>Innum Post Illa da</b>
      <p style="color:#999;font-size:13px">Share your first PIXORO post</p>
      <button onclick="location.href='./create.html'" style="background:#FF2DCC;color:white;border:0;border-radius:25px;padding:12px 25px;font-weight:800">+ Create Post</button>
    </div>`;
}

/* FEED LOAD */
async function loadPixoroFeed() {
  const feed = document.getElementById("feed");
  if (!feed || loading) return;
  const supa = getClient();
  if (!supa) {
    retryCount++;
    if (retryCount <= 5) { setTimeout(loadPixoroFeed, 1500); return; }
    feed.innerHTML = `<div style="color:white;text-align:center;padding:40px">Supabase connection failed.<br><br><button onclick="location.reload()">Retry</button></div>`;
    return;
  }
  loading = true;
  try {
    let myId = "";
    const auth = await supa.auth.getSession();
    myId = auth.data?.session?.user?.id || "";
    if (myId) { window.ME_ID = myId; await pixoroSyncMyAvatar(myId); }

    const result = await supa.from("posts").select("*").order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    const posts = Array.isArray(result.data) ? result.data : [];

    let blocked = [];
    try {
      if (myId && typeof window.pixoroGetBlockedIds === "function") blocked = await window.pixoroGetBlockedIds();
    } catch (e) { console.warn("BLOCK FILTER:", e); }
    if (!Array.isArray(blocked)) blocked = [];
    const blockedSet = new Set(blocked.map(String));

    let clean = posts.filter(post => {
      if (post.is_archived === true) return false;
      if (post.visibility === "private_share") return false;
      if (post.user_id && blockedSet.has(String(post.user_id))) return false;
      if (cleanName(post.username).toLowerCase() === "pixoro") return false;
      return true;
    });

    const mode = window.PIXORO_FEED_MODE || "foryou";
    if (mode === "following" && myId) {
      const follows = await supa.from("follows").select("following_id").eq("follower_id", myId).eq("status", "accepted");
      if (!follows.error) {
        const ids = new Set((follows.data || []).map(x => String(x.following_id)));
        ids.add(String(myId));
        clean = clean.filter(post => ids.has(String(post.user_id)));
      }
    }
    clean.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!clean.length) { showEmpty(feed); return; }

    const userIds = [...new Set(clean.map(p => p.user_id).filter(Boolean))];
    const profileMap = {};
    if (userIds.length) {
      const profiles = await supa.from("profiles").select("id,username,avatar_url").in("id", userIds);
      if (!profiles.error) (profiles.data || []).forEach(profile => { profileMap[String(profile.id)] = profile; });
    }
    window.profileMap = profileMap;
    if (myId && profileMap[String(myId)]) {
      window.ME_RAW = cleanName(profileMap[String(myId)].username || window.ME_RAW);
      if (profileMap[String(myId)].avatar_url) {
        window.MY_PFP = profileMap[String(myId)].avatar_url;
        try { localStorage.setItem("pixoro_avatar", window.MY_PFP); } catch (e) {}
      }
    }

    ["trendBar", "pixoroTopNote"].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

    feed.innerHTML = clean.map(post => {
      const id = String(post.id);
      const owner = String(post.user_id || "");
      const profile = profileMap[owner] || {};
      const username = cleanName(profile.username || post.username || "Pixoro User");
      const avatar = getAvatar(owner, profile, post, myId);
      const letter = esc(username.charAt(0).toUpperCase());
      const caption = esc(post.caption || "");
      const originalMedia = post.image_url || post.media_url || post.video_url || "";
      const media = safeURL(originalMedia);
      const isVideo = /\.(mp4|mov|webm|m4v)(?:[?#].*)?$/i.test(String(originalMedia)) || ["video", "reel"].includes(String(post.media_type || "").toLowerCase());
      const likes = Number(post.likes_count) || 0;
      const comments = Number(post.comments_count) || 0;
      const isMine = myId && myId === owner;
      const time = post.created_at ? new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

      return `
      <article class="post" data-post-id="${esc(id)}" data-id="${esc(id)}" data-owner="${esc(owner)}" style="background:#000;border-bottom:1px solid #222;padding-bottom:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px;padding:12px">
          <div class="pfpRing" data-profile-owner="${esc(owner)}" style="cursor:pointer">
            <div class="pfpInner">
              ${avatar ? `<img class="feedPfpImg" src="${esc(avatar)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="feedPfpLetter" style="display:none;color:white;font-weight:800">${letter}</span>` : `<span class="feedPfpLetter" style="color:white;font-weight:800">${letter}</span>`}
            </div>
          </div>
          <div style="flex:1;min-width:0">
            <b style="color:#fff;cursor:pointer" data-profile-owner="${esc(owner)}">${esc(username)}</b>
            <div style="color:#888;font-size:11px">${esc(time)}</div>
          </div>
          ${isMine ? "" : `<button class="followBtnPost" data-action="follow" data-follow-user="${esc(username)}">Follow</button>`}
          <button data-action="menu" data-post-id="${esc(id)}" data-owner="${esc(owner)}" data-username="${esc(username)}" style="background:none;border:0;color:white;font-size:22px">⋯</button>
        </div>
        ${media ? `
          <div class="post-media" data-post-id="${esc(id)}" style="position:relative;overflow:hidden">
            ${isVideo ? `<video class="main" src="${esc(media)}" style="width:100%;aspect-ratio:4/5;object-fit:cover;background:#111" playsinline preload="metadata"></video>` : `<img class="main" src="${esc(media)}" style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#111">`}
          </div>` : ""}
        <div style="display:flex;gap:18px;padding:10px 12px;align-items:center">
          <button class="like-btn" data-like-btn="true" data-post-id="${esc(id)}" style="background:none;border:0;cursor:pointer;display:flex;align-items:center;gap:6px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
            <span class="rCount like-count" data-like-count="true" style="color:white;font-size:14px">${likes}</span>
          </button>
          <button data-action="comment" data-post-id="${esc(id)}" style="background:none;border:0;cursor:pointer;display:flex;align-items:center;gap:6px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.5 8.5 0 0 1 8 8z"/></svg>
            <span data-comment-count="${esc(id)}" style="color:white;font-size:14px">${comments}</span>
          </button>
          <button data-action="share" data-post-id="${esc(id)}" style="background:none;border:0;cursor:pointer">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
          </button>
          <button data-action="save" data-post-id="${esc(id)}" style="background:none;border:0;cursor:pointer;margin-left:auto">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
        <div style="padding:0 12px 10px;color:white;font-size:14px"><b>${esc(username)}</b> ${caption}</div>
      </article>`;
    }).join("");

    feed.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        const id = btn.dataset.postId;
        if (action === "follow") { if (window.pixoroToggleFollow) window.pixoroToggleFollow(btn.dataset.followUser || "", btn); }
        if (action === "comment") window.openComment(id);
        if (action === "share") { if (typeof window.openShareModal === "function") window.openShareModal(id); else if (typeof window.openShare === "function") window.openShare(id); }
        if (action === "save") await window.savePostFeed(id, btn);
        if (action === "menu") window.openPostMenu(id, btn.dataset.owner, btn.dataset.username);
        /* LIKE IS HANDLED BY like.js ONLY - Inga Like Panna Koodathu da */
      });
    });

    feed.querySelectorAll("[data-profile-owner]").forEach(el => {
      el.addEventListener("click", () => { location.href = "./profile.html?u=" + encodeURIComponent(el.dataset.profileOwner); });
    });

    /* ✅ V1041 - DOUBLE TAP INGA ILLA DA - like.js MATTUM THAAN PAARKKUM DA - NARIYA HEART VARAATHU DA */

    if (window.pixoroLoadAvatars) window.pixoroLoadAvatars();
    if (window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
    if (window.pixoroCheckBell) window.pixoroCheckBell();
    if (myId) pixoroSyncMyAvatar(myId);
    window.dispatchEvent(new Event("pixoro-feed-rendered"));
    if (window.pixoroPaintAllLikes) setTimeout(() => window.pixoroPaintAllLikes(), 100);
    retryCount = 0;
  } catch (e) {
    console.error("PIXORO FEED ERROR:", e);
    feed.innerHTML = `<div style="color:white;text-align:center;padding:40px;line-height:1.8"><b>Feed Load Aagala 😟</b><p style="color:#ff7777;font-size:12px;overflow-wrap:anywhere">${esc(e.message || e)}</p><button onclick="location.reload()" style="background:#FF2DCC;color:white;border:0;border-radius:22px;padding:12px 22px">Retry</button></div>`;
  } finally { loading = false; }
}

/* COMMENTS - ✅ FIX ADD PANNEN DA - Pazhaya Code Ye Tha da - 3 Line Mattum Add da */
window.openComment = function(id) {
  window._CUR = id;
  window.CURRENT_COMMENT_POST = id;
  window.LAST_CLICKED_POST_ID = id;
  if (typeof window.openComments === "function") return window.openComments(id);
  if (typeof window.pixoroOpenCommentReal === "function") return window.pixoroOpenCommentReal(id);
  const modal = document.getElementById("commentModal");
  if (modal) { modal.dataset.postId = id; modal.style.display = "block"; }
  if (typeof window.loadComments === "function") window.loadComments(id);
};
window.closeComment = function() {
  const modal = document.getElementById("commentModal");
  if (modal) modal.style.display = "none";
};

/* ✅ v1042 ADD - COMMENT LIKE GUARD DA - Idhu Mattum Add Pannen da */
/* Comment Heart ah Thotta - Post Like (like.js) ku Poga Vida Maatten da - Comment Like Mattum Work Aagum da */
if (!window.__pixoroCommentLikeGuard) {
  window.__pixoroCommentLikeGuard = true;
  document.addEventListener('click', (e) => {
    const cLike = e.target.closest && e.target.closest('[data-like]');
    if (cLike) { e.stopPropagation(); return; }
    const cModal = e.target.closest && e.target.closest('#commentModal');
    if (cModal && e.target.closest && e.target.closest('[data-like-btn]')) { e.stopPropagation(); return; }
  }, true);
}

/* POST MENU */
window.openPostMenu = function(id, owner, username) {
  window._CUR = id; window._CUR_OWNER = owner; window.CUR_USER = username;
  const box = document.getElementById("postMenuBox");
  const sheet = document.getElementById("postMenu");
  if (box) {
    box.innerHTML = `<div style="padding:16px;color:white;text-align:center"><div data-menu-action="comment" style="padding:14px;border-bottom:1px solid #333">💬 Comments</div><div data-menu-action="share" style="padding:14px;border-bottom:1px solid #333">✈️ Share</div><div data-menu-action="close" style="padding:14px;color:#aaa">Cancel</div></div>`;
    box.querySelectorAll("[data-menu-action]").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.dataset.menuAction;
        if (action === "comment") { window.closePostMenu(); window.openComment(id); }
        if (action === "share") { window.closePostMenu(); if (typeof window.openShare === "function") window.openShare(id); }
        if (action === "close") window.closePostMenu();
      });
    });
  }
  if (sheet) sheet.style.display = "block";
};
window.closePostMenu = function() {
  const sheet = document.getElementById("postMenu");
  if (sheet) sheet.style.display = "none";
};

/* SAVE POST */
window.savePostFeed = async function(id, btn) {
  try {
    if (typeof window.pixoroSave !== "function") { console.warn("PIXORO SAVE MODULE NOT FOUND"); return; }
    await window.pixoroSave(id);
    if (btn) btn.style.color = "#FF2DCC";
  } catch (e) { console.error("SAVE ERROR:", e); }
};

/* FEED TABS */
window.setFeedMode = function(mode) {
  window.PIXORO_FEED_MODE = mode || "foryou";
  document.querySelectorAll(".feedTab").forEach(tab => tab.classList.remove("active"));
  const tabIds = { foryou: "tabForYou", following: "tabFollowing", latest: "tabLatest" };
  const active = document.getElementById(tabIds[mode] || "tabForYou");
  if (active) active.classList.add("active");
  loadPixoroFeed();
};

/* GLOBAL FUNCTIONS */
window.loadPixoroFeed = loadPixoroFeed;

/* SUPABASE READY */
window.addEventListener("pixoro-supa-ready", () => { retryCount = 0; loadPixoroFeed(); });

/* INITIAL LOAD */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadPixoroFeed, { once: true });
} else { loadPixoroFeed(); }

})();
