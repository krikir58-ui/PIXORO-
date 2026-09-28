import '../supabase.js'
import './auth.js'
import './feed.js'
import './upload.js'
import './likes.js'
import './search.js'
import './stories.js'
import './profile.js'
import { loadFeed } from './feed.js'
import { loadStories } from './stories.js'
loadStories(); loadFeed();
console.log('PIXORO Ready da Giri 🔥')
