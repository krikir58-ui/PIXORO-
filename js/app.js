import { supabase } from './supabase.js'
import { getRealProfile } from './auth.js'
import { renderFeed } from './feed.js' // loadFeed Illa da - renderFeed da!
import { loadStories } from './stories.js'
import { loadExplore, initSearch } from './explore.js'
import { initLikes } from './likes.js'
import { initScreenshotAlert } from './safety.js'
import { loadReels } from './reels.js'

// === FIRST - SERVER CHECK DA ===
let real = await getRealProfile() // Login Illana - Auto login.html ku Poidum da

if(real){
  window.ME = real.profile.username // Server la Irundhu da
  window.ME_VERIFIED = real.profile.verified // Gold Tick da - Server la Irundhu da
  window.ME_ID = real.user.id // ID - Important da

  // ID ah - Anuppu da - Illana - Feed - Yaarudunu - Theriyathu da
  renderFeed(real.user.id) // ✅ Ithu Thaan da - Correct da
  loadStories(real.user.id)
  loadExplore()
  loadReels(real.user.id)
  initSearch()
  initLikes()
  initScreenshotAlert()
}
