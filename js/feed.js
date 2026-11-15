// feed.js - PIXORO Feed - FIXED da Giri!
// import illa da - pixoro-core la iruntha supa va edukuren da
function getSupa(){ return window.supa; }

export async function getFeed(currentUserId) {
  try {
    if(!currentUserId) return []
    const supabase = getSupa();
    if(!supabase) return [];

    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = following ? following.map(f => f.following_id) : [];
    const allowedIds = [...followingIds, currentUserId];

    // Posts + Reels - Rendum da - Photo varanum la da
    const { data: reels, error } = await supabase
      .from('reels')
      .select(`
        id, video_url, media_url, caption, visibility, shared_with, created_at, user_id,
        profiles ( id, username, avatar_url, is_private_account, is_verified )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id, media_url, video_url, caption, created_at, user_id,
        profiles ( id, username, avatar_url, is_private_account, is_verified )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    let all = [...(reels||[]), ...(posts||[])];

    // Filter - JS la Pannu da - Simple da
    const filtered = all.filter(r => {
      if(r.visibility === 'private_share') return false // DM Mattum da
      let prof = r.profiles;
      if(!prof) return true;
      if(!prof.is_private_account) return true // Public na - OK da
      return allowedIds.includes(r.user_id) // Private na - Follow Panna Mattum da
    });

    // Date vachu sort pannu da - Latest mela varum da
    filtered.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
    return filtered;

  } catch (err) {
    console.error('Feed error da Giri:', err);
    return [];
  }
}

export async function renderFeed(currentUserId) {
  // FIXED da - feedContainer illa da, feed thaan da
  const feedContainer = document.getElementById('feed') || document.getElementById('feedContainer');
  if (!feedContainer) return;
  
  feedContainer.innerHTML = '<p style="color:#888;text-align:center;">Loading da Giri... ⏳</p>';
  const reels = await getFeed(currentUserId);
  
  if (reels.length === 0) {
    feedContainer.innerHTML = '<p style="color:#888;text-align:center;">No reels da - Follow some public IDs da! 🌍</p>';
    return;
  }

  feedContainer.innerHTML = reels.map(reel => {
    let prof = reel.profiles || {};
    let media = reel.video_url || reel.media_url || '';
    let isVid = media.toLowerCase().includes('.mp4') || media.toLowerCase().includes('.mov') || media.toLowerCase().includes('.webm');
    let mediaHtml = isVid ? `<video src="${media}" controls style="width:100%;border-radius:12px;background:#000;"></video>` : `<img src="${media}" style="width:100%;border-radius:12px;object-fit:cover;aspect-ratio:4/5">`;
    return `
    <div class="reel-card" style="background:#151515;border-radius:20px;margin-bottom:16px;padding:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${prof.avatar_url || 'https://ui-avatars.com/api/?name=P&background=ff5ea8&color=fff'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
        <b style="color:white;">${prof.username || 'user'} ${prof.is_verified ? '✔️💙' : ''}</b>
        <span style="color:#888;font-size:12px;">${prof.is_private_account ? '🔒 Private' : '🌍 Public'}</span>
      </div>
      ${mediaHtml}
      <p style="color:white;margin-top:8px;">${reel.caption || ''}</p>
    </div>`;
  }).join('');
}
// HTML la irunthu koopida - window la vai da
window.getFeed = getFeed;
window.renderFeed = renderFeed;
