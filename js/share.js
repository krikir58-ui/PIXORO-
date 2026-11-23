// ===== PIXORO SHARE - THANI FILE DA =====
// RULE: Share panna -> Share Sheet / Link Copy -> Appuram thaan Server la Count Save da
//       Cancel panna - Count Illa da
//       Save = Server la mattum thaan da - LocalStorage Illa da

async function sharePost(id){
  let u = location.origin + '/index.html?id=' + id;

  // ✅ 1. MUDHAL LA SHARE PANNU DA - Count Appuram thaan da
  let shared = false;

  if(navigator.share){
    try{
      await navigator.share({title:'Pixoro - Paaru da!', text:'Pixoro la Intha Post ah Paaru da!', url:u});
      shared = true;
    }catch(e){
      // User Cancel pannita - Count Panna Koodathu da - Veliya Po da
      if(e.name === 'AbortError') return;
      shared = false;
    }
  } else {
    // ✅ Share Sheet illa na - Link Copy pannu da - Copy aana thaan Shared da
    try{
      await navigator.clipboard.writeText(u);
      showToast('Link Copy Aachu da - Friend ku Anuppu da!');
      shared = true;
    }catch(e){
      let tmp = document.createElement('input');
      tmp.value = u; document.body.appendChild(tmp); tmp.select();
      document.execCommand('copy'); tmp.remove();
      showToast('Link Copy Aachu da!');
      shared = true;
    }
  }

  if(!shared) return;

  // ✅ 2. Share Pannathum thaan Server la Count Save pannu da
  try{
    let s = window.getSupa ? window.getSupa() : window.supa;
    if(s){
      if(!window.ME_ID){
        let {data:{session}} = await s.auth.getSession();
        if(session) window.ME_ID = session.user.id;
      }
      // ✅ FIX - user_id null ah Anuppa Koodathu da - ME_ID iruntha mattum Anuppu da
      let payload = { post_id: id };
      if(window.ME_ID) payload.user_id = window.ME_ID;
      let r = await s.from('shares').insert(payload);
      // ✅ FIX - Already Share Panniruntha - Duplicate Error 23505 Varum da - Athu Fail Illa da - Count ah ve Edu da!
      if(r.error && String(r.error.code) !== '23505') throw r.error;
      // ✅ Real Count ah Server la irunthu Edu da - Phone la +1 Panna Koodathu da
      let {count} = await s.from('shares').select('*',{count:'exact',head:true}).eq('post_id',id);
      let sc = document.querySelector(`[data-share-count="${id}"]`);
      if(sc) sc.innerText = count || 0;
      // ✅ FEED_COUNTS la yum Update pannu da - Refresh panna kooda Count nikkanum da
      if(window.FEED_COUNTS){
        window.FEED_COUNTS[String(id)] = window.FEED_COUNTS[String(id)] || {like:0,comment:0,share:0};
        window.FEED_COUNTS[String(id)].share = count || 0;
      }
    }
  }catch(e){ console.log('Share DB Fail da:', e.message); }
}
window.sharePost = sharePost;

// ✅ TOAST - Intha file la thaan irukku da
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
