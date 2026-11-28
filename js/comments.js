/* =========================================
   PIXORO COMMENTS V41 CORRECTED DA
   ✅ @ ELLAM REMOVE da - Double Name Remove da
   ✅ Photo Varum da - Heart Keezha 0 / 1 Count Varum da
   ✅ Send = Document Delegate da
   ========================================= */
(() => {
  "use strict";
  if (window.PIXORO_COMMENTS_V41) return;
  window.PIXORO_COMMENTS_V41 = true;
  window.PIXORO_COMMENTS_V40 = true;

  const TABLE = "comments";
  const TABLE_LIKES = "comment_likes";
  let supa = null, commentChannel = null, likeChannel = null;
  let inputEl = null, sendBtnEl = null, listEl = null;
  let openPostId = null, replyTo = null, commentsCache = [];
  let currentCommentId = null, currentCommentUserId = null;
  let isSending = false;

  const ICON_HEART = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_HEART_FILLED = '<svg width="28" height="28" viewBox="0 0 24 24" fill="#FF2D95" stroke="#FF2D95" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_SEND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  function getSupa(){ if(supa) return supa; supa = window.getSupa?.() || window.supa || window.supabaseClient || null; return supa; }
  async function getUserId(){ const s=getSupa(); if(!s) return window.ME_ID||null; try{ const {data}=await s.auth.getSession(); const id=data?.session?.user?.id||null; if(id) window.ME_ID=id; return id; }catch(e){ return window.ME_ID||null; } }
  // ✅ V41 - @ + Double Name Clean da
  function cleanName(name){
    let n = String(name || "user").trim().replace(/^@+/,"");
    const half = Math.floor(n.length/2);
    if(n.length>3 && n.slice(0,half).trim()===n.slice(half).trim()) n=n.slice(0,half).trim();
    n=n.replace(/^(\S+)\s+\1$/i,"$1");
    return n || "user";
  }
  function cleanAvatar(c){ return c?.avatar_url || c?.avatar || c?.profile_pic || c?.photo_url || c?.photo || ""; }
  async function getMyName(){ const s=getSupa(); if(!s) return "You"; try{ const {data}=await s.auth.getUser(); const u=data?.user; return cleanName(u?.user_metadata?.username || u?.user_metadata?.display_name || u?.user_metadata?.full_name || u?.email?.split("@")[0] || "You"); }catch(e){ return "You"; } }
  function escapeHtml(str){ return String(str ?? "").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function timeAgo(ts){ if(!ts) return "now"; const t=new Date(ts).getTime(); if(!t) return "now"; const s=Math.floor((Date.now()-t)/1000); if(s<5) return "now"; if(s<60) return s+"s"; if(s<3600) return Math.floor(s/60)+"m"; if(s<86400) return Math.floor(s/3600)+"h"; if(s<604800) return Math.floor(s/86400)+"d"; return Math.floor(s/604800)+"w"; }
  function getAvatarInitial(name){ return String(name||"U").trim().charAt(0).toUpperCase()||"U"; }
  function getCommentModal(){ return document.getElementById("commentModal"); }
  function getInput(){ return document.querySelector("#commentModal #commentInput") || inputEl || document.querySelector("#commentModal input"); }
  function getSendBtn(){ return document.querySelector("#commentModal #cmtSendBtn, #commentModal .sendBtn"); }
  function getList(){ return document.querySelector("#commentModal #cmtList") || listEl; }
  function getPostId(){ const modal=getCommentModal(); return openPostId || modal?.dataset?.postId || window.PIXORO_OPEN_POST_ID || window.__pixoroLastCommentPostId || ""; }

  function updateSendState(){
    const inp=getInput(); const btn=getSendBtn(); if(!inp||!btn) return; inputEl=inp; sendBtnEl=btn;
    const has=inp.value.trim().length>0; btn.classList.toggle("show",has); btn.style.display=has?"flex":"none"; btn.style.pointerEvents=has?"auto":"none";
    const box=document.querySelector("#commentModal .cmtBox"); if(box) box.classList.toggle("has-text",has);
    const area=document.querySelector("#commentModal .cmtInputArea"); if(area) area.classList.toggle("has-text",has);
  }
  function focusInput(){ const inp=getInput(); if(!inp) return; try{ inp.focus({preventScroll:true}); }catch(e){ inp.focus(); } }
  function setReplyTo(comment){
    replyTo=comment||null; const tag=document.getElementById("replyTag"); const tagName=document.getElementById("replyTagName"); if(!tag) return;
    if(replyTo){ tag.style.display="flex"; if(tagName) tagName.textContent="Replying to "+cleanName(replyTo.username); } else tag.style.display="none";
  }
  function focusReply(comment){ setReplyTo(comment); focusInput(); }
  function getPostUsername(postId){
    const post=document.querySelector(`article.post[data-post-id="${postId}"], .post[data-post-id="${postId}"]`); if(!post) return "";
    const el=post.querySelector(".post-user, .pUser, .post-username, [data-username], .username"); return cleanName(el?.textContent?.trim()||"");
  }
  async function loadComments(postId){
    const s=getSupa(); if(!s) return;
    try{ const {data, error}=await s.from(TABLE).select("*").eq("post_id", postId).order("created_at", {ascending:true}); if(error) throw error; commentsCache=data||[]; renderComments(); syncCommentLikes(); }catch(e){ console.error("PIXORO COMMENTS LOAD:", e); }
  }
  // ✅ V41 - Render Correct da - @ Illa - Photo Varum - Count 0 Kooda Varum da
  function renderComments(){
    const list=getList(); if(!list) return; listEl=list;
    if(!commentsCache.length){ list.innerHTML='<div style="text-align:center;color:#777;padding:30px 10px;font-size:13px">No comments yet.<br>Be the first to comment.</div>'; return; }
    const me=window.ME_ID;
    list.innerHTML=commentsCache.map((c)=>{
      const liked=(window.FEED_COMMENT_LIKES||new Set()).has(String(c.id)); const count=Number(window.FEED_COMMENT_COUNTS?.[c.id]||0); const isMine=me && String(c.user_id)===String(me);
      const name=cleanName(c.username);
      const parent=commentsCache.find((p)=>String(p.id)===String(c.parent_id)); const replyName=parent?cleanName(parent.username):"";
      const av=cleanAvatar(c);
      const avatarHtml = av ? `<img src="${escapeHtml(av)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display='none'">` : escapeHtml(getAvatarInitial(name));
      return `<div class="cmtRow" data-comment-id="${escapeHtml(c.id)}" data-user-id="${escapeHtml(c.user_id||"")}"><div class="cmtAvatar">${avatarHtml}</div><div class="cmtContent"><div class="cmtUser">${escapeHtml(name)}</div><div class="cmtText">${replyName?`<span style="color:#888">${escapeHtml(replyName)} </span>`:""}${escapeHtml(c.text||"")}</div><div class="cmtMeta"><span>${timeAgo(c.created_at)}</span><span class="cmtReplyBtn" data-reply="${escapeHtml(c.id)}">Reply</span>${isMine?`<span class="cmtDeleteBtn" data-delete="${escapeHtml(c.id)}" style="color:#ff5555">Delete</span>`:""}</div></div><button class="cmtLike ${liked?"liked":""}" data-like="${escapeHtml(c.id)}" aria-label="Like comment">${liked?ICON_HEART_FILLED:ICON_HEART}<span class="cmtLikeCount">${count}</span></button></div>`;
    }).join("");
    list.scrollTop=list.scrollHeight;
  }
  function toggleCommentLike(commentId, btn){
    if(!commentId||!btn) return; const liked=btn.classList.contains("liked"); const willLike=!liked; const prevCount=Number(window.FEED_COMMENT_COUNTS?.[commentId]||0); const newCount=willLike?prevCount+1:Math.max(0,prevCount-1);
    btn.classList.toggle("liked", willLike); btn.innerHTML=(willLike?ICON_HEART_FILLED:ICON_HEART)+`<span class="cmtLikeCount">${newCount}</span>`;
    window.FEED_COMMENT_COUNTS=window.FEED_COMMENT_COUNTS||{}; window.FEED_COMMENT_COUNTS[commentId]=newCount; window.FEED_COMMENT_LIKES=window.FEED_COMMENT_LIKES||new Set();
    if(willLike) window.FEED_COMMENT_LIKES.add(String(commentId)); else window.FEED_COMMENT_LIKES.delete(String(commentId));
    queueCommentLikeSave(commentId, willLike, btn, liked, prevCount);
  }
  const pendingLikeSaves=new Map();
  function queueCommentLikeSave(commentId, willLike, btn, prevLiked, prevCount){
    const prev=pendingLikeSaves.get(commentId)||Promise.resolve();
    const next=prev.catch(()=>{}).then(async()=>{ const s=getSupa(); const userId=await getUserId(); if(!s||!userId) throw new Error("Login first"); if(willLike){ const {error}=await s.from(TABLE_LIKES).upsert({comment_id:commentId, user_id:userId},{onConflict:"comment_id,user_id", ignoreDuplicates:true}); if(error) throw error; } else { const {error}=await s.from(TABLE_LIKES).delete().eq("comment_id", commentId).eq("user_id", userId); if(error) throw error; } }).catch((e)=>{ console.error("PIXORO COMMENT LIKE SAVE:", e); btn.classList.toggle("liked", prevLiked); btn.innerHTML=(prevLiked?ICON_HEART_FILLED:ICON_HEART)+`<span class="cmtLikeCount">${prevCount}</span>`; window.FEED_COMMENT_COUNTS[commentId]=prevCount; if(prevLiked) window.FEED_COMMENT_LIKES.add(String(commentId)); else window.FEED_COMMENT_LIKES.delete(String(commentId)); });
    pendingLikeSaves.set(commentId, next);
  }
  async function syncCommentLikes(){
    const s=getSupa(); const userId=await getUserId(); if(!s||!userId||!commentsCache.length) return;
    try{ const ids=commentsCache.map((c)=>String(c.id)); let all=[]; let from=0; while(true){ const {data, error}=await s.from(TABLE_LIKES).select("comment_id,user_id").in("comment_id", ids).range(from, from+999); if(error) throw error; const rows=data||[]; all=all.concat(rows); if(rows.length<1000) break; from+=1000; } const counts={}; const liked=new Set(); ids.forEach((id)=>counts[id]=0); all.forEach((r)=>{ const id=String(r.comment_id); counts[id]=(counts[id]||0)+1; if(String(r.user_id)===String(userId)) liked.add(id); }); window.FEED_COMMENT_COUNTS=counts; window.FEED_COMMENT_LIKES=liked; renderComments(); }catch(e){ console.error("PIXORO COMMENT LIKE SYNC:", e); }
  }
  async function addComment(){
    if(isSending) return;
    const inp=getInput(); inputEl=inp; const text=inp?.value?.trim()||""; if(!text) return;
    const postId=String(getPostId()||""); if(!postId){ alert("Post ID kedaikala da - Comment Button ah Thirumba Thodu da"); return; }
    openPostId=postId; window.PIXORO_OPEN_POST_ID=postId;
    const s=getSupa(); const userId=await getUserId(); if(!s||!userId){ alert("Please login first"); return; }
    const username=await getMyName();
    const avatarUrl = window.MY_PFP || localStorage.getItem("pixoro_avatar") || localStorage.getItem("pixoro_pfp") || "";
    const parentId=replyTo?.id||null; const tempId="temp-"+Date.now();
    const temp={id:tempId, post_id:postId, user_id:userId, username, avatar_url:avatarUrl, text, parent_id:parentId, created_at:new Date().toISOString()};
    commentsCache.push(temp); renderComments(); if(inp) inp.value=""; setReplyTo(null); updateSendState();
    isSending=true;
    try{
      const {data, error}=await s.from(TABLE).insert({post_id:postId, user_id:userId, username, avatar_url:avatarUrl, text, parent_id:parentId}).select().single();
      if(error) throw error; const idx=commentsCache.findIndex((c)=>String(c.id)===tempId); if(idx>=0 && data) commentsCache[idx]=data; renderComments();
    }catch(e){ console.error("PIXORO COMMENT ADD:", e); alert("Failed: "+(e.message||"Check Supabase RLS / parent_id column da")); }finally{ isSending=false; }
  }
  async function deleteComment(commentId){
    if(!commentId) return; commentsCache=commentsCache.filter((c)=>String(c.id)!==String(commentId)); renderComments(); closeCommentOptions();
    try{ const s=getSupa(); const userId=await getUserId(); if(!s||!userId) throw new Error("Login first"); const {error}=await s.from(TABLE).delete().eq("id", commentId).eq("user_id", userId); if(error) throw error; }catch(e){ console.error("PIXORO COMMENT DELETE:", e); commentsCache=commentsCache.filter((c)=>String(c.id)!==String(commentId)); renderComments(); }
  }
  function openCommentModal(postId){
    openPostId=String(postId); window.PIXORO_OPEN_POST_ID=String(postId); window.__pixoroLastCommentPostId=String(postId);
    const modal=getCommentModal(); if(!modal) return; modal.dataset.postId=String(postId); modal.style.display="flex"; document.body.style.overflow="hidden";
    const headerName=document.getElementById("cmtHeaderName"); if(headerName){ const name=getPostUsername(postId); headerName.textContent=name?"Comments - "+name:"Comments"; }
    commentsCache=[]; renderComments(); loadComments(postId); subscribeRealtime(postId); setTimeout(()=>focusInput(), 350);
  }
  function closeCommentModal(){
    openPostId=null; replyTo=null; const modal=getCommentModal(); if(modal) modal.style.display="none"; document.body.style.overflow=""; unsubscribeRealtime();
    const inp=getInput(); if(inp) inp.value=""; setReplyTo(null); updateSendState();
  }
  function openCommentOptions(commentId, userId){
    currentCommentId=String(commentId); currentCommentUserId=String(userId||""); const modal=document.getElementById("cmtOptionModal"); const content=document.getElementById("cmtOptContent"); if(!modal||!content) return;
    const me=window.ME_ID; const isMine=me && String(userId)===String(me);
    content.innerHTML=`<button data-opt="share">Share Comment</button><button data-opt="copy">Copy Text</button><button data-opt="report">Report</button>${isMine?`<button data-opt="delete" style="color:#ff5555">Delete</button>`:""}<button data-opt="cancel" style="color:#aaa">Cancel</button>`; modal.style.display="flex";
  }
  function closeCommentOptions(){ const modal=document.getElementById("cmtOptionModal"); if(modal) modal.style.display="none"; currentCommentId=null; currentCommentUserId=null; }
  async function handleOption(opt){
    if(!currentCommentId) return; const comment=commentsCache.find((c)=>String(c.id)===String(currentCommentId));
    if(opt==="cancel"){ closeCommentOptions(); return; } if(opt==="delete"){ await deleteComment(currentCommentId); return; }
    if(opt==="copy"){ if(comment?.text){ try{ await navigator.clipboard.writeText(comment.text); }catch(e){} } closeCommentOptions(); return; }
    if(opt==="share"){ const text=comment?.text||""; const url=location.origin+location.pathname+"#comment-"+currentCommentId; try{ if(navigator.share) await navigator.share({title:"Pixoro Comment", text, url}); else if(navigator.clipboard) await navigator.clipboard.writeText(url); }catch(e){} closeCommentOptions(); return; }
    if(opt==="report"){ alert("Thanks. This comment was reported."); closeCommentOptions(); return; }
  }
  function subscribeRealtime(postId){
    const s=getSupa(); if(!s) return; unsubscribeRealtime();
    try{
      commentChannel=s.channel("pixoro-comments-"+postId).on("postgres_changes",{event:"*", schema:"public", table:TABLE, filter:`post_id=eq.${postId}`},(payload)=>{
        if(payload.eventType==="INSERT"){ const row=payload.new; if(!commentsCache.some((c)=>String(c.id)===String(row.id))){ commentsCache.push(row); renderComments(); } }
        if(payload.eventType==="DELETE"){ commentsCache=commentsCache.filter((c)=>String(c.id)!==String(payload.old.id)); renderComments(); }
        if(payload.eventType==="UPDATE"){ const idx=commentsCache.findIndex((c)=>String(c.id)===String(payload.new.id)); if(idx>=0){ commentsCache[idx]=payload.new; renderComments(); } }
      }).subscribe();
      likeChannel=s.channel("pixoro-comment-likes-"+postId).on("postgres_changes",{event:"*", schema:"public", table:TABLE_LIKES},()=>{ syncCommentLikes(); }).subscribe();
    }catch(e){ console.error("PIXORO COMMENT REALTIME:", e); }
  }
  function unsubscribeRealtime(){ try{ if(commentChannel) getSupa()?.removeChannel(commentChannel); }catch(e){} try{ if(likeChannel) getSupa()?.removeChannel(likeChannel); }catch(e){} commentChannel=null; likeChannel=null; }
  function layout(){
    const modal=getCommentModal(); if(!modal) return;
    if(modal.dataset.pixoroBuilt){ inputEl=getInput(); sendBtnEl=getSendBtn(); listEl=getList(); updateSendState(); return; }
    modal.dataset.pixoroBuilt="1";
    modal.innerHTML=`
      <div id="commentSheet">
        <div class="cmtHeader"><span id="cmtHeaderName">Comments</span><button id="cmtCloseBtn" style="position:absolute;right:12px;top:10px;background:none;border:none;color:#fff;font-size:22px;cursor:pointer">×</button></div>
        <div id="cmtList" class="cmtList"></div>
        <div class="cmtInputArea">
          <div id="replyTag" class="replyTag" style="display:none"><span id="replyTagName"></span><button id="replyTagCancel" style="background:none;border:none;color:#fff;cursor:pointer">×</button></div>
          <div class="cmtBox">
            <div class="cmtAvatar" style="width:32px;height:32px;flex-shrink:0">😊</div>
            <input id="commentInput" type="text" placeholder="Add a comment..." autocomplete="off" />
            <button class="sendBtn pixoro-c-send-arrow" id="cmtSendBtn" type="button" aria-label="Send" style="display:none">${ICON_SEND}</button>
          </div>
        </div>
      </div>
      <div id="cmtOptionModal"><div id="cmtOptBox"><div id="cmtOptContent"></div></div></div>
    `;
    inputEl=getInput(); sendBtnEl=getSendBtn(); listEl=getList();
    modal.querySelector("#cmtCloseBtn")?.addEventListener("click", closeCommentModal);
    modal.querySelector("#replyTagCancel")?.addEventListener("click", ()=>setReplyTo(null));
    modal.addEventListener("click", (e)=>{ if(e.target===modal) closeCommentModal(); });
    modal.querySelector("#cmtOptionModal")?.addEventListener("click", (e)=>{ if(e.target.id==="cmtOptionModal") closeCommentOptions(); });
    modal.addEventListener("click", (e)=>{
      const likeBtn=e.target.closest("[data-like]"); if(likeBtn){ e.stopPropagation(); toggleCommentLike(likeBtn.dataset.like, likeBtn); return; }
      const replyBtn=e.target.closest("[data-reply]"); if(replyBtn){ const c=commentsCache.find((x)=>String(x.id)===String(replyBtn.dataset.reply)); if(c) focusReply(c); return; }
      const delBtn=e.target.closest("[data-delete]"); if(delBtn){ deleteComment(delBtn.dataset.delete); return; }
      const row=e.target.closest(".cmtRow"); if(row && !e.target.closest(".cmtLike")) openCommentOptions(row.dataset.commentId, row.dataset.userId);
    });
    modal.querySelector("#cmtOptContent")?.addEventListener("click", (e)=>{ const b=e.target.closest("[data-opt]"); if(b) handleOption(b.dataset.opt); });
    updateSendState();
  }
  document.addEventListener("click", (e)=>{
    const btn=e.target.closest("[data-comment-btn], .comment-btn, .cmt-open, [data-open-comments], .commentBtn");
    if(btn){ const post=btn.closest("article.post[data-post-id], .post[data-post-id]"); const pid=post?.dataset?.postId || post?.dataset?.id || btn.dataset?.postId || ""; if(pid){ window.__pixoroLastCommentPostId=String(pid); window.PIXORO_OPEN_POST_ID=String(pid); openPostId=String(pid); const m=getCommentModal(); if(m) m.dataset.postId=String(pid); } }
  }, true);
  document.addEventListener("input", (e)=>{ if(e.target && e.target.id==="commentInput") updateSendState(); });
  document.addEventListener("keyup", (e)=>{ if(e.target && e.target.id==="commentInput") updateSendState(); });
  document.addEventListener("keydown", (e)=>{ if(e.target && e.target.id==="commentInput" && e.key==="Enter"){ e.preventDefault(); addComment(); } });
  document.addEventListener("click", (e)=>{ const btn=e.target.closest("#cmtSendBtn, #commentModal .sendBtn, #commentModal .pixoro-c-send-arrow"); if(!btn) return; e.preventDefault(); e.stopPropagation(); addComment(); });
  document.addEventListener("touchend", (e)=>{ const btn=e.target.closest("#cmtSendBtn, #commentModal .sendBtn"); if(!btn) return; e.preventDefault(); addComment(); }, {passive:false});
  function bindOpenButtons(){
    document.addEventListener("click", (e)=>{
      const btn=e.target.closest("[data-comment-btn], .comment-btn, .cmt-open, [data-open-comments]"); if(!btn) return;
      const post=btn.closest("article.post[data-post-id], .post[data-post-id]"); const postId=post?.dataset?.postId || post?.dataset?.id || btn.dataset?.postId || ""; if(!postId) return;
      e.preventDefault(); e.stopPropagation(); openCommentModal(postId);
    });
  }
  window.openCommentModal=openCommentModal; window.closeCommentModal=closeCommentModal; window.closeComment=closeCommentModal;
  window.addComment=addComment; window.pixoroFocusReply=focusReply; window.pixoroSetReplyTo=setReplyTo;
  window.pixoroCloseComments=closeCommentModal; window.pixoroOpenComments=openCommentModal; window.pixoroAddComment=addComment;
  function startComments(){ layout(); bindOpenButtons(); }
  window.addEventListener("pixoro-feed-rendered", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro-supa-ready", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro:login", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro:logout", ()=>{ closeCommentModal(); });
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", startComments, {once:true}); } else { startComments(); }
  console.log("PIXORO COMMENTS V41 READY 💬");
})();
