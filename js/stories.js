import { clean, getUser } from './auth.js';

export function loadStories(){
  let stories=[]; try{stories=JSON.parse(localStorage.getItem('pixoro_stories')||'[]')}catch(e){}
  let now=Date.now();
  let valid=stories.filter(s=> (now - s.time) < 24*60*60*1000);
  if(valid.length!==stories.length) localStorage.setItem('pixoro_stories', JSON.stringify(valid));
  
  let box=document.getElementById('storyBox');
  let u=getUser();
  let add=`<div class="s" onclick="document.getElementById('fileInput').click()"><div class="r"><div>+</div></div><small>@${u}</small></div>`;
  let list=valid.map(s=>`<div class="s"><div class="r"><img src="${s.img}"></div><small>@${clean(s.user)}</small></div>`).join('');
  box.innerHTML=add+list+`<div class="s"><div class="r"><div>😎</div></div><small>@krikir58</small></div><div class="s"><div class="r"><div>🌍</div></div><small>@pixoro</small></div>`;
}

// File upload
document.getElementById('fileInput')?.addEventListener('change', e=>{
  let f=e.target.files[0]; if(!f) return;
  let r=new FileReader();
  r.onload=ev=>{
    let u=getUser();
    let stories=[]; try{stories=JSON.parse(localStorage.getItem('pixoro_stories')||'[]')}catch(e){}
    stories.unshift({user:u, img:ev.target.result, time:Date.now()});
    localStorage.setItem('pixoro_stories', JSON.stringify(stories.slice(0,20)));
    
    let posts=[]; try{posts=JSON.parse(localStorage.getItem('pixoro_posts')||'[]')}catch(e){}
    posts.unshift({username:u, img:ev.target.result, cap:'Tiruchuli to World 🌍 #pixoro'});
    localStorage.setItem('pixoro_posts', JSON.stringify(posts.slice(0,30)));
    location.reload();
  };
  r.readAsDataURL(f);
});
