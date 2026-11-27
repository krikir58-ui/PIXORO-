// ===== PIXORO COMMENT - THANI FILE DA =====
// RULE: OPTIMISTIC UI da - Pixoro Mari da
// Send -> Udane Screen la Varum -> Pinnadi Server Save da
// Comment panna -> Server la Save + Count Update aagum da
//       Save = Server la mattum thaan da - LocalStorage Illa da
// STYLE: Pixoro Comment + Pixoro Pink-Purple da
// SPEED: Animation Illa da - Instant da - 0 Sec da

const PIXORO_COMMENT_EMOJIS = ["❤️","🙌","🔥","👏","😢","😍","😮","😂"];

// ✅ OUTLINE SVG ICONS da - Fill Illa da - Image / Photo Icon Illa da
const PIXORO_ICON_EMOJI = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;
const PIXORO_ICON_GIF = `<svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="26" height="18" rx="4"/><text x="14" y="16" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" stroke="none" font-family="system-ui">GIF</text></svg>`;
const PIXORO_ICON_STICKER = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 2.4 3.4-.5.5 3.4L21 10l-1.5 2.5 1 3.3-3 1.5L16 20l-2.5-1.2L11 20l-1.5-2.7-3-1.5 1-3.3L6 10l2.7-2.7.5-3.4 3.4.5L12 2z"/><circle cx="12" cy="12" r="3"/></svg>`;
// ✅ SEND ARROW da - Type Box Pakkathula da - Post ku Badhila da
const PIXORO_ICON_SEND = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF2D95" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;

function pixoroCommentCSS(){
  if(document.getElementById("pixoro-comment-style")) return;
  const s = document.createElement("style");
  s.id = "pixoro-comment-style";
  s.textContent = `
    /* ✅ INSTANT da - Animation Illa da - Mella Varathu da */
    #commentModal{position:fixed!important;inset:0!important;background:rgba(0,0,0,.65)!important;display:none;align-items:flex-end!important;justify-content:center!important;z-index:9999!important;animation:none!important;transition:none!important;}
    #commentModal > div{position:absolute!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;background:#121212!important;border-radius:22px 22px 0 0!important;overflow:hidden!important;width:100%!important;max-height:88vh!important;display:flex!important;flex-direction:column!important;animation:none!important;transition:none!important;transform:none!important;}
    #commentModal > div:before{content:"";height:4px;background:linear-gradient(90deg,#FF2D95,#FF5E8A,#C86BFF);display:block;flex-shrink:0;}
    #commentModal .pixoro-c-emoji-row{display:flex;gap:18px;overflow-x:auto;padding:12px 16px;border-top:1px solid #222;scrollbar-width:none;}
    #commentModal .pixoro-c-emoji-row::-webkit-scrollbar{display:none;}
    #commentModal .pixoro-c-emoji-row button{background:none;border:none;font-size:26px;cursor:pointer;flex-shrink:0;}
    #commentModal .pixoro-c-emoji-row button:active{transform:scale(1.4);}
    #commentInput{background:#1a1a1a!important;color:#fff!important;border:1.5px solid #333!important;flex:1!important;min-width:0!important;}
    #commentInput::placeholder{color:#888!important;}
    #commentInput:focus{border-color:#FF2D95!important;box-shadow:0 0 0 2px rgba(255,45,149,.25)!important;outline:none!important;}
    /* ✅ POST BUTTON AH MARAICHITEN da */
    .pixoro-c-send-btn{display:none!important;}
    .pixoro-c-empty{padding:36px 20px;text-align:center;}
    .pixoro-c-empty-heart{font-size:42px;animation:pixoroHeartBeat 1.2s infinite;}
    @keyframes pixoroHeartBeat{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
    .pixoro-c-optimistic{opacity:.7;}
    .pixoro-c-icon-btn{background:none!important;border:none!important;cursor:pointer!important;padding:6px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;}
    .pixoro-c-icon-btn:active{transform:scale(1.2);}
    .pixoro-c-icon-btn.active svg{stroke:#FF2D95!important;}
    /* ✅ SEND ARROW BUTTON da */
    .pixoro-c-send-arrow{background:rgba(255,45,149,.15)!important;border:none!important;width:40px!important;height:40px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;flex-shrink:0!important;}
    .pixoro-c-send-arrow:active{transform:scale(1.15);background:rgba(255,45,149,.3)!important;}
  `;
  document.head.appendChild(s);
}

