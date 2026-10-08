import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { initScreenshotAlert } from './safety.js';
import { loadStories } from './stories.js';
import './likes.js';
import { loadReels } from './reels.js';

initAuth();
loadFeed();
loadStories();
loadReels();
initScreenshotAlert(); // Girls Safety ON! 🔒
