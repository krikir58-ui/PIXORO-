import { supabase } from './supabase.js';
import { clean, getUser } from './auth.js';
import { loadFeed } from './feed.js';

export async function loadStories(){
  let { data } = await supabase.from('stories').select('*').order('created_at',{ascending:false}).limit(15);
  let now=Date.now();
  let valid=(data||[]).filter(s=> (now - new Date(s.created_at).getTime()) < 24*60*60*1000);
  let box=document.getElementById('storyBox');
  let u=getUser();
  let add=`<div class="s" onclick="document.getElementById('fileInput').click()"><div class="r"><div>+</div></div><small>@${u}</small></div>`;
  // Duplicate @Giri remove pannu - Unique username mattum
  let uniq={}; valid.forEach(s=>{ uniq[s.username]=s; });
  let list=Object.values(uniq).map(s=>`<div class="s" onclick="window.viewStory('${s.img}')"><div class="r"><img src="${s.img}"></div><small>@${clean(s.username)}</small></div>`).join('');
  box.innerHTML=add+list+`<div class="s"><div class="r"><div>🌍</div></div><small>@pixoro</small></div>`;
}

window.viewStory=(img)=>{
  let d=document.createElement('div');
  d.style.cssText='position:fixed; inset:0; background:#000; z-index:9999; display:flex; align-items:center; justify-content:center';
  d.innerHTML=`<img src="${img}" style="width:100%; max-width:500px; height:100%; object-fit:contain" onclick="this.parentElement.remove()"><div style="position:absolute; top:20px; right:20px; color:#fff; font-size:24px">✕</div>`;
  d.onclick=()=>d.remove();
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 4000);
};
