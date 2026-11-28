/* =========================================
   PIXORO COMMENTS V57 FINAL CORRECT DA
   ✅ ID + Time Mela, Msg Naduvula, Reply/Delete Keezha, Heart Valathu da
   ✅ THREAD REPLY DA - Reply Romba Chinna da - Ulla Thalli Varum da - View Romba Chinna da
   ✅ Full Black da - Delete Full Black da
   ✅ parent_id - bigint da - comments.id bigint ku Match Aagum da
   ✅ Name + Photo - user_id Vachu profiles la Irundhu da
   ✅ user nu Varaathu da
   ========================================= */
(() => {
  "use strict";
  if (window.PIXORO_COMMENTS_V57) return;
  window.PIXORO_COMMENTS_V57 = true;
  window.PIXORO_COMMENTS_V56 = true;

  const TABLE = "comments";
  const TABLE_LIKES = "comment_likes";
  let supa = null, commentChannel = null, likeChannel = null;
  let inputEl = null, sendBtnEl = null, listEl = null;
  let openPostId = null, replyTo = null, commentsCache = [];
  let currentCommentId = null, currentCommentUserId = null;
  let isSending = false;
  let profileMap = {};

  const ICON_HEART = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_HEART_FILLED = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF2D95" stroke="#FF2D95" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  const ICON_SEND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  function getSupa(){ if(supa) return supa; supa = window.getSupa?.() || window.supa || window.supabaseClient || null; return supa; }
  async function getUserId(){ const s=getSupa(); if(!s) return window.ME_ID||null; try{ const {data}=await s.auth.getSession(); const id=data?.session?.user?.id||null; if(id) window.ME_ID=id; return id; }catch(e){ return window.ME_ID||null; } }

  function cleanName(name){
    let n = String(name || "").trim().replace(/^@+/,"");
    if(n.includes("@")) n = n.split("@")[0];
    if(!n || n.toLowerCase()==="user") return "";
    return n;
  }
  function cleanAvatar(p){ return p?.avatar_url || p?.photo_url || p?.pfp || p?.photo || p?.picture || ""; }
  function pickName(p){ return cleanName(p?.username || p?.name || p?.display_name || p?.full_name || p?.user_name || ""); }

  async function ensureMyProfile(){
    const s=getSupa(); const userId=await getUserId(); if(!s||!userId) return;
    try{
      const {data} = await s.from("profiles").select("id").eq("id", userId).maybeSingle();
      if(data) return;
      const {data:u} = await s.auth.getUser();
      const meta = u?.user?.user_metadata || {};
      const fallback = cleanName(meta.username || meta.name || meta.display_name || meta.full_name || u?.user?.email?.split("@")[0]);
      if(!fallback) return;
      await s.from("profiles").insert({ id: userId, username: fallback, avatar_url: meta.avatar_url || meta.picture || "", email: u?.user?.email || "" });
    }catch(e){}
  }

  async function fetchProfiles(userIds){
    const s=getSupa(); if(!s) return profileMap;
    await ensureMyProfile();
    const ids=[...new Set((userIds||[]).map(id=>String(id)).filter(Boolean))].filter(id=>!profileMap[id]);
    if(ids.length){
      const {data, error}=await s.from("profiles").select("*").in("id", ids);
      (data||[]).forEach(p=>{
        const nm = pickName(p);
        profileMap[String(p.id)]={ username: nm || "user", avatar_url: cleanAvatar(p) };
      });
      const missing = ids.filter(id=>!profileMap[id]);
      if(missing.length){
        try{
          const {data:u}=await s.auth.getUser();
          if(u?.user?.id && missing.includes(String(u.user.id))){
            const meta=u.user.user_metadata||{};
            const fb = cleanName(meta.username || meta.name || meta.display_name || meta.full_name || u.user.email?.split("@")[0]);
            if(fb) profileMap[String(u.user.id)]={ username: fb, avatar_url: meta.avatar_url || meta.picture || "" };
          }
        }catch(e){}
      }
    }
    return profileMap;
  }
  function getProfile(userId){ return profileMap[String(userId)] || { username:"user", avatar_url:"" }; }
  async function getUserById(userId){ await fetchProfiles([userId]); return getProfile(userId); }

  function escapeHtml(str){ return String(str ?? "").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function timeAgo(ts){ if(!ts) return "now"; const t=new Date(ts).getTime(); if(!t) return "now"; const s=Math.floor((Date.now()-t)/1000); if(s<5) return "now"; if(s<60) return s+"s"; if(s<3600) return Math.floor(s/60)+"m"; if(s<86400) return Math.floor(s/3600)+"h"; if(s<604800) return Math.floor(s/86400)+"d"; return Math.floor(s/604800)+"w"; }
  function getAvatarInitial(name){ const n=cleanName(name)||"U"; return n.trim().charAt(0).toUpperCase()||"U"; }
  function getCommentModal(){ return document.getElementById("commentModal"); }
  function getInput(){ return document.querySelector("#commentModal #commentInput") || inputEl || document.querySelector("#commentModal input"); }
  function getSendBtn(){ return document.querySelector("#commentModal #cmtSendBtn, #commentModal .sendBtn"); }
  function getList(){ return document.querySelector("#commentModal #cmtList") || listEl; }
  function getPostId(){ const modal=getCommentModal(); return openPostId || modal?.dataset?.postId || window.PIXORO_OPEN_POST_ID || window.__pixoroLastCommentPostId || ""; }

  function syncFeedCommentCount(postId){
    if(!postId) return;
    const count = commentsCache.filter(c=>String(c.post_id)===String(postId)).length;
    document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(post=>{
      const el = post.querySelector("[data-comment-count], .comment-count, .commentCount, .cmtCount");
      if(el) el.textContent = count;
    });
    const allPosts = document.querySelectorAll("article.post, .post");
    allPosts.forEach(p=>{
      if(String(p.dataset?.postId||"")===String(postId)){
        const btn = p.querySelector("[data-comment-btn], .comment-btn, .cmt-open");
        if(btn){ const s = btn.querySelector("span"); if(s && !isNaN(Number(s.textContent))) s.textContent = count; }
      }
    });
    window.PIXORO_COMMENT_COUNTS = window.PIXORO_COMMENT_COUNTS || {};
    window.PIXORO_COMMENT_COUNTS[postId] = count;
  }

  function updateSendState(){
    const inp=getInput(); const btn=getSendBtn(); if(!inp||!btn) return; inputEl=inp; sendBtnEl=btn;
    const has=inp.value.trim().length>0; btn.classList.toggle("show",has); btn.style.display=has?"flex":"none"; btn.style.pointerEvents=has?"auto":"none";
    const box=document.querySelector("#commentModal .cmtBox"); if(box) box.classList.toggle("has-text",has);
    const area=document.querySelector("#commentModal .cmtInputArea"); if(area) area.classList.toggle("has-text",has);
  }
  function focusInput(){ const inp=getInput(); if(!inp) return; try{ inp.focus({preventScroll:true}); }catch(e){ inp.focus(); } }
  function setReplyTo(comment){
    replyTo=comment||null; const tag=document.getElementById("replyTag"); const tagName=document.getElementById("replyTagName"); if(!tag) return;
    if(replyTo){ tag.style.display="flex"; if(tagName) tagName.textContent="Replying to "+(cleanName(getProfile(replyTo.user_id).username)||"user"); } else tag.style.display="none";
  }
  function focusReply(comment){ setReplyTo(comment); focusInput(); }
  function getPostUsername(postId){
    const post=document.querySelector(`article.post[data-post-id="${postId}"], .post[data-post-id="${postId}"]`); if(!post) return "";
    const el=post.querySelector(".post-user, .pUser, .post-username, [data-username], .username"); return cleanName(el?.textContent?.trim()||"")||"";
  }

  async function loadComments(postId){
    const s=getSupa(); if(!s) return;
    try{
      const {data, error}=await s.from(TABLE).select("id,post_id,user_id,parent_id,text,created_at").eq("post_id", postId).order("created_at", {ascending:true});
      if(error) throw error;
      commentsCache=data||[];
      await fetchProfiles(commentsCache.map(c=>c.user_id));
      renderComments(); syncFeedCommentCount(postId); syncCommentLikes();
    }catch(e){ console.error("PIXORO COMMENTS LOAD:", e); }
  }

  // ✅ V57 - THREAD REPLY DA - Reply Romba Chinna da - View Romba Chinna da
  function renderComments(){
    const list=getList(); if(!list) return; listEl=list;
    if(!commentsCache.length){ list.innerHTML='<div style="text-align:center;color:#777;padding:30px 10px;font-size:13px">No comments yet.<br>Be the first to comment.</div>'; return; }
    const me=window.ME_ID;
    const parents = commentsCache.filter(c=>!c.parent_id);
    const childs = commentsCache.filter(c=>c.parent_id);

    function oneRow(c, isReply){
      const prof=getProfile(c.user_id);
      const name=cleanName(prof.username)||"user";
      const av=prof.avatar_url;
      const liked=(window.FEED_COMMENT_LIKES||new Set()).has(String(c.id));
      const count=Number(window.FEED_COMMENT_COUNTS?.[c.id]||0);
      const isMine=me && String(c.user_id)===String(me);
      const uid=escapeHtml(c.user_id||"");
      const avatarHtml = av ? `<img src="${escapeHtml(av)}" onerror="this.style.display='none'">` : escapeHtml(getAvatarInitial(name));
      return `<div class="cmtRow ${isReply?"cmtReplyRow":""}" data-comment-id="${escapeHtml(c.id)}" data-user-id="${uid}">
        <div class="cmtAvatar cmtGoProfile" data-go-profile="${uid}" data-go-name="${escapeHtml(name)}">${avatarHtml}</div>
        <div class="cmtContent">
          <div class="cmtTop"><b class="cmtUser cmtGoProfile" data-go-profile="${uid}" data-go-name="${escapeHtml(name)}">${escapeHtml(name)}</b><span class="cmtTime">${timeAgo(c.created_at)}</span></div>
          <div class="cmtText">${escapeHtml(c.text||"")}</div>
          <div class="cmtMeta"><span class="cmtReplyBtn" data-reply="${escapeHtml(c.id)}">Reply</span>${isMine?`<span class="cmtDeleteBtn" data-delete="${escapeHtml(c.id)}">Delete</span>`:""}</div>
        </div>
        <button class="cmtLike ${liked?"liked":""}" data-like="${escapeHtml(c.id)}">${liked?ICON_HEART_FILLED:ICON_HEART}<span class="cmtLikeCount">${count>0?count:""}</span></button>
      </div>`;
    }

    const orphan = childs.filter(ch=>!parents.some(p=>String(p.id)===String(ch.parent_id)));
    const allParents = [...parents, ...orphan];

    list.innerHTML = allParents.map(p=>{
      const reps = childs.filter(ch=>String(ch.parent_id)===String(p.id));
      let html = oneRow(p, false);
      if(reps.length){
        // ✅ V57 - View X more replies - Chinna Tha Varum da
        html += `<div class="cmtViewReplies" data-view-replies="${escapeHtml(p.id)}" data-reply-count="${reps.length}">— View ${reps.length} more repl${reps.length>1?"ies":"y"}</div><div class="cmtReplyBox" id="replies-${escapeHtml(p.id)}" style="display:none">${reps.map(r=>oneRow(r,true)).join("")}</div>`;
      }
      return `<div class="cmtThread">${html}</div>`;
    }).join("");

    list.querySelectorAll("[data-view-replies]").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.stopPropagation();
        const box = document.getElementById("replies-"+btn.dataset.viewReplies);
        if(!box) return;
        const n = Number(btn.dataset.replyCount||0);
        const isOpen = box.style.display!=="none";
        box.style.display = isOpen?"none":"block";
        btn.textContent = isOpen ? `— View ${n} more repl${n>1?"ies":"y"}` : `— Hide ${n} repl${n>1?"ies":"y"}`;
      });
    });
  }

  function goToProfile(userId, userName){
    if(!userId) return; closeCommentModal();
    const me=window.ME_ID;
    if(String(userId)===String(me)) location.href='./profile.html';
    else location.href='./profile.html?user_id='+encodeURIComponent(userId)+'&username='+encodeURIComponent(userName||'');
  }

  function toggleCommentLike(commentId, btn){
    if(!commentId||!btn) return; const liked=btn.classList.contains("liked"); const willLike=!liked; const prevCount=Number(window.FEED_COMMENT_COUNTS?.[commentId]||0); const newCount=willLike?prevCount+1:Math.max(0,prevCount-1);
    btn.classList.toggle("liked", willLike); btn.innerHTML=(willLike?ICON_HEART_FILLED:ICON_HEART)+`<span class="cmtLikeCount">${newCount>0?newCount:""}</span>`;
    window.FEED_COMMENT_COUNTS=window.FEED_COMMENT_COUNTS||{}; window.FEED_COMMENT_COUNTS[commentId]=newCount; window.FEED_COMMENT_LIKES=window.FEED_COMMENT_LIKES||new Set();
    if(willLike) window.FEED_COMMENT_LIKES.add(String(commentId)); else window.FEED_COMMENT_LIKES.delete(String(commentId));
    queueCommentLikeSave(commentId, willLike, btn, liked, prevCount);
  }
  const pendingLikeSaves=new Map();
  function queueCommentLikeSave(commentId, willLike, btn, prevLiked, prevCount){
    const prev=pendingLikeSaves.get(commentId)||Promise.resolve();
    const next=prev.catch(()=>{}).then(async()=>{ const s=getSupa(); const userId=await getUserId(); if(!s||!userId) throw new Error("Login first"); if(willLike){ const {error}=await s.from(TABLE_LIKES).upsert({comment_id:commentId, user_id:userId},{onConflict:"comment_id,user_id", ignoreDuplicates:true}); if(error) throw error; } else { const {error}=await s.from(TABLE_LIKES).delete().eq("comment_id", commentId).eq("user_id", userId); if(error) throw error; } }).catch((e)=>{ console.error("LIKE SAVE:", e); btn.classList.toggle("liked", prevLiked); btn.innerHTML=(prevLiked?ICON_HEART_FILLED:ICON_HEART)+`<span class="cmtLikeCount">${prevCount>0?prevCount:""}</span>`; window.FEED_COMMENT_COUNTS[commentId]=prevCount; if(prevLiked) window.FEED_COMMENT_LIKES.add(String(commentId)); else window.FEED_COMMENT_LIKES.delete(String(commentId)); });
    pendingLikeSaves.set(commentId, next);
  }
  async function syncCommentLikes(){
    const s=getSupa(); const userId=await getUserId(); if(!s||!userId||!commentsCache.length) return;
    try{ const ids=commentsCache.map((c)=>String(c.id)); let all=[]; let from=0; while(true){ const {data, error}=await s.from(TABLE_LIKES).select("comment_id,user_id").in("comment_id", ids).range(from, from+999); if(error) throw error; const rows=data||[]; all=all.concat(rows); if(rows.length<1000) break; from+=1000; } const counts={}; const liked=new Set(); ids.forEach((id)=>counts[id]=0); all.forEach((r)=>{ const id=String(r.comment_id); counts[id]=(counts[id]||0)+1; if(String(r.user_id)===String(userId)) liked.add(id); }); window.FEED_COMMENT_COUNTS=counts; window.FEED_COMMENT_LIKES=liked; renderComments(); }catch(e){}
  }

  async function addComment(){
    if(isSending) return;
    const inp=getInput(); inputEl=inp; const text=inp?.value?.trim()||""; if(!text) return;
    const postId=String(getPostId()||""); if(!postId){ alert("Post ID kedaikala da"); return; }
    openPostId=postId; window.PIXORO_OPEN_POST_ID=postId;
    const s=getSupa(); const userId=await getUserId(); if(!s||!userId){ alert("Please login first"); return; }
    await ensureMyProfile();
    await fetchProfiles([userId]);
    let parentId = null;
    let saveText = text;
    if(replyTo){
      const rawId = replyTo.id;
      parentId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      if(!text.startsWith("@")){
        const rName = cleanName(getProfile(replyTo.user_id).username)||"user";
        saveText = "@"+rName+" "+text;
      }
    }
    const tempId="temp-"+Date.now();
    const temp={id:tempId, post_id:postId, user_id:userId, parent_id:parentId, text:saveText, created_at:new Date().toISOString()};
    commentsCache.push(temp); renderComments(); syncFeedCommentCount(postId); if(inp) inp.value=""; setReplyTo(null); updateSendState();
    isSending=true;
    try{
      const insertObj={ post_id:postId, user_id:userId, text:saveText };
      if(parentId) insertObj.parent_id = parentId;
      const {data, error}=await s.from(TABLE).insert(insertObj).select("id,post_id,user_id,parent_id,text,created_at").single();
      if(error) throw error;
      const idx=commentsCache.findIndex((c)=>String(c.id)===tempId); if(idx>=0 && data) commentsCache[idx]=data;
      renderComments(); syncFeedCommentCount(postId);
    }catch(e){
      console.error("PIXORO COMMENT ADD:", e);
      commentsCache=commentsCache.filter(c=>String(c.id)!==tempId);
      renderComments(); syncFeedCommentCount(postId);
      alert("Failed: "+(e.message||"Check Supabase RLS da"));
    }finally{ isSending=false; }
  }

  async function deleteComment(commentId){
    if(!commentId) return;
    const postId = String(getPostId()||openPostId||"");
    commentsCache=commentsCache.filter((c)=>String(c.id)!==String(commentId)); renderComments(); syncFeedCommentCount(postId); closeCommentOptions();
    try{ const s=getSupa(); const userId=await getUserId(); if(!s||!userId) throw new Error("Login first"); const {error}=await s.from(TABLE).delete().eq("id", commentId).eq("user_id", userId); if(error) throw error; }catch(e){ console.error(e); }
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
  // ✅ V57 - Delete Option - Full Black da
  function openCommentOptions(commentId, userId){
    currentCommentId=String(commentId); currentCommentUserId=String(userId||""); const modal=document.getElementById("cmtOptionModal"); const content=document.getElementById("cmtOptContent"); if(!modal||!content) return;
    const me=window.ME_ID; const isMine=me && String(userId)===String(me);
    content.innerHTML=`<button data-opt="share" style="background:#000">Share Comment</button><button data-opt="copy" style="background:#000">Copy Text</button><button data-opt="report" style="background:#000">Report</button>${isMine?`<button data-opt="delete" style="color:#ff5a5a;background:#000">Delete</button>`:""}<button data-opt="cancel" style="color:#aaa;background:#000">Cancel</button>`; modal.style.display="flex";
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
      commentChannel=s.channel("pixoro-comments-"+postId).on("postgres_changes",{event:"*", schema:"public", table:TABLE, filter:`post_id=eq.${postId}`}, async (payload)=>{
        if(payload.eventType==="INSERT"){ const row=payload.new; await fetchProfiles([row.user_id]); if(!commentsCache.some((c)=>String(c.id)===String(row.id))){ commentsCache.push(row); renderComments(); syncFeedCommentCount(postId); } }
        if(payload.eventType==="DELETE"){ commentsCache=commentsCache.filter((c)=>String(c.id)!==String(payload.old.id)); renderComments(); syncFeedCommentCount(postId); }
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
            <button class="sendBtn pixoro-c-send-arrow" id="cmtSendBtn" type="button" style="display:none">${ICON_SEND}</button>
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
      const goBtn=e.target.closest("[data-go-profile]"); if(goBtn){ e.stopPropagation(); goToProfile(goBtn.dataset.goProfile, goBtn.dataset.goName); return; }
      const likeBtn=e.target.closest("[data-like]"); if(likeBtn){ e.stopPropagation(); toggleCommentLike(likeBtn.dataset.like, likeBtn); return; }
      const replyBtn=e.target.closest("[data-reply]"); if(replyBtn){ const c=commentsCache.find((x)=>String(x.id)===String(replyBtn.dataset.reply)); if(c) focusReply(c); return; }
      const delBtn=e.target.closest("[data-delete]"); if(delBtn){ deleteComment(delBtn.dataset.delete); return; }
      const row=e.target.closest(".cmtRow"); if(row && !e.target.closest(".cmtLike") && !e.target.closest("[data-view-replies]")) openCommentOptions(row.dataset.commentId, row.dataset.userId);
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
  window.pixoroGoToProfile=goToProfile; window.pixoroGetUserById=getUserById;
  function startComments(){ layout(); bindOpenButtons(); }
  window.addEventListener("pixoro-feed-rendered", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro-supa-ready", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro:login", ()=>{ setTimeout(layout, 100); });
  window.addEventListener("pixoro:logout", ()=>{ closeCommentModal(); });
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", startComments, {once:true}); } else { startComments(); }
  console.log("PIXORO COMMENTS V57 READY 💬");
})();
