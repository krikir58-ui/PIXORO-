// ===== PIXORO SAVE - THANI FILE DA - WHITE ONLY DA =====
// RULE: Save panna -> Server la Save + Icon White aagum da - Gold / Yellow KIDAIYAATHU da
//       Thirumba thotta -> Unsave aagum da
//       UI Munnadi - DB Appuram da - Speed da!
//       Alert / Toast KIDAIYAATHU da - Silent ah Save aagum da

async function pixoroToggleSave(postId, btn){
  // ✅ SPEED - DB ku munnadiye Odane White aakidu da - Wait panna koodathu da
  let willSave = btn ? !btn.classList.contains('saved') : true;
  if(btn){
    btn.classList.toggle('saved', willSave);
    let svg = btn.querySelector('svg');
    if(svg){
      // ✅ WHITE ONLY DA - Save panna White Fill - Illana White Outline da
      if(willSave){ svg.style.fill='#fff'; svg.style.stroke='#fff'; }
      else { svg.style.fill='none'; svg.style.stroke='#fff'; }
    }
    if(willSave){ btn.style.transform='scale(1.2)'; setTimeout(()=>btn.style.transform='scale(1)',150); }
  }
  if(window.FEED_SAVES){ willSave ? window.FEED_SAVES.add(String(postId)) : window.FEED_SAVES.delete(String(postId)); }

  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  if(!window.ME_ID){
    let {data:{session}} = await s.auth.getSession();
    if(session) window.ME_ID = session.user.id;
    else {
      // ✅ FIX - Login Illana UI ah Pazhaya Nilamaikku Kondu Va da - White ah Vachitu Poga Koodathu da
      if(btn) btn.classList.toggle('saved', !willSave);
      if(window.FEED_SAVES){ willSave ? window.FEED_SAVES.delete(String(postId)) : window.FEED_SAVES.add(String(postId)); }
      location.href='./login.html'; return;
    }
  }
  try{
    if(willSave){
      let r = await s.from('saves').insert({post_id:postId, user_id:window.ME_ID});
      // ✅ FIX - Already Save Panniruntha - Duplicate Error 23505 Varum da - Athu Fail Illa da - White ah ve Vachu da!
      if(r.error && String(r.error.code) !== '23505') throw r.error;
    }
    else {
      let r = await s.from('saves').delete().eq('post_id',postId).eq('user_id',window.ME_ID);
      if(r.error) throw r.error;
    }
    return willSave;
  }catch(e){
    // DB fail aana mattum UI ah thirumba maathidu da
    if(btn){
      btn.classList.toggle('saved', !willSave);
      let svg = btn.querySelector('svg');
      if(svg){
        if(!willSave){ svg.style.fill='#fff'; svg.style.stroke='#fff'; }
        else { svg.style.fill='none'; svg.style.stroke='#fff'; }
      }
    }
    if(window.FEED_SAVES){ willSave ? window.FEED_SAVES.delete(String(postId)) : window.FEED_SAVES.add(String(postId)); }
    return false;
  }
}

// ✅ PAGE LOAD AANA - Already Save pannita Post ah White ah kaatu da
async function loadSaveState(postId, btn){
  try{
    let s = window.getSupa ? window.getSupa() : window.supa; if(!s || !window.ME_ID || !btn) return;
    let {data:ex} = await s.from('saves').select('id').eq('post_id',postId).eq('user_id',window.ME_ID).maybeSingle();
    if(ex){
      btn.classList.add('saved');
      let svg = btn.querySelector('svg');
      if(svg){ svg.style.fill='#fff'; svg.style.stroke='#fff'; }
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
