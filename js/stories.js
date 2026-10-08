import { supabase } from './supabase.js';
import { clean, getUser } from './auth.js';
import { loadFeed } from './feed.js';

export async function loadStories(){
  let { data: stories } = await supabase.from('stories').select('*').order('created_at', {ascending:false}).limit(20);
  if(!stories) stories=[];
  // 24hr filter
  let now=Date.now();
  let valid=stories.filter(s=> (now - new Date(s.created_at).getTime()) < 24*60*60*1000);

  let box=document.getElementById('storyBox');
  let u=getUser();
  let add=`<div class="s" onclick="document.getElementById('fileInput').click()"><div class="r"><div>+</div></div><small>@${u}</small></div>`;
  let list=valid.map(s=>`<div class="s"><div class="r"><img src="${s.img}"></div><small>@${clean(s.username)}</small></div>`).join('');
  box.innerHTML=add+list;
}

// File upload - REAL Supabase ku pogum!
document.getElementById('fileInput')?.addEventListener('change', async e=>{
  let f=e.target.files[0]; if(!f) return;
  let r=new FileReader();
  r.onload=async ev=>{
    let u=getUser();
    let img=ev.target.result;

    // 1. Story table la save
    await supabase.from('stories').insert([{username:u, img:img}]);
    // 2. Posts table la save - ELLARUKUM THERIYUM!
    await supabase.from('posts').insert([{username:u, img:img, cap:`Tiruchuli to World 🌍 #pixoro`}]);

    alert('🔥 Uploaded da Giri! Real DB la save aayiduchu!');
    location.reload();
  };
  r.readAsDataURL(f);
});
