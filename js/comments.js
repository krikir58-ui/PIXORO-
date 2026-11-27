// ===== PIXORO COMMENT - v28 - js/comments.js la Podu da =====
// v27 + @ Remove + See translation Remove + Reply/Delete/Like Outline SVG da

const PIXORO_COMMENT_EMOJIS = ["❤️","🙌","🔥","👏","😍","😮","😂","💯"];
const PIXORO_ICON_EMOJI = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
const PIXORO_ICON_GIF = `<svg width="30" height="26" viewBox="0 0 30 26" fill="none" stroke="#fff" stroke-width="1.8"><rect x="1" y="3" width="28" height="20" rx="5"/><text x="15" y="17" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" stroke="none" font-family="system-ui">GIF</text></svg>`;
const PIXORO_ICON_STICKER = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 2.4 3.4-.5.5 3.4L21 10l-1.5 2.5 1 3.3-3 1.5L16 20l-2.5-1.2L11 20l-1.5-2.7-3-1.5 1-3.3L6 10l2.7-2.7.5-3.4 3.4.5L12 2z"/><circle cx="12" cy="12" r="3"/></svg>`;
const PIXORO_ICON_SEND = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
// ✅ v28 ADD - Outline SVG da
const PIXORO_ICON_HEART_OUTLINE = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const PIXORO_ICON_HEART_FILL = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#FF2D95" stroke="#FF2D95" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const PIXORO_ICON_REPLY = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7a5 5 0 0 1-5-5V7"/><path d="M3 7l4-4 4 4"/><path d="M9 17v-4a3 3 0 0 1 3-3h8"/></svg>`;
const PIXORO_ICON_TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C5C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`;

function pixoroCommentCSS(){
  if(document.getElementById("pixoro-comment-style")) return;
  const s = document.createElement("style");
  s.id = "pixoro-comment-style";
  s.textContent = `
    #commentModal, #commentModal *, #commentModal *:before, #commentModal *:after{animation:none!important;transition:none!important;}
    #commentModal{position:fixed!important;inset:0!important;background:rgba(0,0,0,.6)!important;display:none;align-items:flex-end!important;justify-content:center!important;z-index:9999!important;}
    #commentModal > div{position:absolute!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;background:#1c1c1e!important;border-radius:22px 22px 0 0!important;overflow:hidden!important;width:100%!important;height:92dvh!important;max-height:92dvh!important;display:flex!important;flex-direction:column!important;transform:none!important;}
    #commentModal > div:before{content:"";width:48px;height:5px;background:#555;border-radius:99px;margin:10px auto 4px auto;flex-shrink:0;}
    .pixoro-c-head{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:10px 18px 6px 18px!important;}
    .pixoro-c-head h3{color:#fff!important;font-size:22px!important;font-weight:800!important;margin:0!important;}
    .pixoro-c-close{color:#fff!important;font-size:28px!important;cursor:pointer!important;background:none!important;border:none!important;line-height:1!important;}
    .pixoro-c-old-hide{display:none!important;}
    #commentList{flex:1!important;overflow-y:auto!important;padding:4px 16px!important;display:block!important;}
    .pixoro-c-empty{padding:36px 20px;text-align:center;}
    .pixoro-c-empty-heart{font-size:42px;}
    .pixoro-c-optimistic{opacity:.7;}
    .pixoro-c-bottom{border-top:1px solid #333;padding:10px 16px 16px 16px;background:#1c1c1e;flex-shrink:0;}
    #commentModal .pixoro-c-emoji-row{display:flex;gap:22px;overflow-x:auto;padding:2px 4px 12px 4px;scrollbar-width:none;}
    #commentModal .pixoro-c-emoji-row::-webkit-scrollbar{display:none;}
    #commentModal .pixoro-c-emoji-row button{background:none;border:none;font-size:30px;cursor:pointer;flex-shrink:0;line-height:1;}
    .pixoro-c-bottom-input{display:flex;align-items:center;gap:10px;}
    .pixoro-c-pill{display:flex;align-items:center;gap:8px;flex:1;background:#2a2a2e;border:1px solid #3a3a3e;border-radius:999px;padding:6px 6px 6px 12px;min-width:0;}
    #commentInput{background:transparent!important;color:#fff!important;border:none!important;flex:1!important;min-width:0!important;padding:8px 0!important;font-size:15px!important;outline:none!important;box-shadow:none!important;}
    #commentInput::placeholder{color:#888!important;}
    .pixoro-c-icon-btn{background:none!important;border:none!important;cursor:pointer!important;padding:6px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;}
    .pixoro-c-send-btn{display:none!important;}
    .pixoro-c-send-arrow{background:linear-gradient(135deg,#7B2FFF,#A855F7)!important;border:none!important;width:56px!important;height:56px!important;min-width:56px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;flex-shrink:0!important;box-shadow:0 4px 16px rgba(123,47,255,.5)!important;touch-action:manipulation!important;pointer-events:auto!important;}
    .pixoro-c-send-arrow:active{transform:scale(.9)!important;}
    .pixoro-c-ava{width:44px!important;height:44px!important;border-radius:50%!important;padding:2px!important;background:conic-gradient(from 180deg,#FF2D95,#FF9A00,#00E5FF,#7B2FFF,#FF2D95)!important;flex-shrink:0!important;display:flex!important;align-items:center!important;justify-content:center!important;}
    .pixoro-c-ava img{width:100%!important;height:100%!important;border-radius:50%!important;object-fit:cover!important;border:2px solid #1c1c1e!important;background:#222!important;}
    .pixoro-c-user{color:#fff;font-weight:700;font-size:15px;}
    .pixoro-c-time{color:#888;font-weight:400;font-size:14px;margin-left:8px;}
    .pixoro-c-text{color:#fff;font-size:16px;line-height:1.4;margin-top:2px;}
    .pixoro-c-sub{color:#888;font-size:14px;margin-top:6px;display:flex;gap:14px;align-items:center;}
    .pixoro-c-sub span{cursor:pointer;display:inline-flex;align-items:center;gap:5px;}
    .pixoro-c-heart{cursor:pointer;line-height:1;text-align:center;user-select:none;display:flex;justify-content:center;}
    .pixoro-c-heart-count{color:#fff;font-size:13px;text-align:center;margin-top:2px;}
    .pixoro-c-reply-tag{color:#FF2D95;font-size:13px;margin-bottom:2px;}
  `;
  document.head.appendChild(s);
}
function pixoroFindPostId(fromEl){
  if(typeof fromEl === 'string' && fromEl.length > 3 && !fromEl.includes('[object') && fromEl !== 'undefined') return fromEl;
  if(fromEl && fromEl.dataset && fromEl.dataset.postId) return fromEl.dataset.postId;
  let el = fromEl && fromEl.closest ? fromEl.closest('[data-post-id],[data-id],article,.post,.post-card') : null;
  if(el && el.dataset?.postId) return el.dataset.postId;
  if(el && el.dataset?.id) return el.dataset.id;
  if(window._CUR && typeof window._CUR === 'string' && window._CUR !== 'undefined') return window._CUR;
  if(window.LAST_CLICKED_POST_ID) return window.LAST_CLICKED_POST_ID;
  if(window.CURRENT_COMMENT_POST && window.CURRENT_COMMENT_POST !== 'undefined') return window.CURRENT_COMMENT_POST;
  let md = document.getElementById('commentModal')?.dataset?.postId;
  if(md && md !== 'undefined') return md;
  let first = document.querySelector('[data-comment-count]');
  if(first) return first.getAttribute('data-comment-count');
  return null;
}
document.addEventListener('click', (e)=>{
  let t = e.target.closest('[data-post-id],[data-id],[onclick*="openComment"]');
  if(t){
    if(t.dataset?.postId) window.LAST_CLICKED_POST_ID = t.dataset.postId;
    else if(t.dataset?.id) window.LAST_CLICKED_POST_ID = t.dataset.id;
    let m = t.getAttribute('onclick') || '';
    let mm = m.match(/openComment\(['"]([^'"]+)['"]\)/);
    if(mm && mm[1]) window.LAST_CLICKED_POST_ID = mm[1];
  }
  let card = e.target.closest('[data-post-id],article,.post,.post-card');
  if(card?.dataset?.postId) window.LAST_CLICKED_POST_ID = card.dataset.postId;
}, true);
function pixoroCommentLayout(){
  pixoroCommentCSS();
  const modal = document.getElementById("commentModal");
  if(!modal) return;
  const box = modal.querySelector(":scope > div");
  if(!box) return;
  [...box.children].forEach(el=>{
    if(el.classList.contains("pixoro-c-head") || el.id === "commentList" || el.classList.contains("pixoro-c-bottom")) return;
    if(el.contains(document.getElementById("commentInput"))) return;
    el.classList.add("pixoro-c-old-hide");
  });
  if(!modal.querySelector(".pixoro-c-head")){
    const head = document.createElement("div");
    head.className = "pixoro-c-head";
    head.innerHTML = `<h3 id="pixoroCHead">Comments</h3><button type="button" class="pixoro-c-close" onclick="closeComment()">✕</button>`;
    box.prepend(head);
  }
  if(!modal.querySelector(".pixoro-c-bottom")){
    const input = document.getElementById("commentInput");
    const oldWrap = input?.parentElement;
    if(!input || !oldWrap) return;
    const bottom = document.createElement("div");
    bottom.className = "pixoro-c-bottom";
    const emojiRow = document.createElement("div");
    emojiRow.className = "pixoro-c-emoji-row";
    emojiRow.innerHTML = PIXORO_COMMENT_EMOJIS.map(e=>`<button type="button" data-emoji="${e}">${e}</button>`).join("");
    emojiRow.querySelectorAll("[data-emoji]").forEach(b=>{ b.onclick = ()=>{ input.value += b.dataset.emoji; input.focus(); }; });
    const bottomInput = document.createElement("div");
    bottomInput.className = "pixoro-c-bottom-input";
    const pill = document.createElement("div");
    pill.className = "pixoro-c-pill";
    const emojiBtn = document.createElement("button");
    emojiBtn.type = "button"; emojiBtn.className = "pixoro-c-icon-btn"; emojiBtn.innerHTML = PIXORO_ICON_EMOJI;
    emojiBtn.onclick = ()=>{ emojiRow.style.display = emojiRow.style.display === "none" ? "flex" : "none"; input.focus(); };
    const gifBtn = document.createElement("button");
    gifBtn.type = "button"; gifBtn.className = "pixoro-c-icon-btn"; gifBtn.innerHTML = PIXORO_ICON_GIF;
    gifBtn.onclick = ()=>{ emojiRow.style.display = "flex"; input.focus(); };
    const stickerBtn = document.createElement("button");
    stickerBtn.type = "button"; stickerBtn.className = "pixoro-c-icon-btn"; stickerBtn.innerHTML = PIXORO_ICON_STICKER;
    stickerBtn.onclick = ()=>{ emojiRow.style.display = "flex"; input.focus(); };
    const sendArrow = document.createElement("button");
    sendArrow.type = "button"; sendArrow.className = "pixoro-c-send-arrow"; sendArrow.innerHTML = PIXORO_ICON_SEND;
    sendArrow.onclick = (e)=>{ e.preventDefault(); e.stopPropagation(); pixoroSendComment(); };
    oldWrap.querySelectorAll("button").forEach(b=>{ if(/post|send/i.test(b.textContent||"")) b.classList.add("pixoro-c-send-btn"); });
    pill.append(emojiBtn, input, gifBtn, stickerBtn);
    bottomInput.append(pill, sendArrow);
    bottom.append(emojiRow, bottomInput);
    oldWrap.classList.add("pixoro-c-old-hide");
    box.append(bottom);
  }
}
function pixoroOpenCommentReal(id, el){
  let pid = pixoroFindPostId(id) || pixoroFindPostId(el) || pixoroFindPostId(window.event?.target);
  if(!pid){
    let m = document.getElementById('commentModal');
    if(m) m.style.display = 'flex';
    return;
  }
  window._CUR = pid;
  window.CURRENT_COMMENT_POST = pid;
  window.LAST_CLICKED_POST_ID = pid;
  let m = document.getElementById('commentModal');
  if(m){ m.dataset.postId = pid; m.style.display = 'flex'; }
  loadComments(pid);
}
window.pixoroOpenCommentReal = pixoroOpenCommentReal;
function openComment(id, el){ return pixoroOpenCommentReal(id, el); }
function closeComment(){
  let m = document.getElementById('commentModal');
  if(m) m.style.display = 'none';
}
window.openComment = openComment;
window.closeComment = closeComment;
function escHtml(t){
  return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function pixoroTimeAgo(ts){
  if(!ts) return "";
  let d = Math.floor((Date.now() - new Date(ts).getTime())/1000);
  if(d < 60) return "now";
  if(d < 3600) return Math.floor(d/60)+"m";
  if(d < 86400) return Math.floor(d/3600)+"h";
  return Math.floor(d/86400)+"d";
}
let pixoroLiked = new Set(JSON.parse(localStorage.getItem('pixoroLiked')||'[]'));
let pixoroReplyTo = null;
let pixoroProfileMap = {};
function pixoroCommentRow(c, postId, isOptimistic){
  let isMine = window.ME_ID && String(c.user_id) === String(window.ME_ID);
  let prof = pixoroProfileMap[String(c.user_id)] || {};
  // ✅ v28 - @ Remove da - giri_office Mattum da
  let uname = String(c.username || prof.username || window.ME_RAW || 'user').replace(/^@+/,'');
  if(!c.username && !prof.username) uname = 'user';
  let ava = escHtml(window.pixoroGetAvatar ? window.pixoroGetAvatar(c) : (c.avatar_url || prof.avatar_url || ''));
  // ✅ v28 - Reply / Delete Outline SVG da - See translation Illa da
  let delBtn = isMine && !isOptimistic ? `<span data-del="${c.id}" data-post="${postId}" style="cursor:pointer;color:#FF5C5C">${PIXORO_ICON_TRASH} Delete</span>` : '';
  let liked = pixoroLiked.has(String(c.id));
  let likeCount = c.likes_count || 0;
  let replyToName = String(c.reply_to || 'user').replace(/^@+/,'');
  let replyTag = c.parent_id ? `<div class="pixoro-c-reply-tag">Replying to ${escHtml(replyToName)}</div>` : '';
  return `<div class="pixoro-c-item ${isOptimistic?'pixoro-c-optimistic':''}" data-temp="${c._temp||''}" data-cid="${c.id}" style="display:flex;gap:12px;padding:12px 0;align-items:flex-start">
    <div class="pixoro-c-ava"><img src="${ava}" onerror="this.src='https://ui-avatars.com/api/?name=U&background=222&color=fff'"></div>
    <div style="flex:1;min-width:0"><div><span class="pixoro-c-user">${escHtml(uname)}</span><span class="pixoro-c-time">${isOptimistic?'now':pixoroTimeAgo(c.created_at)}</span></div>${replyTag}<div class="pixoro-c-text">${escHtml(c.text||c.content||'')}</div><div class="pixoro-c-sub"><span data-reply="${c.id}" data-uname="${escHtml(uname)}">${PIXORO_ICON_REPLY} Reply</span>${delBtn} ${isOptimistic?'<span style="color:#FF2D95">• Sending...</span>':''}</div></div>
    <div><div class="pixoro-c-heart ${liked?'liked':''}" data-like="${c.id}">${liked?PIXORO_ICON_HEART_FILL:PIXORO_ICON_HEART_OUTLINE}</div><div class="pixoro-c-heart-count">${likeCount||''}</div></div>
  </div>`;
}
function pixoroReplyComment(cid, username){
  pixoroReplyTo = { id: cid, username: username };
  let inp = document.getElementById('commentInput');
  if(inp){ inp.value = '@' + username + ' '; inp.focus(); inp.placeholder = 'Replying to ' + username + '...'; }
}
async function pixoroToggleLike(cid, el){
  let liked = pixoroLiked.has(String(cid));
  let countEl = el.parentElement.querySelector('.pixoro-c-heart-count');
  let cur = Number(countEl?.innerText||0);
  if(liked){ pixoroLiked.delete(String(cid)); el.innerHTML = PIXORO_ICON_HEART_OUTLINE; el.classList.remove('liked'); if(countEl) countEl.innerText = cur > 0 ? cur - 1 : ''; }
  else{ pixoroLiked.add(String(cid)); el.innerHTML = PIXORO_ICON_HEART_FILL; el.classList.add('liked'); if(countEl) countEl.innerText = cur + 1; }
  localStorage.setItem('pixoroLiked', JSON.stringify([...pixoroLiked]));
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
    let uid = window.ME_ID;
    if(!uid){ let {data:{session}} = await s.auth.getSession(); if(session) uid = session.user.id; }
    if(!uid) return;
    let cidNum = Number(cid);
    if(liked){ let r = await s.from('comment_likes').delete().eq('comment_id', cidNum).eq('user_id', uid); if(r.error) throw r.error; }
    else{ let r = await s.from('comment_likes').insert({ comment_id: cidNum, user_id: uid }); if(r.error) throw r.error; }
  }catch(e){ console.log('LIKE FAIL:', e.message); }
}
document.addEventListener('click', (e)=>{
  let likeEl = e.target.closest('[data-like]');
  if(likeEl){ e.stopPropagation(); pixoroToggleLike(likeEl.dataset.like, likeEl); return; }
  let replyEl = e.target.closest('[data-reply]');
  if(replyEl){ pixoroReplyComment(replyEl.dataset.reply, replyEl.dataset.uname); return; }
  let delEl = e.target.closest('[data-del]');
  if(delEl){ deleteComment(delEl.dataset.del, delEl.dataset.post); return; }
});
async function loadComments(postId){
  if(!postId || postId === 'undefined') return;
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
    let {data, error} = await s.from('comments').select('*').eq('post_id', String(postId)).order('created_at',{ascending:true});
    if(error) return;
    let uids = [...new Set((data||[]).map(c=>c.user_id).filter(Boolean))];
    if(uids.length){
      let pr = await s.from('profiles').select('id,username,avatar_url').in('id', uids);
      if(!pr.error) (pr.data||[]).forEach(p=>{ pixoroProfileMap[String(p.id)] = p; });
    }
    // ✅ v28 - Like State ah DB la Irundhu Load Pannuven da
    if(window.ME_ID){
      let lk = await s.from('comment_likes').select('comment_id').eq('user_id', window.ME_ID);
      if(!lk.error) (lk.data||[]).forEach(r=>pixoroLiked.add(String(r.comment_id)));
      localStorage.setItem('pixoroLiked', JSON.stringify([...pixoroLiked]));
    }
    let box = document.getElementById('commentList'); if(!box) return;
    if(box.querySelector('.pixoro-c-optimistic')) return;
    box.innerHTML = (data||[]).map(c=>pixoroCommentRow(c, postId, false)).join('');
    if(!box.innerHTML.trim()) box.innerHTML = '<div class="pixoro-c-empty"><div class="pixoro-c-empty-heart">❤️</div><div style="color:#fff;font-size:22px;font-weight:700;margin-top:10px">No comments yet</div><div style="color:#888;font-size:14px;margin-top:6px">Start the conversation.</div></div>';
    let cnt = (data||[]).length;
    let head = document.getElementById("pixoroCHead");
    if(head) head.innerText = `Comments (${cnt})`;
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = cnt;
  }catch(e){}
}
let pixoroSending = false;
function pixoroSendComment(){
  if(pixoroSending) return;
  let inp = document.getElementById('commentInput');
  if(!inp) return;
  let txt = inp.value.trim();
  if(!txt) return;
  let postId = pixoroFindPostId();
  if(!postId || postId === 'undefined'){ alert('Post ID Illa da - feed.js Fix Pannu da'); return; }
  window.CURRENT_COMMENT_POST = postId;
  window._CUR = postId;
  pixoroSending = true;
  setTimeout(()=>{ pixoroSending = false; }, 800);
  let tempId = 'temp_' + Date.now();
  let box = document.getElementById('commentList');
  let myName = (window.ME_RAW||'user').replace(/^@+/,'');
  let myAva = window.ME_AVATAR || window.MY_PFP || '';
  let replyInfo = pixoroReplyTo;
  if(box){
    if(box.querySelector('.pixoro-c-empty')) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', pixoroCommentRow({ _temp: tempId, user_id: window.ME_ID||'me', username: myName, avatar_url: myAva, text: txt, created_at: new Date().toISOString(), parent_id: replyInfo?.id||null, reply_to: replyInfo?.username||'' }, postId, true));
    box.scrollTop = box.scrollHeight;
    let head = document.getElementById("pixoroCHead");
    if(head){ let n = Number((head.innerText.match(/\d+/)||['0'])[0]) + 1; head.innerText = `Comments (${n})`; }
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = Number(cc.innerText||0) + 1;
  }
  inp.value = ''; inp.placeholder = 'Add comment...'; pixoroReplyTo = null;
  (async ()=>{
    try{
      let s = window.getSupa ? window.getSupa() : window.supa;
      if(!s){ alert('Supabase Connect Agala da'); return; }
      let uid = window.ME_ID;
      if(!uid){
        let {data:{session}} = await s.auth.getSession();
        if(!session){ alert('Login Illa da'); return; }
        uid = session.user.id; window.ME_ID = uid;
      }
      if(!myName || myName === 'user'){
        let pr = await s.from('profiles').select('username,avatar_url').eq('id', uid).single();
        if(!pr.error && pr.data?.username){ myName = String(pr.data.username).replace(/^@+/,''); window.ME_RAW = myName; }
        if(!myAva && pr.data?.avatar_url) myAva = pr.data.avatar_url;
      }
      let pidStr = String(postId);
      let uidStr = String(uid);
      let payload = { post_id: pidStr, user_id: uidStr, username: myName, avatar_url: myAva, text: txt, content: txt };
      if(replyInfo?.id) payload.parent_id = Number(replyInfo.id);
      let {error} = await s.from('comments').insert(payload);
      if(error){
        let p2 = { post_id: pidStr, user_id: uidStr, text: txt };
        if(replyInfo?.id) p2.parent_id = Number(replyInfo.id);
        let r2 = await s.from('comments').insert(p2);
        error = r2.error;
        if(error){
          let p3 = { post_id: pidStr, user_id: uidStr, content: txt };
          let r3 = await s.from('comments').insert(p3);
          error = r3.error;
        }
      }
      if(error) throw error;
      let tempEl = box?.querySelector(`[data-temp="${tempId}"]`);
      if(tempEl) tempEl.remove();
      loadComments(postId);
    }catch(e){ alert('Send Fail da - Karanam: ' + e.message); }
  })();
}
async function deleteComment(commentId, postId){
  if(!confirm('Delete pannatta da?')) return;
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
    let {error} = await s.from('comments').delete().eq('id', Number(commentId)).eq('user_id', String(window.ME_ID));
    if(error) throw error;
    let el = document.querySelector(`[data-cid="${commentId}"]`);
    if(el) el.remove();
    loadComments(postId);
  }catch(e){ alert('Delete Fail da - ' + e.message); }
}
document.addEventListener('DOMContentLoaded', ()=>{
  pixoroCommentLayout();
  let inp = document.getElementById('commentInput');
  if(inp) inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); pixoroSendComment(); } });
});
if(document.readyState !== 'loading') pixoroCommentLayout();
window.pixoroSendComment = pixoroSendComment;
window.addComment = pixoroSendComment;
window.pixoroOpenCommentReal = pixoroOpenCommentReal;
window.loadComments = loadComments;
window.deleteComment = deleteComment;
window.pixoroToggleLike = pixoroToggleLike;
window.pixoroReplyComment = pixoroReplyComment;
window.escHtml = escHtml;
