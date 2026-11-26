// ===== PIXORO AVATAR - v1016 - FIXED DA - Block Illa da =====
window.PIXORO_AVATAR_MAP = window.PIXORO_AVATAR_MAP || {};

async function pixoroLoadAvatars(){
  let s = window.getSupa ? window.getSupa() : window.supa;
  if(!s) return;
  try{
    let r = await s.from('profiles').select('id,avatar_url,username').limit(500);
    (r.data||[]).forEach(p=>{
      let url = String(p.avatar_url || '').trim();
      if(url) window.PIXORO_AVATAR_MAP[String(p.id)] = url;
    });

    // ✅ FIX DA - ME_ID illa na Auth la irunthu Edu da
    let myId = window.ME_ID;
    if(!myId){
      try{
        let {data:{user}} = await s.auth.getUser();
        if(user) { myId = user.id; window.ME_ID = myId; }
      }catch(e){}
    }
    // ✅ FIX DA - localStorage la iruntha kooda Edu da - Auth Late aana kooda Work Aagum da
    if(!myId){
      try{
        let saved = JSON.parse(localStorage.getItem('pixoro_user') || localStorage.getItem('pixoro_profile') || 'null');
        if(saved?.id){ myId = saved.id; window.ME_ID = myId; }
      }catch(e){}
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

      // ✅ FIX v1016 - Ella PFP yum Update pannu da - Orey oru Id mattum illa da
      // 1. data-avatar-user irukka Ellam
      document.querySelectorAll('[data-avatar-user]').forEach(img=>{
        if(String(img.dataset.avatarUser) === String(myId)) img.src = myPhoto;
      });

      // 2. Ella avatar img yum - Map la irukka ID ku match aana
      document.querySelectorAll('img[data-user-id], img[data-uid]').forEach(img=>{
        let uid = String(img.dataset.userId || img.dataset.uid || '');
        if(window.PIXORO_AVATAR_MAP[uid]) img.src = window.PIXORO_AVATAR_MAP[uid];
      });

      // 3. Reels / Home PFP - reel-pfp-wrap la irukka img
      document.querySelectorAll('.reel-pfp-wrap img, .reelUserRow img, .rPfp img').forEach(img=>{
        let parent = img.closest('[data-owner], [data-user-id], .reelItem, .reel');
        let uid = parent?.dataset?.owner || parent?.dataset?.userId || '';
        if(uid && window.PIXORO_AVATAR_MAP[String(uid)]) img.src = window.PIXORO_AVATAR_MAP[String(uid)];
        else if(myId && img.src.includes('ui-avatars')) img.src = myPhoto;
      });

      // 4. Nav PFP - Ella Page layum
      document.querySelectorAll('#navPfp, .navPfp').forEach(nav=>{ nav.src = myPhoto; });

      // 5. Profile Page PFP
      document.querySelectorAll('#profilePfp, #profileImg, .profilePfp').forEach(el=>{ el.src = myPhoto; });

      // ✅ My Story - Ithu thaan Mukkiyam da
      let myStory = document.getElementById('myStoryImg');
      if(myStory){
        myStory.src = myPhoto;
        myStory.style.display = 'block';
        // G letter iruntha Maraichidu da
        let parent = myStory.parentElement;
        if(parent){ parent.classList.remove('no-photo'); parent.classList.add('has-photo'); }
        // Letter span iruntha hide pannu da
        let letter = parent?.querySelector('.storyLetter, .avatarLetter');
        if(letter) letter.style.display = 'none';
      }
    }

    // ✅ FIX v1016 - Vera Users Avatar um Update pannu da - Reels la PFP Blank Irukkathu da
    document.querySelectorAll('img[data-avatar-user]').forEach(img=>{
      let uid = String(img.dataset.avatarUser || '');
      if(window.PIXORO_AVATAR_MAP[uid]) img.src = window.PIXORO_AVATAR_MAP[uid];
    });

  }catch(e){ console.log('avatar error', e); }
}
window.pixoroLoadAvatars = pixoroLoadAvatars;

window.pixoroGetAvatar = function(p){
  // ✅ FIX - String ID kodutha kooda Map la paaru da
  if(!p) return window.MY_PFP || '';
  if(typeof p === 'string'){
    return window.PIXORO_AVATAR_MAP[String(p)] || window.MY_PFP || '';
  }
  // ✅ FIX - avatar / avatar_url / profiles.avatar_url Ellam Paaru da
  let uid = String(p.user_id || p.id || p.owner || '');
  return String(
    p.avatar_url || p.avatar || p.profiles?.avatar_url ||
    window.PIXORO_AVATAR_MAP[uid] ||
    window.MY_PFP || ''
  ).trim();
};

// ✅ FIX DA - Function ah Thanava Koopdu da + Reels Render Aana Appuramum Koopdu da
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(pixoroLoadAvatars, 500);
  setTimeout(pixoroLoadAvatars, 2000);
  setTimeout(pixoroLoadAvatars, 4000);
});

// ✅ FIX v1016 - Reels / Home Render Aana Appuram Avatar Update Aaganum da - Ithu Thaan Block Fix da
window.addEventListener('pixoro-reels-rendered', pixoroLoadAvatars);
window.addEventListener('pixoro-feed-rendered', pixoroLoadAvatars);
// Reels.js la render mudinja appuram - dispatchEvent(new Event('pixoro-reels-rendered')) nu podu da
