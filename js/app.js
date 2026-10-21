import { supabase } from './supabase.js'
import { getRealProfile } from './auth.js'
import { loadFeed } from './feed.js'
import { loadStories } from './stories.js'
import { loadExplore, initSearch } from './explore.js'
import { initLikes } from './likes.js'
import { initScreenshotAlert } from './safety.js'
import { loadReels } from './reels.js'

// === FIRST - SERVER CHECK DA - ITHU ILLANA - ELLAM WASTE DA ===
let real = await getRealProfile() // Login Illana - Auto login.html ku Poidum da

if(real){
  // Ne Thaan da - Server la Session Irukku da - Appa Thaan Feed Load Pannu da
  window.ME = real.profile.username // giri_office da - Server la Irundhu da
  window.ME_VERIFIED = real.profile.verified // Gold Tick da - Server la Irundhu da
  
  loadStories()
  loadFeed()
  loadExplore()
  loadReels()
  initSearch()
  initLikes()
  initScreenshotAlert()
}
