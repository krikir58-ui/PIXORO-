import { initAuth } from './auth.js'
import { loadFeed } from './feed.js'
import { loadStories } from './stories.js'
import { initLikes } from './likes.js'
import { initSearch } from './search.js'
import { initUpload } from './upload.js'
import { initReels } from './reels.js'

console.log('PIXORO Full Instagram Ready da Giri 🔥')

initAuth()      // Login/Signup
loadFeed()      // Home Feed
loadStories()   // Stories
initLikes()     // Like ❤️
initSearch()    // Search 🔍
initUpload()    // Upload
initReels()     // Reels
