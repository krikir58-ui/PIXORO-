// feed.js - PIXORO Feed - Public ID / Private ID + Private Share da!
import { supa } from './supabase.js';

// Feed la reels edukkura function da - Main da!
export async function getFeed(currentUserId) {
  try {
    // 1. Naan yaar ellam follow panren nu eduthukko da
    const { data: following } = await supa
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = following ? following.map(f => f.following_id) : [];
    // En ID yum serthu da - En reels um feed la varanum da
    const allowedIds = [...followingIds, currentUserId];

    // 2. Feed query da - Public IDs + Naan follow panra Private IDs mattum da
    let query = supa
      .from('reels')
      .select(`
        id,
        video_url,
        caption,
        visibility,
        shared_with,
        created_at,
        user_id,
        profiles!inner (
          id,
          username,
          avatar_url,
          is_private_account,
          is_verified
        )
      `)
      .eq('visibility', 'public') // Private Share reels feed la varathu da - DM la mattum than!
      .order('created_at', { ascending: false })
      .limit(20);

    // Logic: Public account (is_private_account=false) OR Naan follow panra account
    if (allowedIds.length > 0) {
      query = query.or(`profiles.is_private_account.eq.false,user_id.in.(${allowedIds.join(',')})`);
    } else {
      // Yaaraiyum follow pannala na - Public reels mattum da
      query = query.eq('profiles.is_private_account', false);
    }

    const { data: reels, error } = await query;
    if (error) throw error;

    return reels || [];

  } catch (err) {
    console.error('Feed error da Giri:', err);
    return [];
  }
}

// Single reel kaamikkanum na - Profile la click panna da
export async function getReelById(reelId, viewerId) {
  const { data: reel } = await supa
    .from('reels')
    .select('*, profiles!inner(is_private_account)')
    .eq('id', reelId)
    .single();

  if (!reel) return null;

  // Private ID check da
  if (reel.profiles.is_private_account) {
    const { data: isFollowing } = await supa
      .from('follows')
      .select('id')
      .eq('follower_id', viewerId)
      .eq('following_id', reel.user_id)
      .maybeSingle();

    // Follower illa + Own reel illa na - Paaka koodathu da!
    if (!isFollowing && viewerId !== reel.user_id) {
      return { isLocked: true, message: 'This account is private 🔒' };
    }
  }

  // Private Share reel ah na - shared_with la irukka nu check pannu da
  if (reel.visibility === 'private_share') {
    if (!reel.shared_with?.includes(viewerId) && viewerId !== reel.user_id) {
      return { isLocked: true, message: 'Private share only 🔒' };
    }
  }

  return reel;
}

// Feed render pannura function da - HTML la add pannu
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
        <div>
          <b style="color:white;">${reel.profiles.username} ${reel.profiles.is_verified ? '✔️💙' : ''}</b>
          <span style="color:#888;font-size:12px;margin-left:6px;">${reel.profiles.is_private_account ? '🔒 Private' : '🌍 Public'}</span>
        </div>
      </div>
      <video src="${reel.video_url}" controls style="width:100%;border-radius:12px;background:#000;"></video>
      <p style="color:white;margin-top:8px;">${reel.caption || ''}</p>
    </div>
  `).join('');
}

// Infinite scroll - Keela scroll panna kooda reels varum da
export function initInfiniteScroll(currentUserId) {
  window.addEventListener('scroll', async () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      const moreReels = await getFeed(currentUserId);
      // Append pannu da
      console.log('More reels loaded da', moreReels.length);
    }
  });
}
