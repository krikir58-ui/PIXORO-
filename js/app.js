import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { initScreenshotAlert } from './safety.js';

initAuth();
loadFeed();
initScreenshotAlert(); // Girls Safety ON! 🔒
