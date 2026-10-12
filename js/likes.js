import { getUser } from './auth.js';

export function initLikes(){
  window.doLike = (imgKey)=>{
    let u=getUser();
    let key = 'pixoro_like_'+imgKey;
    let likes = JSON.parse(localStorage.getItem(key) || '[]');
    
    let isLiked = likes.includes(u);
    
    // 1. UDANE UI LA MAATHU DA - SPEED!
    let newLikes;
    if(!isLiked) {
      newLikes = [...likes, u];
    } else {
      newLikes = likes.filter(x=>x!==u);
    }
    
    // 2. LocalStorage save
    localStorage.setItem(key, JSON.stringify(newLikes));
    
    // 3. UI la mattum instant ah update pannu - full feed reload venda!
    let btn = document.querySelector(`[data-like-key="${imgKey}"]`);
    if(btn) {
      let count = newLikes.length;
      let liked = newLikes.includes(u);
      btn.innerHTML = `${liked ? '❤️' : '🤍'} ${count > 0 ? count : ''}`;
      btn.classList.toggle('liked', liked);
      // Little pop animation da!
      btn.style.transform = 'scale(1.3)';
      setTimeout(()=> btn.style.transform = 'scale(1)', 150);
    }
  };
}
