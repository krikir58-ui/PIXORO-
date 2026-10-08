// PIXORO LIKE SYSTEM - SECRET NO 2 - FULL CODE
function getUser(){
  let u = localStorage.getItem('pixoro_user') || localStorage.getItem('pixoro_v1_user') || localStorage.getItem('pixoro_v2_user') || 'Giri';
  try{ if(String(u).includes('{')){ let j=JSON.parse(u); u=j.u||j.username||'Giri'; } }catch(e){}
  return String(u).replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || 'Giri';
}

let likes = JSON.parse(localStorage.getItem('pixoro_likes') || '{}');

function updateLikeCount(postId){
  let count = (likes[postId] || []).length;
  let el = document.getElementById('like-count-'+postId);
  if(el) el.innerText = count + ' likes';
}

export function addLike(postId){
  let user = getUser();
  if(!likes[postId]) likes[postId] = [];
  if(likes[postId].includes(user)){
    likes[postId] = likes[postId].filter(x=>x!==user);
  } else {
    likes[postId].push(user);
    if(navigator.vibrate) navigator.vibrate(50);
  }
  localStorage.setItem('pixoro_likes', JSON.stringify(likes));
  localStorage.setItem('pixoro_like_'+postId, JSON.stringify(likes[postId]));
  localStorage.setItem('lk_'+postId, JSON.stringify(likes[postId]));
  updateLikeCount(postId);
  return likes[postId].length;
}

export function doubleTapLike(postId, imgElement){
  let heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:80px;z-index:99;animation: heartPop 1s ease forwards;pointer-events:none;';
  imgElement.parentElement.style.position = 'relative';
  imgElement.parentElement.appendChild(heart);
  addLike(postId);
  setTimeout(()=> heart.remove(), 1000);
}

export function enableDoubleTap(){
  document.addEventListener('dblclick', (e)=>{
    let postImg = e.target.closest('.ig-post img');
    if(!postImg) return;
    let postDiv = e.target.closest('.ig-post');
    let postId = postDiv?.dataset?.id || 'demo1';
    doubleTapLike(postId, postImg);
  });
}

// Animation CSS
let style = document.createElement('style');
style.innerHTML = `@keyframes heartPop{0%{transform:translate(-50%,-50%) scale(0);opacity:0}15%{transform:translate(-50%,-50%) scale(1.2);opacity:1}30%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}`;
document.head.appendChild(style);

window.addLike = addLike;
window.doubleTapLike = doubleTapLike;
window.enableDoubleTap = enableDoubleTap;
enableDoubleTap();
