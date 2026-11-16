// ===== PIXORO COMMENT - v1013 - THANI FILE DA =====
function openComment(id){ window.CURRENT_COMMENT_POST = id; let m = document.getElementById('commentModal'); if(m) m.style.display = 'flex'; loadComments(id); }
function closeComment(){ let m = document.getElementById('commentModal'); if(m) m.style.display = 'none'; }
window.openComment = openComment; window.closeComment = closeComment;
async function loadComments(postId){
  try{
    let s = window.getSupa ? window.getSupa() : window.supa;
    let {data} = await s.from('comments').select('*').eq('post_id',postId).order('created_at',{ascending:true});
    let box = document.getElementById('commentList'); if(!box) return;
    box.innerHTML = (data||[]).map(c=>`<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #222"><img src="${window.pixoroGetAvatar(c)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover"><div><b>@${String(c.username||'user').replace('@','')}</b> <span>${c.text||c.content||''}</span></div></div>`).join('') || '<p style="color:#888">No comments yet da</p>';
  }catch(e){}
}
async function addComment(){
  let inp = document.getElementById('commentInput'); let txt = inp.value.trim(); if(!txt) return;
  let s = window.getSupa ? window.getSupa() : window.supa;
  await s.from('comments').insert({post_id: window.CURRENT_COMMENT_POST, user_id: window.ME_ID, username: window.ME_RAW, text: txt});
  inp.value = ''; loadComments(window.CURRENT_COMMENT_POST);
}
window.addComment = addComment; window.loadComments = loadComments;
