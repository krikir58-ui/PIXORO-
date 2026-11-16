// ===== PIXORO AVATAR - v1014 - 1 PHOTO = ELLA PAGE KUM - INSTAGRAM SECRET DA =====
window.PIXORO_AVATAR_MAP = window.PIXORO_AVATAR_MAP || {};

async function pixoroLoadAvatars(){
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return;
  try{
    // ✅ FIX 1 DA - avatar_url mattum thaan da - profile_pic/photo_url vendaam da
    let r = await s.from('profiles').select('id,avatar_url').limit(500);
    (r.data||[]).forEach(p=>{
      let url = String(p.avatar_url || '').trim();
      if(url) window.PIXORO_AVATAR_MAP[String(p.id)] = url;
    });
    // ✅ Circle ellam update pannidu da
    document.querySelectorAll('[data-avatar-user]').forEach(img=>{
      let u = img.dataset.avatarUser;
      let url = window.PIXORO_AVATAR_MAP[String(u)];
      if(url) img.src = url;
    });
    // ✅ Bottom nav Profile photo
    let nav = document.getElementById('navPfp');
    if(nav && window.ME_ID && window.PIXORO_AVATAR_MAP[String(window.ME_ID)]) nav.src = window.PIXORO_AVATAR_MAP[String(window.ME_ID)];
    // ✅ My Story photo - Ithu thaan mukkiyam da
    let myStory = document.getElementById('myStoryImg');
    if(myStory && window.ME_ID && window.PIXORO_AVATAR_MAP[String(window.ME_ID)]) myStory.src = window.PIXORO_AVATAR_MAP[String(window.ME_ID)];
  }catch(e){ console.log('avatar error', e); }
}
window.pixoroLoadAvatars = pixoroLoadAvatars;

window.pixoroGetAvatar = function(p){
  // ✅ FIX 2 DA - Fake ui-avatars photo vendaam da - Empty na '' thaan da
  if(!p) return '';
  if(typeof p === 'string'){
    return window.PIXORO_AVATAR_MAP[String(p)] || '';
  }
  // ✅ FIX 3 DA - ID vachu mattum thaan da - username vendaam da
  let url = p.avatar_url || window.PIXORO_AVATAR_MAP[String(p.user_id || p.id || '')] || '';
  return String(url || '').trim();
};

// ✅ En photo va thaniya edukka - Story / Profile ku da
window.pixoroGetMyPfp = async function(){
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return '';
  let {data:{user}} = await s.auth.getUser();
  if(!user) return '';
  let {data} = await s.from('profiles').select('avatar_url').eq('id', user.id).single();
  let photo = String(data?.avatar_url || '').trim();
  if(photo){ window.PIXORO_AVATAR_MAP[String(user.id)] = photo; window.MY_PFP = photo; }
  return photo;
};
