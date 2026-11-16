// ===== PIXORO SAVE - v1013 - THANI FILE DA =====
async function pixoroToggleSave(postId, btn){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; else return; }
  try{
    let {data:ex} = await s.from('saves').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    let saved = false;
    if(ex){ await s.from('saves').delete().eq('id',ex.id); saved = false; }
    else { await s.from('saves').insert({post_id:postId, user_id:window.ME_ID}); saved = true; }
    if(btn) btn.classList.toggle('saved', saved);
    if(window.showToast) window.showToast(saved ? 'Saved la Pochu da' : 'Saved la irunthu Eduthuten da');
    return saved;
  }catch(e){ return false; }
}
window.pixoroToggleSave = pixoroToggleSave; window.pixoroSave = pixoroToggleSave;
