import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { initScreenshotAlert } from './safety.js';
import { loadStories } from './stories.js';
import './likes.js';
import { loadReels } from './reels.js';
import { loadExplore, initSearch } from './explore.js';

initAuth();
loadFeed();
loadStories();
loadReels();
loadExplore();
initSearch();
initScreenshotAlert(); // Girls Safety ON! 🔒
