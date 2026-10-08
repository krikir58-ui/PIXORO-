import { clean, getUser } from './auth.js';
export function loadFeed(filterTag=null){
  let posts=[]; try{posts=JSON.parse(localStorage.getItem('pixoro_posts')||'[]')}catch(e){}
  let demo=[
    {username:'Giri', img:'https://picsum.photos/500/600?random=11', cap:'Tiruchuli to World 🌍 #world'},
    {username:'krikir58', img:'https://picsum.photos/500/600?random=12', cap:'Welcome to Pixoro 🔥 #pixoro'}
  ];
  let all=[...posts,...demo];
  if(filterTag) all = all.filter(p=> (p.cap||'').toLowerCase().includes(filterTag.toLowerCase()));
  all.sort((a,b)=>{
    let al = JSON.parse(localStorage.getItem('pixoro_like_'+a.img)||'[]').length;
    let bl = JSON.parse(localStorage.getItem('pixoro_like_'+b.img)||'[]').length;
    return bl-al;
  });
  document.getElementById('feedList').innerHTML = all.map(p=>{
    let likes=JSON.parse(localStorage.getItem('pixoro_like_'+p.img)||'[]');
    let views=JSON.parse(localStorage.getItem('pixoro_view_'+p.img)||'[]');
    return `<div class="post">
      <div class="post-top"><img src="https://i.pravatar.cc/100?u=${p.username}"><b>@${clean(p.username)}</b></div>
      <img class="post-img" src="${p.img}" ondblclick="window.doLike('${p.img}')">
      <div class="post-cap">
        <div style="display:flex;gap:10px;font-size:18px">${likes.includes(getUser())?'❤️':'🤍'} ${likes.length} <span style="margin-left:auto;font-size:12px;opacity:0.6">${views.length} views</span></div>
        <b>@${clean(p.username)}</b> ${p.cap}
      </div>
    </div>`;
  }).join('');
}
