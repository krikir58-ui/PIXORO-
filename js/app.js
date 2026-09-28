import { createClient } from '../supabase.js'
import { initAuth } from './auth.js'
import { loadFeed } from './feed.js'
import { loadStories } from './stories.js'
import { initUpload } from './upload.js'
import { initSearch } from './search.js'
import { initLikes } from './likes.js'
import { initProfile } from './profile.js'

console.log('PIXORO Ready da Giri 🔥')

// App start
initAuth()
loadFeed()
loadStories()
initUpload()
initSearch()
initLikes()
initProfile()
