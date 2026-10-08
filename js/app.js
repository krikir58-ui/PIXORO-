import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { loadStories } from './stories.js';
import { loadExplore, initSearch } from './explore.js';
import { initLikes } from './likes.js';
import { initScreenshotAlert } from './safety.js';
import { loadReels } from './reels.js';

initAuth();
loadStories();
loadFeed();
loadExplore();
loadReels();
initSearch();
initLikes();
initScreenshotAlert();
