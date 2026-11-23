// ===== PIXORO COMMENT - THANI FILE DA =====
// RULE: Comment panna -> Server la Save + Count Update aagum da
//       Save = Server la mattum thaan da - LocalStorage Illa da

function openComment(id){
  window.CURRENT_COMMENT_POST = id;
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
      return `<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #222">
        <img src="${escHtml(window.pixoroGetAvatar ? window.pixoroGetAvatar(c) : (c.avatar_url||''))}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;background:#222" onerror="this.src='https://ui-avatars.com/api/?name=U&background=222&color=fff'">
        <div style="flex:1"><b>@${escHtml(String(c.username||'user').replace('@',''))}</b> <span>${escHtml(c.text||c.content||'')}</span><div>${delBtn}</div></div>
      </div>`;
    }).join('') || '<p style="color:#888;text-align:center;padding:20px">No comments yet da - First comment nee podu da!</p>';

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
  let inp = document.getElementById('commentInput');
  if(inp) inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addComment(); });
});

window.addComment = addComment;
window.loadComments = loadComments;
window.deleteComment = deleteComment;
window.escHtml = escHtml;
