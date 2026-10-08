import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { initScreenshotAlert } from './safety.js';
import { loadStories } from './stories.js';
import './likes.js';

initAuth();
loadFeed();
loadStories();
initScreenshotAlert(); // Girls Safety ON! 🔒
