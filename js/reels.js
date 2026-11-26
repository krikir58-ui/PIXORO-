// ===== PIXORO REELS VISIBILITY - v1009 CORRECTED - THANI FILE DA =====
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
      shared_with: isPrivateShare ? (sharedWithIds || []).map(x => String(x)) : null
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
  // ✅ FIX: Join fail aana kooda feed empty aagathu da - profiles join illama fetch pannu da
  let reels = [];
  let {data: reelsData, error} = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(50);
  if(error){ console.log('reels fetch fail', error.message); return []; }
  reels = reelsData || [];

  // ✅ Profiles ah thaniya eduthuko da - Join problem eh illa da
  let profMap = {};
  try{
    let {data: profs} = await s.from('profiles').select('id,is_private_account,username,avatar_url').limit(200);
    (profs||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  let clean = (reels||[]).filter(r=>{
    // ✅ Private Share reels feed la vara koodathu da
    if(r.visibility === 'private_share') return false;
    if(r.visibility === 'private') return false;
    // ✅ Archived reels feed la vara koodathu da
    if(r.is_archived === true) return false;
    if(r.is_deleted === true) return false;

    // ✅ FIX: profiles illa na - profMap la irundhu eduthuko da
    if(!r.profiles && profMap[String(r.user_id)]){
      r.profiles = profMap[String(r.user_id)];
    }
    // ✅ FIX: username / avatar direct ah reel la vachidu da - render la easy da
    if(profMap[String(r.user_id)]){
      r.username = r.username || profMap[String(r.user_id)].username;
      r.avatar_url = r.avatar_url || profMap[String(r.user_id)].avatar_url;
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

// ✅ DM la Private Share Reels Kaamikka da - CORRECTED - String Compare da
async function getDMPrivateReelsPixoro(currentUserId){
  let s = window.supa; if(!s) return [];
  if(!currentUserId) return [];
  let me = String(currentUserId);
  let {data, error} = await s.from('reels').select('*').eq('visibility','private_share').order('created_at',{ascending:false}).limit(50);
  if(error){ console.log('DM reels fail', error.message); return []; }

  // ✅ Profiles ah thaniya map pannu da
  let profMap = {};
  try{
    let {data: profs} = await s.from('profiles').select('id,username,avatar_url').limit(200);
    (profs||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  return (data||[]).filter(r=>{
    if(r.is_archived === true) return false;
    if(r.is_deleted === true) return false;
    // ✅ FIX: shared_with la number irundhalum string ah maathi compare pannu da
    let shared = (r.shared_with || []).map(x => String(x));
    if(profMap[String(r.user_id)]){
      r.profiles = profMap[String(r.user_id)];
      r.username = r.username || profMap[String(r.user_id)].username;
      r.avatar_url = r.avatar_url || profMap[String(r.user_id)].avatar_url;
    }
    return String(r.user_id) === me || shared.includes(me);
  });
}
window.getDMPrivateReelsPixoro = getDMPrivateReelsPixoro;
