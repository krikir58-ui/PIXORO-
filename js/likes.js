import { getUser } from './auth.js';
import { loadFeed } from './feed.js';

export function initLikes(){
  window.doLike = (imgKey)=>{
    let u=getUser();
    let likes=JSON.parse(localStorage.getItem('pixoro_like_'+imgKey)||'[]');
    if(!likes.includes(u)) likes.push(u); else likes=likes.filter(x=>x!==u);
    localStorage.setItem('pixoro_like_'+imgKey, JSON.stringify(likes));
    loadFeed(document.getElementById('searchInput').value || null);
  };
}
