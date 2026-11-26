// ===== PIXORO REELS VISIBILITY - v1010 CORRECTED - THANI FILE DA =====
// ✅ export ILLA DA - window.supa THAAN DA - Block Illa da

async function uploadReelPixoro(userId, videoUrl, isPrivateShare, sharedWithIds, captionText){
  let s = window.supa;
  if(!s) return {error:'No supa da'};
  if(!userId || !videoUrl) return {error:'userId / videoUrl illa da'};

  let row = {
    user_id: userId,
    video_url: videoUrl,
    media_url: videoUrl,
    caption: (captionText || 'Just Pixoro').trim() || 'Just Pixoro'
  };

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
    console.log('visibility column illa da, normal insert da', e.message);
    let {data, error} = await s.from('reels').insert(row).select().single();
    return {data, error};
  }
}
window.uploadReelPixoro = uploadReelPixoro;

async function getFeedPixoro(currentUserId){
  let s = window.supa;
  if(!s) return [];
  // ✅ FIX v1010 - currentUserId Illana kooda Return Panna Koodathu da - Public Reels Kaattnum da
  let me = currentUserId ? String(currentUserId) : "";

  // ✅ 1. Naan follow panra IDs ah eduthuko da - Login Irundha Mattum da
  let followingIds = [];
  if(me){
    try{
      let {data: following} = await s.from('follows').select('following_id').eq('follower_id', me).eq('status','accepted');
      followingIds = (following||[]).map(f=>String(f.following_id));
    }catch(e){}
  }

  // ✅ 2. Reels Table la Paaru da
  let reels = [];
  try{
    let {data: reelsData, error} = await s.from('reels').select('*').order('created_at',{ascending:false}).limit(50);
    if(!error) reels = reelsData || [];
  }catch(e){ console.log('reels fetch fail', e.message); }

  // ✅ 3. FIX v1010 - Reels Table Empty na - Posts Table la Video ah Eduthuko da - Blank Eh Varathu da
  if(!reels.length){
    try{
      let {data: posts} = await s.from('posts').select('*').order('created_at',{ascending:false}).limit(50);
      reels = (posts||[]).filter(p=>{
        let u = String(p.video_url || p.media_url || '');
        return u.includes('.mp4') || u.includes('video') || p.media_type === 'video' || p.is_reel === true;
      });
    }catch(e){ console.log('posts fallback fail', e.message); }
  }

  if(!reels.length) return [];

  // ✅ Profiles ah thaniya eduthuko da - Join problem eh illa da
  let profMap = {};
  try{
    let {data: profs} = await s.from('profiles').select('id,is_private_account,username,avatar_url').limit(200);
    (profs||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  let clean = (reels||[]).filter(r=>{
    if(r.visibility === 'private_share') return false;
    if(r.visibility === 'private') return false;
    if(r.is_archived === true) return false;
    if(r.is_deleted === true) return false;

    if(!r.profiles && profMap[String(r.user_id)]){
      r.profiles = profMap[String(r.user_id)];
    }
    if(profMap[String(r.user_id)]){
      r.username = r.username || profMap[String(r.user_id)].username;
      r.avatar_url = r.avatar_url || profMap[String(r.user_id)].avatar_url;
      // ✅ FIX - Reels.js ku thevai da - avatar_url illana avatar la podu da
      r.avatar = r.avatar_url;
    }

    let pr = profMap[String(r.user_id)] || r.profiles;
    if(pr && pr.is_private_account === true){
      // ✅ FIX - Login Illana Private Account Reels Kaatatha da - Public Mattum Kaattu da
      if(me && String(r.user_id) === me) return true;
      if(me && followingIds.includes(String(r.user_id))) return true;
      return false;
    }
    return true;
  });

  // ✅ Duplicate video vara koodathu da
  let seen = new Set();
  return clean.filter(r=>{
    let url = String(r.media_url || r.video_url || '').split('?')[0].toLowerCase();
    if(!url) return false;
    if(seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}
window.getFeedPixoro = getFeedPixoro;

// ✅ DM la Private Share Reels Kaamikka da
async function getDMPrivateReelsPixoro(currentUserId){
  let s = window.supa; if(!s) return [];
  if(!currentUserId) return [];
  let me = String(currentUserId);
  let {data, error} = await s.from('reels').select('*').eq('visibility','private_share').order('created_at',{ascending:false}).limit(50);
  if(error){ console.log('DM reels fail', error.message); return []; }

  let profMap = {};
  try{
    let {data: profs} = await s.from('profiles').select('id,username,avatar_url').limit(200);
    (profs||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  return (data||[]).filter(r=>{
    if(r.is_archived === true) return false;
    if(r.is_deleted === true) return false;
    let shared = (r.shared_with || []).map(x => String(x));
    if(profMap[String(r.user_id)]){
      r.profiles = profMap[String(r.user_id)];
      r.username = r.username || profMap[String(r.user_id)].username;
      r.avatar_url = r.avatar_url || profMap[String(r.user_id)].avatar_url;
      r.avatar = r.avatar_url;
    }
    return String(r.user_id) === me || shared.includes(me);
  });
}
window.getDMPrivateReelsPixoro = getDMPrivateReelsPixoro;
