// ===== PIXORO REELS VISIBILITY - v1008 CORRECTED - THANI FILE DA =====
// ✅ export ILLA DA - window.supa THAAN DA

async function uploadReelPixoro(userId, videoUrl, isPrivateShare, sharedWithIds, captionText){
  let s = window.supa;
  if(!s) return {error:'No supa da'};
  if(!userId || !videoUrl) return {error:'userId / videoUrl illa da'};

  // ✅ Caption - Neenga Kudutha Caption da - Illa na Default da
  let row = {
    user_id: userId,
    video_url: videoUrl,
    media_url: videoUrl,
    caption: (captionText || 'Just Pixoro').trim() || 'Just Pixoro'
  };

  // ✅ visibility column iruntha mattum serthu da - illa na fail aagathu da
  try{
    let payload = {
      ...row,
      visibility: isPrivateShare ? 'private_share' : 'public',
      shared_with: isPrivateShare ? (sharedWithIds || []) : null
    };
    let {data, error} = await s.from('reels').insert(payload).select().single();
    if(error) throw error;
    return {data, error: null};
  }catch(e){
    // ✅ Column illa na - normal ah insert pannidu da
    console.log('visibility column illa da, normal insert da', e.message);
    let {data, error} = await s.from('reels').insert(row).select().single();
    return {data, error};
  }
}
window.uploadReelPixoro = uploadReelPixoro;

async function getFeedPixoro(currentUserId){
  let s = window.supa;
  if(!s) return [];
  if(!currentUserId) return [];

  // ✅ 1. Naan follow panra IDs ah eduthuko da
  let followingIds = [];
  try{
    let {data: following} = await s.from('follows').select('following_id').eq('follower_id', currentUserId).eq('status','accepted');
    followingIds = (following||[]).map(f=>String(f.following_id));
  }catch(e){}

  // ✅ 2. Public reels mattum eduthuko da - Private Share reels feed la vara koodathu da, DM la mattum da
  // ✅ FIX: profiles join serthachu da - username + pfp varum da
  let {data: reels, error} = await s.from('reels').select('*, profiles:profiles(username,avatar_url)').order('created_at',{ascending:false}).limit(50);
  if(error){ console.log('reels fetch fail', error.message); return []; }

  // ✅ 3. Private account check da - Public account reels + Naan follow panra private account reels mattum da
  let profMap = {};
  try{
    let {data: profs} = await s.from('profiles').select('id,is_private_account,username,avatar_url').limit(200);
    (profs||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  let clean = (reels||[]).filter(r=>{
    // ✅ Private Share reels feed la vara koodathu da
    if(r.visibility === 'private_share') return false;
    if(r.visibility === 'private') return false;
    // ✅ Archived reels feed la vara koodathu da - FIX ADDED DA
    if(r.is_archived === true) return false;

    // ✅ FIX: profiles illa na - profMap la irundhu eduthuko da
    if(!r.profiles && profMap[String(r.user_id)]){
      r.profiles = profMap[String(r.user_id)];
    }

    let pr = profMap[String(r.user_id)] || r.profiles;
    if(pr && pr.is_private_account === true){
      // Private account na - naan follow pannina mattum kaamikkanum da
      if(String(r.user_id) === String(currentUserId)) return true;
      if(followingIds.includes(String(r.user_id))) return true;
      return false;
    }
    return true;
  });

  // ✅ FIX: Duplicate video vara koodathu da
  let seen = new Set();
  return clean.filter(r=>{
    let url = String(r.media_url || r.video_url || '').split('?')[0].toLowerCase();
    if(url && seen.has(url)) return false;
    if(url) seen.add(url);
    return true;
  });
}
window.getFeedPixoro = getFeedPixoro;

// ✅ NEW FIX ADDED DA - DM la Private Share Reels Kaamikka da
async function getDMPrivateReelsPixoro(currentUserId){
  let s = window.supa; if(!s) return [];
  let {data} = await s.from('reels').select('*, profiles:profiles(username,avatar_url)').eq('visibility','private_share').order('created_at',{ascending:false}).limit(50);
  return (data||[]).filter(r=>{
    let shared = r.shared_with || [];
    return String(r.user_id) === String(currentUserId) || shared.includes(currentUserId) || shared.includes(String(currentUserId));
  });
}
window.getDMPrivateReelsPixoro = getDMPrivateReelsPixoro;
