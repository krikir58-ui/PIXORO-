// ===== PIXORO SHARE - v1014 - THANI FILE DA =====
// RULE: Share panna -> Server la Count Save + Link Copy / Share Sheet varum da

async function sharePost(id){
  let u = location.origin + '/index.html?id=' + id;

  // ✅ 1. SERVER LA COUNT SAVE PANNU DA
  try{
    let s = window.getSupa ? window.getSupa() : window.supa;
    if(s){
      if(!window.ME_ID){
        let {data:{session}} = await s.auth.getSession();
        if(session) window.ME_ID = session.user.id;
      }
      await s.from('shares').insert({ post_id: id, user_id: window.ME_ID || null });
      // Count update pannu da
      let {count} = await s.from('shares').select('*',{count:'exact',head:true}).eq('post_id',id);
      let sc = document.querySelector(`[data-share-count="${id}"]`);
      if(sc) sc.innerText = count || 0;
    }
  }catch(e){}

  // ✅ 2. SHARE SHEET - Mobile la WhatsApp / Insta ellam varum da
  if(navigator.share){
    try{ await navigator.share({title:'Pixoro - Paaru da!', text:'Pixoro la Intha Post ah Paaru da!', url:u}); return; }catch(e){
      // User Cancel pannita - Onnum panna vendam da
      if(e.name === 'AbortError') return;
    }
  }

  // ✅ 3. Share Sheet illa na - Link Copy pannidu da
  try{
    await navigator.clipboard.writeText(u);
    showToast('Link Copy Aachu da - Friend ku Anuppu da!');
  }catch(e){
    // Clipboard block aana - Prompt la kaatu da
    let tmp = document.createElement('input');
    tmp.value = u; document.body.appendChild(tmp); tmp.select();
    document.execCommand('copy'); tmp.remove();
    showToast('Link Copy Aachu da!');
  }
}
window.sharePost = sharePost;

// ✅ TOAST - Intha file la thaan irukku da - Vera file la iruntha ithu thaan use aagum da
function showToast(m){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div'); t.id='toast';
    t.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#fff;color:#000;padding:10px 16px;border-radius:999px;font-size:13px;font-weight:700;z-index:6000;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5)';
    document.body.appendChild(t);
  }
  t.innerText = m; t.style.display = 'block';
  clearTimeout(t._h); t._h = setTimeout(()=> t.style.display = 'none', 2000);
}
window.showToast = showToast;
