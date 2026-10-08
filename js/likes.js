// PIXORO SECRET 1 - Instagram Double Tap Heart
let likes = JSON.parse(localStorage.getItem('pixoro_likes') || '{}');

function doubleTapLike(postId, imgElement){
  // Heart animation - Instagram style
  let heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:80px;animation:heartPop 1s ease;pointer-events:none;z-index:99';
  imgElement.parentElement.style.position = 'relative';
  imgElement.parentElement.appendChild(heart);

  // Like pannu
  if(!likes[postId]) likes[postId] = [];
  let user = localStorage.getItem('pixoro_user') || localStorage.getItem('pixoro_v1_user') || 'Giri';
  if(String(user).includes('{')) user = 'Giri';
  user = user.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20);

  if(!likes[postId].includes(user)){
    likes[postId].push(user);
    localStorage.setItem('pixoro_likes', JSON.stringify(likes));
    updateLikeCount(postId);
    // Haptic vibration - Instagram feel
    if(navigator.vibrate) navigator.vibrate(50);
  }
  setTimeout(()=> heart.remove(), 1000);
}

function updateLikeCount(postId){
  let count = (likes[postId] || []).length;
  let el = document.getElementById('like-count-'+postId);
  if(el) el.innerText = count + ' likes';
}

// Animation CSS auto add
let style = document.createElement('style');
style.innerHTML = `@keyframes heartPop{0%{transform:translate(-50%,-50%) scale(0)}15%{transform:translate(-50%,-50%) scale(1.2)}30%{transform:translate(-50%,-50%) scale(1)}80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(0);opacity:0}}`;
document.head.appendChild(style);
