import { supabase } from './supabase.js'
import { getRealProfile } from './auth.js'
import { renderFeed } from './feed.js'
import { loadStories } from './stories.js'
import { loadExplore, initSearch } from './explore.js'
import { initLikes } from './likes.js'
import { initScreenshotAlert } from './safety.js'
import { loadReels } from './reels.js'
// ❌ GOLD IMPORT REMOVED da - isGoldUser, goldTickHTML venam da

// === FIRST - SERVER CHECK DA ===
let real = await getRealProfile() // Login Illana - join.html ku Poidum da

if(!real){
  location.href = 'join.html' // ✅ Ithu Thaan da - Avalukku First Login Varathukku da
} else {
  window.ME = real.profile.username
  window.ME_ID = real.user.id

  // ✅ GOLD TICK OFF da - Vera yarukkum tick vendaam da
  window.ME_VERIFIED = false
  window.getTick = (p) => '' // Always empty da - Tick varathu da

  // ✅ PROFILE PHOTO FIX da - Avatar Illana Letter Varum da
  window.getPfp = (p) => {
    let url = p?.avatar_url || p?.avatar || p?.profile_pic;
    if(url && url.startsWith('http') && !url.includes('undefined')) return url;
    let name = (p?.username || 'G').replace('@','').trim();
    return `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}&background=111&color=fff&size=300&bold=true`;
  }

  await renderFeed(real.user.id)
  await loadStories(real.user.id)
  loadExplore()
  await loadReels(real.user.id)
  initSearch()
  initLikes()
  initScreenshotAlert()
}
