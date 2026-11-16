// ===== PIXORO AVATAR - v1013 - CIRCLE LA REAL PHOTO DA =====
window.PIXORO_AVATAR_MAP = window.PIXORO_AVATAR_MAP || {};
async function pixoroLoadAvatars(){
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  try{
    let r = await s.from('profiles').select('id,username,avatar_url,profile_pic,photo_url').limit(500);
    (r.data||[]).forEach(p=>{
      let url = p.avatar_url || p.profile_pic || p.photo_url || '';
      if(url){
        window.PIXORO_AVATAR_MAP[String(p.id)] = url;
        window.PIXORO_AVATAR_MAP[String(p.username||'').toLowerCase()] = url;
      }
    });
    // ✅ Circle ellam update pannidu da
    document.querySelectorAll('[data-avatar-user]').forEach(img=>{
      let u = img.dataset.avatarUser; let url = window.PIXORO_AVATAR_MAP[u] || window.PIXORO_AVATAR_MAP[String(u).toLowerCase()];
      if(url) img.src = url;
    });
    // ✅ Bottom nav Profile photo
    let nav = document.getElementById('navPfp');
    if(nav && window.ME_ID && window.PIXORO_AVATAR_MAP[String(window.ME_ID)]) nav.src = window.PIXORO_AVATAR_MAP[String(window.ME_ID)];
  }catch(e){}
}
window.pixoroLoadAvatars = pixoroLoadAvatars;
window.pixoroGetAvatar = function(p){
  if(!p) return 'https://ui-avatars.com/api/?name=P&background=ff5ea8&color=fff&size=200&bold=true';
  if(typeof p === 'string'){
    let u = window.PIXORO_AVATAR_MAP[p] || window.PIXORO_AVATAR_MAP[String(p).toLowerCase()];
    if(u) return u;
    return 'https://ui-avatars.com/api/?name='+String(p).charAt(0).toUpperCase()+'&background=ff5ea8&color=fff&size=200&bold=true';
  }
  let url = p.avatar_url || p.profile_pic || p.photo_url || window.PIXORO_AVATAR_MAP[String(p.user_id||p.id||'')] || window.PIXORO_AVATAR_MAP[String(p.username||'').toLowerCase()] || '';
  if(url) return url;
  let n = (p.username||'P').charAt(0).toUpperCase();
  return 'https://ui-avatars.com/api/?name='+n+'&background=ff5ea8&color=fff&size=200&bold=true';
};
