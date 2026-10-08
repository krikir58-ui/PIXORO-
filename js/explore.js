import { loadFeed } from './feed.js';

export function loadExplore(){
  let posts=[]; try{posts=JSON.parse(localStorage.getItem('pixoro_posts')||'[]')}catch(e){}
  let box=document.getElementById('exploreBox');
  if(posts.length===0){ box.innerHTML=''; return; }
  box.innerHTML=posts.map(p=>`
    <div style="width:32%; aspect-ratio:1; background:#111">
      <img src="${p.img}" style="width:100%; height:100%; object-fit:cover" onclick="document.getElementById('feedList').scrollIntoView()">
    </div>
  `).join('');
}

export function initSearch(){
  document.getElementById('searchBtn')?.addEventListener('click', ()=>{
    let sb=document.getElementById('searchBox');
    sb.style.display = sb.style.display==='none' ? 'block' : 'none';
  });
  document.getElementById('searchInput')?.addEventListener('input', e=>{
    let q=e.target.value.trim();
    if(q.startsWith('#') || q.length>1) loadFeed(q);
    else if(q==='') loadFeed();
  });
}
