// ===== PIXORO REELS VISIBILITY - v1008 - THANi FUNCTION DA =====
// ✅ export ILLA DA - window.supa THAAN DA

async function uploadReelPixoro(userId, videoUrl, isPrivateShare, sharedWithIds){
  let s = window.supa; if(!s) return {error:'No supa da'};
  let row = { user_id: userId, video_url: videoUrl, media_url: videoUrl, caption: 'Just Pixoro' };
  // ✅ visibility column iruntha mattum serthu da - illa na fail aagathu da
  try{
    let {data, error} = await s.from('reels').insert({ ...row, visibility: isPrivateShare ? 'private_share' : 'public', shared_with: isPrivateShare ? sharedWithIds : null }).select().single();
    if(error) throw error;
    return {data};
  }catch(e){
    // ✅ Column illa na - normal ah insert pannidu da
    console.log('visibility column illa da, normal insert da', e.message);
    let {data, error} = await s.from('reels').insert(row).select().single();
    return {data, error};
  }
}
window.uploadReelPixoro = uploadReelPixoro;

async function getFeedPixoro(currentUserId){
  let s = window.supa; if(!s) return [];
  // ✅ 1. Naan follow panra IDs ah eduthuko da
  let {data: following} = await s.from('follows').select('following_id').eq('follower_id', currentUserId).eq('status','accepted');
  let followingIds = (following||[]).map(f=>String(f.following_id));

  // ✅ 2. Public reels mattum eduthuko da - Private Share reels feed la vara koodathu da, DM la mattum da
  let {data: reels, error} = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(50);
  if(error){ console.log('reels fetch fail', error.message); return []; }

  // ✅ 3. Private account check da - Public account reels + Naan follow panra private account reels mattum da
  let {data: profs} = await s.from('profiles').select('id,is_private_account,username').limit(200);
  let profMap = {};
  (profs||[]).forEach(p=> profMap[String(p.id)] = p);

  let clean = (reels||[]).filter(r=>{
    // Private Share reels feed la vara koodathu da
    if(r.visibility === 'private_share') return false;
    if(r.visibility === 'private') return false;
    // Private Share la naan iruntha mattum DM la kaamikkanum da - feed la vendaam da
    let pr = profMap[String(r.user_id)];
    if(pr && pr.is_private_account === true){
      // Private account na - naan follow pannina mattum kaamikkanum da
      if(String(r.user_id) === String(currentUserId)) return true;
      if(followingIds.includes(String(r.user_id))) return true;
      return false;
    }
    return true;
  });
  return clean;
}
window.getFeedPixoro = getFeedPixoro;
