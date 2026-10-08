import { supabase } from './supabase.js';
import { clean, getUser } from './auth.js';

export async function loadFeed(filterTag=null){
  let { data: posts, error } = await supabase.from('posts').select('*').order('created_at', {ascending:false}).limit(30);
  if(error){ console.log(error); posts=[]; }
  if(!posts) posts=[];
  if(filterTag) posts = posts.filter(p=> (p.cap||'').toLowerCase().includes(filterTag.toLowerCase()));

  let box = document.getElementById('feedList');
  if(!box) return;
  if(posts.length===0){
    box.innerHTML = `<div style="padding:40px;text-align:center;opacity:0.5">No posts yet da Giri! First photo upload pannu! 📸</div>`;
    return;
  }

  box.innerHTML = posts.map(p=>{
    return `<div class="post">
      <div class="post-top"><img src="https://i.pravatar.cc/100?u=${p.username}"><b>@${clean(p.username)}</b></div>
      <img class="post-img" src="${p.img}" onerror="this.src='https://picsum.photos/500/600?random=11'" ondblclick="window.doLike('${p.id}')">
      <div class="post-cap">
        <div style="display:flex;gap:12px;font-size:18px;margin-bottom:6px"><span onclick="window.doLike('${p.id}')">🤍 Like</span><span style="margin-left:auto;font-size:11px;opacity:0.5">${new Date(p.created_at).toLocaleDateString()}</span></div>
        <b>@${clean(p.username)}</b> ${p.cap||''}
      </div>
    </div>`;
  }).join('');
}
