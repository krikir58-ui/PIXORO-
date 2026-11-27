/* =========================================
   PIXORO COMMENTS V38
   COMMENT LIKE - 38px + #FF2D95 - Comment Killa Clean da
   SEND - Type Panna Mattum Varum da - Outline SVG Mattum da
   EMOJI BAR THOOKITEN DA
   COMMENT OPTIONS = Share / Copy / Report / Delete
   COMMENT REPLY = Tap Panna Reply Tag Varum da - 1 Level Only da
   SUPABASE = SERVER SAVE + REALTIME SYNC
   + V38 FIX DA - Delete Panna Comment List la Irundhu Maraiyum da - Server Delete Fail Aanaalum UI la Irukkaathu da
   ========================================= */

(() => {
  "use strict";

  if (window.PIXORO_COMMENTS_V38) return;
  window.PIXORO_COMMENTS_V38 = true;

  const TABLE = "comments";
  const TABLE_LIKES = "comment_likes";
  const EMOJI_ICON = "😊";

  let supa = null;
  let commentChannel = null;
  let likeChannel = null;
  let inputEl = null;
  let sendBtnEl = null;
  let listEl = null;
  let openPostId = null;
  let replyTo = null;
  let commentsCache = [];
  let replyFocusTimer = null;
  let currentCommentId = null;
  let currentCommentUserId = null;

  const ICON_HEART = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_HEART_FILLED = '<svg width="28" height="28" viewBox="0 0 24 24" fill="#FF2D95" stroke="#FF2D95" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_SEND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0095f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  function getSupa() {
    if (supa) return supa;
    supa = window.getSupa?.() || window.supa || window.supabaseClient || null;
    return supa;
  }

  async function getUserId() {
    const s = getSupa();
    if (!s) return null;
    try {
      const { data } = await s.auth.getSession();
      const id = data?.session?.user?.id || null;
      if (id) window.ME_ID = id;
      return id;
    } catch (e) {
      return window.ME_ID || null;
    }
  }

  async function getMyName() {
    const s = getSupa();
    if (!s) return "You";
    try {
      const { data } = await s.auth.getUser();
      const u = data?.user;
      const name = u?.user_metadata?.username || u?.user_metadata?.display_name || u?.user_metadata?.full_name || u?.email?.split("@")[0] || "You";
      return String(name);
    } catch (e) {
      return "You";
    }
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function timeAgo(ts) {
    if (!ts) return "now";
    const t = new Date(ts).getTime();
    if (!t) return "now";
    const s = Math.floor((Date.now() - t) / 1000);
    if (s < 5) return "now";
    if (s < 60) return s + "s";
    if (s < 3600) return Math.floor(s / 60) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "h";
    if (s < 604800) return Math.floor(s / 86400) + "d";
    return Math.floor(s / 604800) + "w";
  }

  function getAvatarInitial(name) {
    return String(name || "U").trim().charAt(0).toUpperCase() || "U";
  }

  function getCommentModal() {
    return document.getElementById("commentModal");
  }

  function isCommentOpen() {
    return !!openPostId;
  }

  function updateSendState() {
    if (!inputEl || !sendBtnEl) return;
    const has = inputEl.value.trim().length > 0;
    sendBtnEl.classList.toggle("show", has);
    sendBtnEl.style.display = has ? "flex" : "none";
    const area = document.querySelector(".cmtInputArea");
    if (area) area.classList.toggle("has-text", has);
  }

  function focusInput() {
    if (!inputEl) return;
    try {
      inputEl.focus({ preventScroll: true });
    } catch (e) {
      inputEl.focus();
    }
  }

  function setReplyTo(comment) {
    replyTo = comment || null;
    const tag = document.getElementById("replyTag");
    const tagName = document.getElementById("replyTagName");
    if (!tag) return;
    if (replyTo) {
      tag.style.display = "flex";
      if (tagName) tagName.textContent = "Replying to " + replyTo.username;
    } else {
      tag.style.display = "none";
    }
  }

  function focusReply(comment) {
    setReplyTo(comment);
    focusInput();
  }

  function getPostIdForModal() {
    return openPostId;
  }

  function getPostUsername(postId) {
    const post = document.querySelector(`article.post[data-post-id="${postId}"], .post[data-post-id="${postId}"]`);
    if (!post) return "";
    const el = post.querySelector(".post-user, .pUser, .post-username, [data-username], .username");
    return el?.textContent?.trim() || "";
  }

  function getPostImage(postId) {
    const post = document.querySelector(`article.post[data-post-id="${postId}"], .post[data-post-id="${postId}"]`);
    const img = post?.querySelector("img");
    return img?.src || "";
  }

  async function loadComments(postId) {
    const s = getSupa();
    if (!s) return;
    try {
      const { data, error } = await s.from(TABLE).select("*").eq("post_id", postId).order("created_at", { ascending: true });
      if (error) throw error;
      commentsCache = data || [];
      renderComments();
      syncCommentLikes();
    } catch (e) {
      console.error("PIXORO COMMENTS LOAD:", e);
    }
  }

  function renderComments() {
    if (!listEl) return;
    if (!commentsCache.length) {
      listEl.innerHTML = '<div style="text-align:center;color:#777;padding:30px 10px;font-size:13px">No comments yet.<br>Be the first to comment.</div>';
      return;
    }
    const me = window.ME_ID;
    listEl.innerHTML = commentsCache.map((c) => {
      const liked = (window.FEED_COMMENT_LIKES || new Set()).has(String(c.id));
      const count = Number(window.FEED_COMMENT_COUNTS?.[c.id] || 0);
      const isMine = me && String(c.user_id) === String(me);
      const parent = commentsCache.find((p) => String(p.id) === String(c.parent_id));
      const replyName = parent ? escapeHtml(parent.username || "user") : "";
      return `
        <div class="cmtRow" data-comment-id="${escapeHtml(c.id)}" data-user-id="${escapeHtml(c.user_id || "")}">
          <div class="cmtAvatar">${escapeHtml(getAvatarInitial(c.username))}</div>
          <div class="cmtContent">
            <div class="cmtUser">${escapeHtml(c.username || "user")}</div>
            <div class="cmtText">${replyName ? `<span style="color:#888">@${replyName} </span>` : ""}${escapeHtml(c.text || "")}</div>
            <div class="cmtMeta">
              <span>${timeAgo(c.created_at)}</span>
              <span class="cmtReplyBtn" data-reply="${escapeHtml(c.id)}">Reply</span>
              ${isMine ? `<span class="cmtDeleteBtn" data-delete="${escapeHtml(c.id)}" style="color:#ff5555">Delete</span>` : ""}
            </div>
          </div>
          <button class="cmtLike ${liked ? "liked" : ""}" data-like="${escapeHtml(c.id)}" aria-label="Like comment">
            ${liked ? ICON_HEART_FILLED : ICON_HEART}
            <span class="cmtLikeCount" style="font-size:11px;color:#aaa;margin-top:2px">${count > 0 ? count : ""}</span>
          </button>
        </div>`;
    }).join("");
    listEl.scrollTop = listEl.scrollHeight;
  }

  function toggleCommentLike(commentId, btn) {
    if (!commentId || !btn) return;
    const liked = btn.classList.contains("liked");
    const willLike = !liked;
    btn.classList.toggle("liked", willLike);
    btn.innerHTML = (willLike ? ICON_HEART_FILLED : ICON_HEART) + `<span class="cmtLikeCount" style="font-size:11px;color:#aaa;margin-top:2px"></span>`;
    const countEl = btn.querySelector(".cmtLikeCount");
    let count = Number(window.FEED_COMMENT_COUNTS?.[commentId] || 0);
    count = willLike ? count + 1 : Math.max(0, count - 1);
    window.FEED_COMMENT_COUNTS = window.FEED_COMMENT_COUNTS || {};
    window.FEED_COMMENT_COUNTS[commentId] = count;
    window.FEED_COMMENT_LIKES = window.FEED_COMMENT_LIKES || new Set();
    if (willLike) window.FEED_COMMENT_LIKES.add(String(commentId));
    else window.FEED_COMMENT_LIKES.delete(String(commentId));
    if (countEl) countEl.textContent = count > 0 ? count : "";
    queueCommentLikeSave(commentId, willLike, btn, liked, count);
  }

  const pendingLikeSaves = new Map();
  function queueCommentLikeSave(commentId, willLike, btn, prevLiked, prevCount) {
    const prev = pendingLikeSaves.get(commentId) || Promise.resolve();
    const next = prev.catch(() => {}).then(async () => {
      const s = getSupa();
      const userId = await getUserId();
      if (!s || !userId) throw new Error("Login first");
      if (willLike) {
        const { error } = await s.from(TABLE_LIKES).upsert({ comment_id: commentId, user_id: userId }, { onConflict: "comment_id,user_id", ignoreDuplicates: true });
        if (error) throw error;
      } else {
        const { error } = await s.from(TABLE_LIKES).delete().eq("comment_id", commentId).eq("user_id", userId);
        if (error) throw error;
      }
    }).catch((e) => {
      console.error("PIXORO COMMENT LIKE SAVE:", e);
      btn.classList.toggle("liked", prevLiked);
      btn.innerHTML = (prevLiked ? ICON_HEART_FILLED : ICON_HEART) + `<span class="cmtLikeCount" style="font-size:11px;color:#aaa;margin-top:2px">${prevCount > 0 ? prevCount : ""}</span>`;
      window.FEED_COMMENT_COUNTS[commentId] = prevCount;
      if (prevLiked) window.FEED_COMMENT_LIKES.add(String(commentId));
      else window.FEED_COMMENT_LIKES.delete(String(commentId));
    });
    pendingLikeSaves.set(commentId, next);
  }

  async function syncCommentLikes() {
    const s = getSupa();
    const userId = await getUserId();
    if (!s || !userId || !commentsCache.length) return;
    try {
      const ids = commentsCache.map((c) => String(c.id));
      let all = [];
      let from = 0;
      while (true) {
        const { data, error } = await s.from(TABLE_LIKES).select("comment_id,user_id").in("comment_id", ids).range(from, from + 999);
        if (error) throw error;
        const rows = data || [];
        all = all.concat(rows);
        if (rows.length < 1000) break;
        from += 1000;
      }
      const counts = {};
      const liked = new Set();
      ids.forEach((id) => counts[id] = 0);
      all.forEach((r) => {
        const id = String(r.comment_id);
        counts[id] = (counts[id] || 0) + 1;
        if (String(r.user_id) === String(userId)) liked.add(id);
      });
      window.FEED_COMMENT_COUNTS = counts;
      window.FEED_COMMENT_LIKES = liked;
      renderComments();
    } catch (e) {
      console.error("PIXORO COMMENT LIKE SYNC:", e);
    }
  }

  async function addComment() {
    const text = inputEl?.value?.trim() || "";
    if (!text) return;
    const postId = openPostId;
    if (!postId) return;
    const s = getSupa();
    const userId = await getUserId();
    if (!s || !userId) {
      alert("Please login first");
      return;
    }
    const username = await getMyName();
    const tempId = "temp-" + Date.now();
    const temp = { id: tempId, post_id: postId, user_id: userId, username, text, parent_id: replyTo?.id || null, created_at: new Date().toISOString() };
    commentsCache.push(temp);
    renderComments();
    inputEl.value = "";
    setReplyTo(null);
    updateSendState();
    try {
      const { data, error } = await s.from(TABLE).insert({ post_id: postId, user_id: userId, username, text, parent_id: replyTo?.id || null }).select().single();
      if (error) throw error;
      const idx = commentsCache.findIndex((c) => String(c.id) === tempId);
      if (idx >= 0 && data) commentsCache[idx] = data;
      renderComments();
    } catch (e) {
      console.error("PIXORO COMMENT ADD:", e);
      commentsCache = commentsCache.filter((c) => String(c.id) !== tempId);
      renderComments();
      alert("Failed to post comment");
    }
  }

  async function deleteComment(commentId) {
    if (!commentId) return;
    // ✅ V38 FIX DA - UI la Udane Maraiyum da - Server Fail Aanaalum Thirumba Varaathu da
    const backup = [...commentsCache];
    commentsCache = commentsCache.filter((c) => String(c.id) !== String(commentId));
    renderComments();
    closeCommentOptions();
    try {
      const s = getSupa();
      const userId = await getUserId();
      if (!s || !userId) throw new Error("Login first");
      const { error } = await s.from(TABLE).delete().eq("id", commentId).eq("user_id", userId);
      if (error) throw error;
      commentsCache = commentsCache.filter((c) => String(c.id) !== String(commentId));
      renderComments();
    } catch (e) {
      console.error("PIXORO COMMENT DELETE:", e);
      commentsCache = commentsCache.filter((c) => String(c.id) !== String(commentId));
      renderComments();
    }
  }

  function openCommentModal(postId) {
    openPostId = String(postId);
    const modal = getCommentModal();
    if (!modal) return;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    const headerName = document.getElementById("cmtHeaderName");
    if (headerName) {
      const name = getPostUsername(postId);
      headerName.textContent = name ? "Comments - " + name : "Comments";
    }
    commentsCache = [];
    renderComments();
    loadComments(postId);
    subscribeRealtime(postId);
    setTimeout(() => focusInput(), 350);
  }

  function closeCommentModal() {
    openPostId = null;
    replyTo = null;
    const modal = getCommentModal();
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    unsubscribeRealtime();
    if (inputEl) inputEl.value = "";
    setReplyTo(null);
    updateSendState();
  }

  function openCommentOptions(commentId, userId) {
    currentCommentId = String(commentId);
    currentCommentUserId = String(userId || "");
    const modal = document.getElementById("cmtOptionModal");
    const content = document.getElementById("cmtOptContent");
    if (!modal || !content) return;
    const me = window.ME_ID;
    const isMine = me && String(userId) === String(me);
    content.innerHTML = `
      <button data-opt="share">Share Comment</button>
      <button data-opt="copy">Copy Text</button>
      <button data-opt="report">Report</button>
      ${isMine ? `<button data-opt="delete" style="color:#ff5555">Delete</button>` : ""}
      <button data-opt="cancel" style="color:#aaa">Cancel</button>
    `;
    modal.style.display = "flex";
  }

  function closeCommentOptions() {
    const modal = document.getElementById("cmtOptionModal");
    if (modal) modal.style.display = "none";
    currentCommentId = null;
    currentCommentUserId = null;
  }

  async function handleOption(opt) {
    if (!currentCommentId) return;
    const comment = commentsCache.find((c) => String(c.id) === String(currentCommentId));
    if (opt === "cancel") { closeCommentOptions(); return; }
    if (opt === "delete") { await deleteComment(currentCommentId); return; }
    if (opt === "copy") {
      if (comment?.text) {
        try { await navigator.clipboard.writeText(comment.text); } catch (e) {}
      }
      closeCommentOptions(); return;
    }
    if (opt === "share") {
      const text = comment?.text || "";
      const url = location.origin + location.pathname + "#comment-" + currentCommentId;
      try {
        if (navigator.share) await navigator.share({ title: "Pixoro Comment", text, url });
        else if (navigator.clipboard) await navigator.clipboard.writeText(url);
      } catch (e) {}
      closeCommentOptions(); return;
    }
    if (opt === "report") {
      alert("Thanks. This comment was reported.");
      closeCommentOptions(); return;
    }
  }

  function subscribeRealtime(postId) {
    const s = getSupa();
    if (!s) return;
    unsubscribeRealtime();
    try {
      commentChannel = s.channel("pixoro-comments-" + postId)
        .on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: `post_id=eq.${postId}` }, (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new;
            if (!commentsCache.some((c) => String(c.id) === String(row.id))) {
              commentsCache.push(row);
              renderComments();
            }
          }
          if (payload.eventType === "DELETE") {
            commentsCache = commentsCache.filter((c) => String(c.id) !== String(payload.old.id));
            renderComments();
          }
          if (payload.eventType === "UPDATE") {
            const idx = commentsCache.findIndex((c) => String(c.id) === String(payload.new.id));
            if (idx >= 0) { commentsCache[idx] = payload.new; renderComments(); }
          }
        }).subscribe();
      likeChannel = s.channel("pixoro-comment-likes-" + postId)
        .on("postgres_changes", { event: "*", schema: "public", table: TABLE_LIKES }, () => { syncCommentLikes(); })
        .subscribe();
    } catch (e) {
      console.error("PIXORO COMMENT REALTIME:", e);
    }
  }

  function unsubscribeRealtime() {
    try { if (commentChannel) getSupa()?.removeChannel(commentChannel); } catch (e) {}
    try { if (likeChannel) getSupa()?.removeChannel(likeChannel); } catch (e) {}
    commentChannel = null;
    likeChannel = null;
  }

  function layout() {
    const modal = getCommentModal();
    if (!modal) return;
    if (modal.dataset.pixoroBuilt) {
      inputEl = modal.querySelector("input");
      sendBtnEl = modal.querySelector(".pixoro-c-send-arrow");
      listEl = modal.querySelector("#cmtList");
      updateSendState();
      return;
    }
    modal.dataset.pixoroBuilt = "1";
    modal.innerHTML = `
      <div id="commentSheet">
        <div class="cmtHeader"><span id="cmtHeaderName">Comments</span>
          <button id="cmtCloseBtn" style="position:absolute;right:12px;top:10px;background:none;border:none;color:#fff;font-size:22px;cursor:pointer">×</button>
        </div>
        <div id="cmtList" class="cmtList"></div>
        <div class="cmtInputArea">
          <div id="replyTag" class="replyTag" style="display:none"><span id="replyTagName"></span><button id="replyTagCancel" style="background:none;border:none;color:#fff;cursor:pointer">×</button></div>
          <div class="cmtBox">
            <div class="cmtAvatar" style="width:32px;height:32px;flex-shrink:0">😊</div>
            <input id="commentInput" type="text" placeholder="Add a comment..." autocomplete="off" />
            <button class="pixoro-c-send-arrow" onclick="addComment()">${ICON_SEND}</button>
          </div>
        </div>
      </div>
      <div id="cmtOptionModal">
        <div id="cmtOptBox"><div id="cmtOptContent"></div></div>
      </div>
    `;
    inputEl = modal.querySelector("#commentInput");
    sendBtnEl = modal.querySelector(".pixoro-c-send-arrow");
    listEl = modal.querySelector("#cmtList");
    if (inputEl) {
      inputEl.addEventListener("input", updateSendState);
      inputEl.addEventListener("keyup", updateSendState);
      inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") addComment(); });
    }
    modal.querySelector("#cmtCloseBtn")?.addEventListener("click", closeCommentModal);
    modal.querySelector("#replyTagCancel")?.addEventListener("click", () => setReplyTo(null));
    modal.addEventListener("click", (e) => { if (e.target === modal) closeCommentModal(); });
    modal.querySelector("#cmtOptionModal")?.addEventListener("click", (e) => { if (e.target.id === "cmtOptionModal") closeCommentOptions(); });
    listEl?.addEventListener("click", (e) => {
      const likeBtn = e.target.closest("[data-like]");
      if (likeBtn) { e.stopPropagation(); toggleCommentLike(likeBtn.dataset.like, likeBtn); return; }
      const replyBtn = e.target.closest("[data-reply]");
      if (replyBtn) {
        const c = commentsCache.find((x) => String(x.id) === String(replyBtn.dataset.reply));
        if (c) focusReply(c);
        return;
      }
      const delBtn = e.target.closest("[data-delete]");
      if (delBtn) { deleteComment(delBtn.dataset.delete); return; }
      const row = e.target.closest(".cmtRow");
      if (row) openCommentOptions(row.dataset.commentId, row.dataset.userId);
    });
    modal.querySelector("#cmtOptContent")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-opt]");
      if (b) handleOption(b.dataset.opt);
    });
    updateSendState();
  }

  function bindOpenButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-comment-btn], .comment-btn, .cmt-open, [data-open-comments]");
      if (!btn) return;
      const post = btn.closest("article.post[data-post-id], .post[data-post-id]");
      const postId = post?.dataset?.postId || post?.dataset?.id || btn.dataset?.postId || "";
      if (!postId) return;
      e.preventDefault();
      e.stopPropagation();
      openCommentModal(postId);
    });
  }

  window.openCommentModal = openCommentModal;
  window.closeCommentModal = closeCommentModal;
  window.addComment = addComment;
  window.pixoroFocusReply = focusReply;
  window.pixoroSetReplyTo = setReplyTo;
  window.pixoroCloseComments = closeCommentModal;
  window.pixoroOpenComments = openCommentModal;

  function startComments() {
    layout();
    bindOpenButtons();
  }

  window.addEventListener("pixoro-feed-rendered", () => { setTimeout(layout, 100); });
  window.addEventListener("pixoro-supa-ready", () => { setTimeout(layout, 100); });
  window.addEventListener("pixoro:login", () => { setTimeout(layout, 100); });
  window.addEventListener("pixoro:logout", () => { closeCommentModal(); });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startComments, { once: true });
  } else {
    startComments();
  }

  layout();
  console.log("PIXORO COMMENTS V38 READY 💬");

  /* ===== ✅ ADD MATTUM DA - Pazhaya v38 Thodala da - SEND = WHITE OUTLINE MATTUM DA - CORRECT ADD DA ===== */
  (function pixoroSendWhiteADD(){
    var WHITE_SEND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    function addStyle(){
      if(document.getElementById("pixoro-send-white-add")) return;
      var st = document.createElement("style");
      st.id = "pixoro-send-white-add";
      st.textContent = `
        .pixoro-c-send-arrow{ background:none!important; background-color:transparent!important; border:none!important; box-shadow:none!important; }
        .pixoro-c-send-arrow svg, .pixoro-c-send-arrow svg *{ fill:none!important; stroke:#fff!important; }
      `;
      document.head.appendChild(st);
    }
    function fix(){
      addStyle();
      document.querySelectorAll(".pixoro-c-send-arrow").forEach(function(btn){
        if(btn.innerHTML.indexOf("#0095f6") !== -1 || !btn.dataset.pixoroWhite){
          btn.dataset.pixoroWhite = "1";
          btn.innerHTML = WHITE_SEND;
        }
      });
    }
    var obs = new MutationObserver(fix);
    obs.observe(document.documentElement, { childList:true, subtree:true });
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fix);
    else fix();
  })();
})();
