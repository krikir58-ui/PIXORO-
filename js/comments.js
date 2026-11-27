// ===== PIXORO COMMENT - THANI FILE DA =====
// RULE: Comment panna -> Server la Save + Count Update aagum da
//       Save = Server la mattum thaan da - LocalStorage Illa da
// STYLE: Instagram Screenshot + Pixoro Pink-Purple da

const PIXORO_COMMENT_EMOJIS = ["❤️","🙌","🔥","👏","😢","😍","😮","😂"];

function pixoroCommentCSS(){
  if(document.getElementById("pixoro-comment-style")) return;
  const s = document.createElement("style");
  s.id = "pixoro-comment-style";
  s.textContent = `
    #commentModal{background:rgba(0,0,0,.65)!important;align-items:flex-end!important;}
    #commentModal > div{background:#121212!important;border-radius:22px 22px 0 0!important;overflow:hidden!important;position:relative!important;width:100%!important;max-height:88vh!important;display:flex!important;flex-direction:column!important;}
    #commentModal > div:before{content:"";height:4px;background:linear-gradient(90deg,#FF2D95,#FF5E8A,#C86BFF);display:block;flex-shrink:0;}
    #commentModal .pixoro-c-emoji-row{display:flex;gap:18px;overflow-x:auto;padding:12px 16px;border-top:1px solid #222;scrollbar-width:none;}
    #commentModal .pixoro-c-emoji-row::-webkit-scrollbar{display:none;}
    #commentModal .pixoro-c-emoji-row button{background:none;border:none;font-size:26px;cursor:pointer;flex-shrink:0;}
    #commentModal .pixoro-c-emoji-row button:active{transform:scale(1.4);}
    #commentInput{border:1.5px solid #333!important;}
    #commentInput:focus{border-color:#FF2D95!important;box-shadow:0 0 0 2px rgba(255,45,149,.25)!important;outline:none!important;}
    .pixoro-c-send-btn{background:linear-gradient(90deg,#FF2D95,#C86BFF)!important;color:#fff!important;border:none!important;font-weight:800!important;padding:10px 16px!important;border-radius:999px!important;cursor:pointer!important;}
    .pixoro-c-empty{padding:36px 20px;text-align:center;}
    .pixoro-c-empty-heart{font-size:42px;animation:pixoroHeartBeat 1.2s infinite;}
    @keyframes pixoroHeartBeat{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}
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
  // Send button ku Pixoro colour
  modal.querySelectorAll("button").forEach(b=>{
    if(/post|send/i.test(b.textContent||"")) b.classList.add("pixoro-c-send-btn");
  });
}

function openComment(id){
  window.CURRENT_COMMENT_POST = id;
  pixoroCommentEmojiRow();
  let m = document.getElementById('commentModal');
  if(m) m.style.display = 'flex';
  loadComments(id);
  setTimeout(()=>{ let i=document.getElementById('commentInput'); if(i) i.focus(); }, 100);
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

async function loadComments(postId){
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
    let {data} = await s.from('comments').select('*').eq('post_id',postId).order('created_at',{ascending:true});
    let box = document.getElementById('commentList'); if(!box) return;

    box.innerHTML = (data||[]).map(c=>{
      let isMine = window.ME_ID && String(c.user_id) === String(window.ME_ID);
      // ✅ FIX - ID ku Quote Potten da - UUID ku Quote Illana Error da!
      let delBtn = isMine ? `<span onclick="deleteComment('${c.id}', '${postId}')" style="color:#888;font-size:11px;cursor:pointer;margin-left:8px">Delete</span>` : '';
      return `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #222">
        <img src="${escHtml(window.pixoroGetAvatar ? window.pixoroGetAvatar(c) : (c.avatar_url||''))}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;background:#222;border:1.5px solid #FF2D95;flex-shrink:0" onerror="this.src='https://ui-avatars.com/api/?name=U&background=222&color=fff'">
        <div style="flex:1"><b style="color:#fff">@${escHtml(String(c.username||'user').replace('@',''))}</b> <span style="color:#ddd">${escHtml(c.text||c.content||'')}</span><div style="color:#888;font-size:12px;margin-top:4px">Reply &nbsp; Like ${delBtn}</div></div>
        <span style="color:#fff;font-size:18px;cursor:pointer">♡</span>
      </div>`;
    }).join('') || '<div class="pixoro-c-empty"><div class="pixoro-c-empty-heart">❤️</div><div style="color:#fff;font-size:22px;font-weight:700;margin-top:10px">No comments yet</div><div style="color:#888;font-size:14px;margin-top:6px">Start the conversation.</div></div>';

    let cnt = (data||[]).length;
    let cc = document.querySelector(`[data-comment-count="${postId}"]`);
    if(cc) cc.innerText = cnt;
  }catch(e){ console.log('Comment Load Fail da:', e.message); }
}

async function addComment(){
  let inp = document.getElementById('commentInput');
  let txt = inp.value.trim(); if(!txt) return;
  if(!window.CURRENT_COMMENT_POST) return;

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){
    let {data:{session}} = await s.auth.getSession();
    if(!session){ location.href='./login.html'; return; }
    window.ME_ID = session.user.id;
  }
  inp.disabled = true;
  try{
    let {error} = await s.from('comments').insert({
      post_id: window.CURRENT_COMMENT_POST,
      user_id: window.ME_ID,
      username: (window.ME_RAW||'user').replace('@',''),
      avatar_url: window.ME_AVATAR || '',
      text: txt
    });
    if(error) throw error;
    inp.value = '';
    await loadComments(window.CURRENT_COMMENT_POST);
  }catch(e){
    console.log('❌ COMMENT DB FAIL DA:', e.message);
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
  let inp = document.getElementById('commentInput');
  if(inp) inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addComment(); });
});

window.addComment = addComment;
window.loadComments = loadComments;
window.deleteComment = deleteComment;
window.escHtml = escHtml;
