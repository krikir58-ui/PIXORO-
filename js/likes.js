// ===== PIXORO LIKE - v1013 - THANI FILE DA =====
async function pixoroToggleLike(postId, btn){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return; }
  try{
    let {data:ex} = await s.from('likes').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    let liked = false;
    if(ex){ await s.from('likes').delete().eq('id',ex.id); liked = false; }
    else { await s.from('likes').insert({post_id:postId, user_id:window.ME_ID}); liked = true; }
    if(btn){
      btn.classList.toggle('liked', liked);
      let c = document.querySelector(`[data-like-count="${postId}"]`);
      if(c){ let cur = parseInt(c.innerText||'0')||0; c.innerText = liked ? cur+1 : Math.max(0,cur-1); }
    }
    return liked;
  }catch(e){ return false; }
}
window.pixoroToggleLike = pixoroToggleLike;
