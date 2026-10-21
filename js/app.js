import { supabase } from './supabase.js'
import { getRealProfile } from './auth.js'
import { renderFeed } from './feed.js'
import { loadStories } from './stories.js'
import { loadExplore, initSearch } from './explore.js'
import { initLikes } from './likes.js'
import { initScreenshotAlert } from './safety.js'
import { loadReels } from './reels.js'

// === FIRST - SERVER CHECK DA ===
let real = await getRealProfile() // Login Illana - join.html ku Poidum da

if(!real){
  location.href = 'join.html' // ✅ Ithu Thaan da - Avalukku First Login Varathukku da
} else {
  window.ME = real.profile.username
  window.ME_VERIFIED = real.profile.verified
  window.ME_ID = real.user.id

  await renderFeed(real.user.id)
  await loadStories(real.user.id)
  loadExplore()
  await loadReels(real.user.id)
  initSearch()
  initLikes()
  initScreenshotAlert()
}