function pixoroCommentEmojiRow(){
  pixoroCommentCSS();
  const modal = document.getElementById("commentModal");
  if(!modal || modal.querySelector(".pixoro-c-emoji-row")) return;
  const input = document.getElementById("commentInput");
  if(!input) return;
  const row = document.createElement("div");
  row.className = "pixoro-c-emoji-row";
  row.innerHTML = PIXORO_COMMENT_EMOJIS.map(e=>`<button type="button" data-emoji="${e}">${e}</button>`).join("");
  row.querySelectorAll("[data-emoji]").forEach(b=>{
    b.onclick = ()=>{ input.value += b.dataset.emoji; input.focus(); };
  });
  input.parentElement?.before(row);
  modal.querySelectorAll("button").forEach(b=>{
    if(/post|send/i.test(b.textContent||"")) b.classList.add("pixoro-c-send-btn");
  });
}

// ✅ Type Box Pakkathula - [Image] [Type] [Emoji] [GIF] [Sticker] [Send Arrow ➤] da
function pixoroCommentIcons(){
  const modal = document.getElementById("commentModal");
  const input = document.getElementById("commentInput");
  if(!modal || !input || modal.querySelector(".pixoro-c-send-arrow")) return;
  const wrap = input.parentElement;
  if(!wrap) return;
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "4px";

  const emojiBtn = document.createElement("button");
  emojiBtn.type = "button"; emojiBtn.className = "pixoro-c-icon-btn"; emojiBtn.innerHTML = PIXORO_ICON_EMOJI;
  emojiBtn.onclick = ()=>{
    const row = modal.querySelector(".pixoro-c-emoji-row");
    if(row){ row.style.display = row.style.display === "none" ? "flex" : "none"; emojiBtn.classList.toggle("active"); }
    input.focus();
  };

  const gifBtn = document.createElement("button");
  gifBtn.type = "button"; gifBtn.className = "pixoro-c-icon-btn"; gifBtn.innerHTML = PIXORO_ICON_GIF;
  gifBtn.onclick = ()=>{ input.value += " [GIF] "; input.focus(); };

  const stickerBtn = document.createElement("button");
  stickerBtn.type = "button"; stickerBtn.className = "pixoro-c-icon-btn"; stickerBtn.innerHTML = PIXORO_ICON_STICKER;
  stickerBtn.onclick = ()=>{
    const row = modal.querySelector(".pixoro-c-emoji-row");
    if(row){ row.style.display = "flex"; }
    input.focus();
  };

  // ✅ SEND ARROW da - Post ku Badhila da
  const sendArrow = document.createElement("button");
  sendArrow.type = "button"; sendArrow.className = "pixoro-c-send-arrow"; sendArrow.innerHTML = PIXORO_ICON_SEND;
  sendArrow.onclick = ()=> addComment();

  // Pazhaya Post button ah Maraichidu da
  modal.querySelectorAll("button").forEach(b=>{
    if(/post|send/i.test(b.textContent||"")) b.classList.add("pixoro-c-send-btn");
  });

  wrap.append(emojiBtn, gifBtn, stickerBtn, sendArrow);
}

function openComment(id){
  window.CURRENT_COMMENT_POST = id;
  pixoroCommentEmojiRow();
  pixoroCommentIcons();
  let m = document.getElementById('commentModal');
  // ✅ INSTANT da - Thotta Odane Varum da - Delay Illa da
  if(m) m.style.display = 'flex';
  loadComments(id);
}
function closeComment(){
  let m = document.getElementById('commentModal');
  if(m) m.style.display = 'none';
}
window.openComment = openComment;
window.closeComment = closeComment;

