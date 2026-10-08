// PIXORO EXPLORE SYSTEM - SECRET NO 5 - HASHTAG + EXPLORE
function getUser(){
  let u = localStorage.getItem('pixoro_v2_user') || 'Giri';
  try{ if(String(u).trim().startsWith('{')) u=JSON.parse(u).u||'Giri'; }catch(e){}
  return String(u).replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || 'Giri';
}

// Hashtag eduthu save pannu - Instagram secret!
function extractHashtags(caption){
  if(!caption) return [];
  let tags = caption.match(/#[a-zA-Z0-9_]+/g) || [];
  return tags.map(t => t.toLowerCase());
}

export function searchByHashtag(tag){
  tag = tag.toLowerCase();
  let posts = JSON.parse(localStorage.getItem('pixoro_v2_posts') || '[]');
  // Hashtag irukkura post ah filter pannu
  let filtered = posts.filter(p => {
    let caps = (p.cap || '').toLowerCase();
    return caps.includes(tag);
  });
  
  // Likes vechu sort - Trending first!
  filtered.sort((a,b)=>{
    let aLikes = JSON.parse(localStorage.getItem('pixoro_like_'+a.id) || '[]').length;
    let bLikes = JSON.parse(localStorage.getItem('pixoro_like_'+b.id) || '[]').length;
    return bLikes - aLikes;
  });
  
  return filtered;
}

export function loadExplore(){
  let box = document.getElementById('exploreBox');
  if(!box) return;
  
  let posts = JSON.parse(localStorage.getItem('pixoro_v2_posts') || '[]');
  let likes = JSON.parse(localStorage.getItem('pixoro_likes') || '{}');
  
  // Trending - Neraya likes vaanguna post mela varum - Explore secret!
  let trending = [...posts].sort((a,b)=>{
    let aL = (likes[a.id] || []).length;
    let bL = (likes[b.id] || []).length;
    return bL - aL;
  });
  
  // Grid maari kaamu - Instagram Explore maari 3x3
  box.innerHTML = trending.map(p=>`
    <div class="explore-item" style="width:32%; aspect-ratio:1; display:inline-block; margin:2px; overflow:hidden; border-radius:5px;">
      <img src="${p.img}" style="width:100%; height:100%; object-fit:cover;" 
        onclick="location.href='#post-${p.id}'">
    </div>
  `).join('');
  
  if(trending.length === 0){
    box.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.5;">Explore la trending posts varum da! #tag use pannu!</div>`;
  }
}

// Search box ku
export function initSearch(){
  let input = document.getElementById('searchInput');
  if(!input) return;
  
  input.addEventListener('input', (e)=>{
    let q = e.target.value.trim();
    if(q.startsWith('#')){
      let results = searchByHashtag(q);
      let feed = document.getElementById('feedList');
      if(feed && results.length > 0){
        feed.innerHTML = results.map(p=>`
          <div class="ig-post">
            <img src="${p.img}" style="width:100%">
            <div style="padding:10px"><b>${p.user}</b> ${p.cap||''}</div>
          </div>
        `).join('');
      }
    }
  });
}

window.loadExplore = loadExplore;
window.searchByHashtag = searchByHashtag;
window.initSearch = initSearch;
