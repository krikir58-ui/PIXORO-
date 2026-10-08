import { initAuth } from './auth.js';
import { loadFeed } from './feed.js';
import { initScreenshotAlert } from './safety.js';

initAuth();
loadFeed();
initScreenshotAlert();

// Baki ellam iruntha mattum load pannu - Illana skip pannu
try{
  const { loadStories } = await import('./stories.js');
  loadStories();
}catch(e){ console.log('stories.js illa'); }

try{
  const { loadReels } = await import('./reels.js');
  loadReels();
}catch(e){ console.log('reels.js illa'); }

try{
  const { loadExplore, initSearch } = await import('./explore.js');
  loadExplore();
  initSearch();
}catch(e){ console.log('explore.js illa'); }

try{
  await import('./likes.js');
}catch(e){ console.log('likes.js illa'); }
