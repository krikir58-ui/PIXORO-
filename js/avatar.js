// ===== PIXORO AVATAR - v1017 - FINAL CORRECT DA - Flicker Illa da =====
window.PIXORO_AVATAR_MAP = window.PIXORO_AVATAR_MAP || {};
let _AVATAR_RUNNING = false;
let _AVATAR_DONE = false;

// ✅ FIX v1017 - Photo va Preload Pannitu - Load Aana Appuram Mattum Maathu da - Flicker Varathu da
function pixoroSetImgSafe(img, url){
  if(!img || !url) return;
  if(img.src === url) return; // ✅ Already Same Photo na - Thodatha da - Ithu Thaan Flicker Fix da
  let pre = new Image();
  pre.onload = ()=>{ img.src = url; img.style.display = 'block'; };
  pre.onerror = ()=>{ /* Photo Load Agala na - G Appadiye Irukkattum da - Maathatha da */ };
  pre.src = url;
}

async function pixoroLoadAvatars(){
  if(_AVATAR_RUNNING) return; // ✅ Already Oduthu na - Marupadiyum Oda Vena da
  _AVATAR_RUNNING = true;
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s){ _AVATAR_RUNNING = false; return; }
  try{
    let r = await s.from('profiles').select('id,avatar_url,username').limit(500);
    (r.data||[]).forEach(p=>{
      let url = String(p.avatar_url || '').trim();
      if(url) window.PIXORO_AVATAR_MAP[String(p.id)] = url;
    });

    let myId = window.ME_ID;
    if(!myId){
      try{
        let {data:{user}} = await s.auth.getUser();
        if(user){ myId = user.id; window.ME_ID = myId; }
      }catch(e){}
    }
    if(!myId){
      try{
        let saved = JSON.parse(localStorage.getItem('pixoro_user') || localStorage.getItem('pixoro_profile') || 'null');
        if(saved?.id){ myId = saved.id; window.ME_ID = myId; }
      }catch(e){}
    }

    let myPhoto = myId ? window.PIXORO_AVATAR_MAP[String(myId)] : '';
    if(!myPhoto && myId){
      let {data} = await s.from('profiles').select('avatar_url').eq('id', myId).single();
      myPhoto = String(data?.avatar_url || '').trim();
      if(myPhoto) window.PIXORO_AVATAR_MAP[String(myId)] = myPhoto;
    }

    if(myPhoto){
      window.MY_PFP = myPhoto;

      // 1. data-avatar-user irukka Ellam
      document.querySelectorAll('[data-avatar-user]').forEach(img=>{
        let uid = String(img.dataset.avatarUser || '');
        if(window.PIXORO_AVATAR_MAP[uid]) pixoroSetImgSafe(img, window.PIXORO_AVATAR_MAP[uid]);
        else if(String(myId) === uid) pixoroSetImgSafe(img, myPhoto);
      });

      // 2. Ella avatar img yum
      document.querySelectorAll('img[data-user-id], img[data-uid]').forEach(img=>{
        let uid = String(img.dataset.userId || img.dataset.uid || '');
        if(window.PIXORO_AVATAR_MAP[uid]) pixoroSetImgSafe(img, window.PIXORO_AVATAR_MAP[uid]);
      });

      // 3. Reels PFP
      document.querySelectorAll('.reel-pfp-wrap img, .reelUserRow img, .rPfp img').forEach(img=>{
        let parent = img.closest('[data-owner], [data-user-id], .reelItem, .reel');
        let uid = parent?.dataset?.owner || parent?.dataset?.userId || '';
        if(uid && window.PIXORO_AVATAR_MAP[String(uid)]) pixoroSetImgSafe(img, window.PIXORO_AVATAR_MAP[String(uid)]);
      });

      // 4. Nav PFP
      document.querySelectorAll('#navPfp, .navPfp').forEach(nav=> pixoroSetImgSafe(nav, myPhoto));

      // 5. Profile Page PFP
      document.querySelectorAll('#profilePfp, #profileImg, .profilePfp').forEach(el=> pixoroSetImgSafe(el, myPhoto));

      // ✅ My Story - Flicker Fix da - Orey Thadava Mattum Maathu da
      let myStory = document.getElementById('myStoryImg');
      if(myStory && myStory.src !== myPhoto){
        // ✅ Image Load Aana Appuram Mattum Letter ah Maraichidu da - Illana G Varum da
        let pre = new Image();
        pre.onload = ()=>{
          myStory.src = myPhoto;
          myStory.style.display = 'block';
          let parent = myStory.parentElement;
          if(parent){ parent.classList.remove('no-photo'); parent.classList.add('has-photo'); }
          let letter = parent?.querySelector('.storyLetter, .avatarLetter, .avaLetterHome');
          if(letter) letter.style.display = 'none';
          _AVATAR_DONE = true;
        };
        pre.src = myPhoto;
      }
    }

    // Vera Users Avatar
    document.querySelectorAll('img[data-avatar-user]').forEach(img=>{
      let uid = String(img.dataset.avatarUser || '');
      if(window.PIXORO_AVATAR_MAP[uid]) pixoroSetImgSafe(img, window.PIXORO_AVATAR_MAP[uid]);
    });

  }catch(e){ console.log('avatar error', e); }
  _AVATAR_RUNNING = false;
}
window.pixoroLoadAvatars = pixoroLoadAvatars;

window.pixoroGetAvatar = function(p){
  if(!p) return window.MY_PFP || '';
  if(typeof p === 'string'){
    return window.PIXORO_AVATAR_MAP[String(p)] || window.MY_PFP || '';
  }
  let uid = String(p.user_id || p.id || p.owner || '');
  return String(
    p.avatar_url || p.avatar || p.profiles?.avatar_url ||
    window.PIXORO_AVATAR_MAP[uid] ||
    window.MY_PFP || ''
  ).trim();
};

// ✅ FIX v1017 - 3 Thadava Koopdatha da - Orey Thadava + Debounce da - Flicker Fix da
let _avatarTimer = null;
function pixoroAvatarOnce(){
  if(_AVATAR_DONE) return;
  clearTimeout(_avatarTimer);
  _avatarTimer = setTimeout(pixoroLoadAvatars, 600);
}
document.addEventListener('DOMContentLoaded', pixoroAvatarOnce);
window.addEventListener('pixoro-reels-rendered', pixoroAvatarOnce);
window.addEventListener('pixoro-feed-rendered', pixoroAvatarOnce);
