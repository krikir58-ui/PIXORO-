// ===== PIXORO AVATAR - v1015 - FIXED DA =====
window.PIXORO_AVATAR_MAP = window.PIXORO_AVATAR_MAP || {};

async function pixoroLoadAvatars(){
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return;
  try{
    let r = await s.from('profiles').select('id,avatar_url').limit(500);
    (r.data||[]).forEach(p=>{
      let url = String(p.avatar_url || '').trim();
      if(url) window.PIXORO_AVATAR_MAP[String(p.id)] = url;
    });

    // ✅ FIX DA - ME_ID illa na Auth la irunthu Edu da
    let myId = window.ME_ID;
    if(!myId){
      let {data:{user}} = await s.auth.getUser();
      if(user) { myId = user.id; window.ME_ID = myId; }
    }
    let myPhoto = myId ? window.PIXORO_AVATAR_MAP[String(myId)] : '';

    // ✅ FIX DA - En Photo illa na, Supabase la Thaniya Kelu da
    if(!myPhoto && myId){
      let {data} = await s.from('profiles').select('avatar_url').eq('id', myId).single();
      myPhoto = String(data?.avatar_url || '').trim();
      if(myPhoto) window.PIXORO_AVATAR_MAP[String(myId)] = myPhoto;
    }

    if(myPhoto){
      window.MY_PFP = myPhoto;
      // Ella Circle um Update pannu da
      document.querySelectorAll('[data-avatar-user]').forEach(img=>{
        if(String(img.dataset.avatarUser) === String(myId)) img.src = myPhoto;
      });
      let nav = document.getElementById('navPfp');
      if(nav) nav.src = myPhoto;
      // ✅ My Story - Ithu thaan Mukkiyam da
      let myStory = document.getElementById('myStoryImg');
      if(myStory){
        myStory.src = myPhoto;
        myStory.style.display = 'block';
        // G letter iruntha Maraichidu da
        let parent = myStory.parentElement;
        if(parent) parent.classList.remove('no-photo');
      }
    }
  }catch(e){ console.log('avatar error', e); }
}

window.pixoroGetAvatar = function(p){
  if(!p) return window.MY_PFP || '';
  if(typeof p === 'string') return window.PIXORO_AVATAR_MAP[String(p)] || window.MY_PFP || '';
  return String(p.avatar_url || window.PIXORO_AVATAR_MAP[String(p.user_id || p.id || '')] || window.MY_PFP || '').trim();
};

// ✅ FIX DA - Function ah Thanava Koopdu da
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(pixoroLoadAvatars, 500);
  setTimeout(pixoroLoadAvatars, 2000);
});
