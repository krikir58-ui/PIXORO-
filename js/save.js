// ===== PIXORO SAVE - v1014 - THANI FILE DA =====
// RULE: Save panna -> Server la Save + Icon Gold aagum da
//       Thirumba thotta -> Unsave aagum da

async function pixoroToggleSave(postId, btn){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){
    let {data:{session}} = await s.auth.getSession();
    if(session) window.ME_ID = session.user.id;
    else { location.href='./login.html'; return; }
  }
  try{
    let {data:ex} = await s.from('saves').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    let saved = false;
    if(ex){ await s.from('saves').delete().eq('id',ex.id); saved = false; }
    else { await s.from('saves').insert({post_id:postId, user_id:window.ME_ID}); saved = true; }

    // ✅ BUTTON UI - Gold / White maathu da
    if(btn){
      btn.classList.toggle('saved', saved);
      let svg = btn.querySelector('svg');
      if(svg){
        if(saved){ svg.style.fill='#FFD700'; svg.style.stroke='#FFD700'; }
        else { svg.style.fill='none'; svg.style.stroke='#fff'; }
      }
      // Chinna bounce - Save pannita feel varanum da
      if(saved){ btn.style.transform='scale(1.2)'; setTimeout(()=>btn.style.transform='scale(1)',150); }
    }

    if(window.showToast) window.showToast(saved ? 'Saved la Pochu da' : 'Saved la irunthu Eduthuten da');
    return saved;
  }catch(e){ return false; }
}

// ✅ PAGE LOAD AANA - Already Save pannita Post ah Gold ah kaatu da
async function loadSaveState(postId, btn){
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s || !window.ME_ID || !btn) return;
    let {data:ex} = await s.from('saves').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    if(ex){
      btn.classList.add('saved');
      let svg = btn.querySelector('svg');
      if(svg){ svg.style.fill='#FFD700'; svg.style.stroke='#FFD700'; }
    }
  }catch(e){}
}

// ✅ SAVED PAGE KU - Enna Save pannirukken nu edukka da
async function getMySavedPosts(){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return [];
  if(!window.ME_ID){
    let {data:{session}} = await s.auth.getSession();
    if(!session) return [];
    window.ME_ID = session.user.id;
  }
  let {data} = await s.from('saves').select('post_id').eq('user_id',window.ME_ID).order('created_at',{ascending:false});
  return (data||[]).map(r=>r.post_id);
}

window.pixoroToggleSave = pixoroToggleSave;
window.pixoroSave = pixoroToggleSave;
window.loadSaveState = loadSaveState;
window.getMySavedPosts = getMySavedPosts;