// HTML Injection block pannu da - <script> potta kooda work aagaathu da
function escHtml(t){
  return String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function pixoroCommentRow(c, postId, isOptimistic){
  let isMine = window.ME_ID && String(c.user_id) === String(window.ME_ID);
  let delBtn = isMine && !isOptimistic ? `<span onclick="deleteComment('${c.id}', '${postId}')" style="color:#888;font-size:11px;cursor:pointer;margin-left:8px">Delete</span>` : '';
  return `<div class="pixoro-c-item ${isOptimistic?'pixoro-c-optimistic':''}" data-temp="${c._temp||''}" style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #222">
    <img src="${escHtml(window.pixoroGetAvatar ? window.pixoroGetAvatar(c) : (c.avatar_url||''))}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;background:#222;border:1.5px solid #FF2D95;flex-shrink:0" onerror="this.src='https://ui-avatars.com/api/?name=U&background=222&color=fff'">
    <div style="flex:1"><b style="color:#fff">@${escHtml(String(c.username||'user').replace('@',''))}</b> <span style="color:#ddd">${escHtml(c.text||c.content||'')}</span><div style="color:#888;font-size:12px;margin-top:4px">Reply &nbsp; Like ${delBtn} ${isOptimistic?'<span style="color:#FF2D95">• Sending...</span>':''}</div></div>
    <span style="color:#fff;font-size:18px;cursor:pointer">♡</span>
  </div>`;
}

async function loadComments(postId){
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
    let {data} = await s.from('comments').select('*').eq('post_id',postId).order('created_at',{ascending:true});
    let box = document.getElementById('commentList'); if(!box) return;
    let optimistic = [...box.querySelectorAll('.pixoro-c-optimistic')].map(el=>el.outerHTML).join('');
    box.innerHTML = (data||[]).map(c=>pixoroCommentRow(c, postId, false)).join('');
    if(optimistic) box.innerHTML += optimistic;
    if(!box.innerHTML.trim()) box.innerHTML = '<div class="pixoro-c-empty"><div class="pixoro-c-empty-heart">❤️</div><div style="color:#fff;font-size:22px;font-weight:700;margin-top:10px">No comments yet</div><div style="color:#888;font-size:14px;margin-top:6px">Start the conversation.</div></div>';
    let cnt = (data||[]).length;
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = cnt;
  }catch(e){ console.log('Comment Load Fail da:', e.message); }
}

async function addComment(){
  let inp = document.getElementById('commentInput');
  let txt = inp.value.trim(); if(!txt) return;
  if(!window.CURRENT_COMMENT_POST) return;
  let postId = window.CURRENT_COMMENT_POST;
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){
    let {data:{session}} = await s.auth.getSession();
    if(!session){ location.href='./login.html'; return; }
    window.ME_ID = session.user.id;
  }

  // ✅ OPTIMISTIC DA - Udane Screen la Varum da
  let tempId = 'temp_' + Date.now();
  let box = document.getElementById('commentList');
  if(box){
    if(box.querySelector('.pixoro-c-empty')) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', pixoroCommentRow({ _temp: tempId, user_id: window.ME_ID, username: (window.ME_RAW||'user').replace('@',''), avatar_url: window.ME_AVATAR || '', text: txt }, postId, true));
    box.scrollTop = box.scrollHeight;
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = Number(cc.innerText||0) + 1;
  }
  inp.value = '';
  inp.disabled = true;

  try{
    let {error} = await s.from('comments').insert({ post_id: postId, user_id: window.ME_ID, username: (window.ME_RAW||'user').replace('@',''), avatar_url: window.ME_AVATAR || '', text: txt });
    if(error) throw error;
    await loadComments(postId);
  }catch(e){
    console.log('❌ COMMENT DB FAIL DA:', e.message);
    let tempEl = box?.querySelector(`[data-temp="${tempId}"]`);
    if(tempEl) tempEl.remove();
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = Math.max(0, Number(cc.innerText||1) - 1);
    if(box && !box.innerHTML.trim()) loadComments(postId);
    if(window.showToast) showToast('Comment Fail da - Thirumba try pannu da');
  }
  inp.disabled = false;
  inp.focus();
}

// ✅ Own Comment ah Delete panna - Long press maari da
async function deleteComment(commentId, postId){
  if(!confirm('Delete pannatta da?')) return;
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  await s.from('comments').delete().eq('id',commentId).eq('user_id',window.ME_ID);
  loadComments(postId);
}

document.addEventListener('DOMContentLoaded', ()=>{
  pixoroCommentEmojiRow();
  pixoroCommentIcons();
  let inp = document.getElementById('commentInput');
  if(inp) inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addComment(); });
});

window.addComment = addComment;
window.loadComments = loadComments;
window.deleteComment = deleteComment;
window.escHtml = escHtml;
