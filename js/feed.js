// feed.js - PIXORO Feed - FIXED da Giri!
import { supabase } from './supabase.js' // supa Illa da - supabase da!

export async function getFeed(currentUserId) {
  try {
    if(!currentUserId) return []

    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = following ? following.map(f => f.following_id) : [];
    const allowedIds = [...followingIds, currentUserId];

    // Public + Follow Panna Private - Mattum da
    const { data: reels, error } = await supabase
      .from('reels')
      .select(`
        id, video_url, caption, visibility, shared_with, created_at, user_id,
        profiles ( id, username, avatar_url, is_private_account, is_verified )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Filter - JS la Pannu da - Simple da - Bug Varaathu da
    const filtered = (reels || []).filter(r => {
      if(r.visibility === 'private_share') return false // DM Mattum da - Feed la Varaathu da
      if(!r.profiles.is_private_account) return true // Public na - OK da
      return allowedIds.includes(r.user_id) // Private na - Follow Panna Mattum da
    });

    return filtered;

  } catch (err) {
    console.error('Feed error da Giri:', err);
    return [];
  }
}

export async function renderFeed(currentUserId) {
  const feedContainer = document.getElementById('feedContainer');
  if (!feedContainer) return;
  
  feedContainer.innerHTML = '<p style="color:#888;text-align:center;">Loading da Giri... ⏳</p>';
  const reels = await getFeed(currentUserId);
  
  if (reels.length === 0) {
    feedContainer.innerHTML = '<p style="color:#888;text-align:center;">No reels da - Follow some public IDs da! 🌍</p>';
    return;
  }

  feedContainer.innerHTML = reels.map(reel => `
    <div class="reel-card" style="background:#151515;border-radius:20px;margin-bottom:16px;padding:12px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${reel.profiles.avatar_url || 'default.png'}" style="width:36px;height:36px;border-radius:50%;">
        <b style="color:white;">${reel.profiles.username} ${reel.profiles.is_verified ? '✔️💙' : ''}</b>
        <span style="color:#888;font-size:12px;">${reel.profiles.is_private_account ? '🔒 Private' : '🌍 Public'}</span>
      </div>
      <video src="${reel.video_url}" controls style="width:100%;border-radius:12px;background:#000;"></video>
      <p style="color:white;margin-top:8px;">${reel.caption || ''}</p>
    </div>
  `).join('');
}
