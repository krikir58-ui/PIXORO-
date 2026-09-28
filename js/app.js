import { initAuth } from './auth.js'
import { loadFeed } from './feed.js'
import { loadStories } from './stories.js'
import { initLikes } from './likes.js'
import { initSearch } from './search.js'
import { initUpload } from './upload.js'
import { initReels } from './reels.js'

console.log('PIXORO Full Ready da Giri 🔥')

initAuth()
loadFeed()
loadStories()
initLikes()
initSearch()
initUpload()
initReels()
