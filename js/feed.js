import { getCurrentUser, cleanUsername } from "./auth.js";

function cleanName(raw){
  if(!raw) return "Giri";
  let s = String(raw);
  try{ if(s.includes('{"')){ let j = JSON.parse(s); if(j.u) return j.u; } }catch(e){}
  if(s.includes('{') || s.includes('"}')) return "Giri";
  if(s.includes('@')) s = s.split('@')[0];
  return s.slice(0,20);
}

function rankPosts(posts){
  let me = localStorage.getItem('pixoro_v2_user') || 'Giri';
  try{ if(me.trim().startsWith('{')) me=JSON.parse(me).u||'Giri'; }catch(e){}
  me = me.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20);

  let following = JSON.parse(localStorage.getItem('pixoro_following_'+me) || localStorage.getItem('fl_'+me) || '[]');

  return posts.sort((a,b)=>{
    let aScore = 0, bScore = 0;
    if(following.includes(a.user)) aScore += 100;
    if(following.includes(b.user)) bScore += 100;

    let aLikes = JSON.parse(localStorage.getItem('pixoro_like_'+a.id) || localStorage.getItem('lk_'+a.id) || '[]').length;
    let bLikes = JSON.parse(localStorage.getItem('pixoro_like_'+b.id) || localStorage.getItem('lk_'+b.id) || '[]').length;
    aScore += aLikes;
    bScore += bLikes;

    let now = Date.now();
    if(now - (a.time||0) < 24*60*60*1000) aScore += 50;
    if(now - (b.time||0) < 24*60*60*1000) bScore += 50;

    return bScore - aScore;
  });
}

export function loadFeed(){
  const feed = document.getElementById('feedList');
  if(!feed) return;

  let posts = [];
  try{ posts = JSON.parse(localStorage.getItem('pixoro_v2_posts') || '[]'); }catch(e){}

  posts = posts.map(p=>{ p.username = cleanName(p.username||p.user); p.user = p.username; return p; }).filter(p=>!p.username.includes('{'));

  let demo = [{id:'demo1', username:'Giri', user:'Giri', cap:'🔒 V2 SECURE DA! No leak! @Giri only!', img:'https://picsum.photos/500/500?random=1', time: Date.now()}];

  let all = [...posts,...demo];
  let ranked = rankPosts(all);

  feed.innerHTML = ranked.map(p=>{
    let u = cleanName(p.username);
    return `<div class="ig-post">
      <div class="ig-post-header">
        <div class="ig-post-user"><img src="https://i.pravatar.cc/100?u=${u}"><b>${u}</b></div>
      </div>
      <img src="${p.img}" style="width:100%">
      <div style="padding:10px"><b>${u}</b> ${p.cap||''}</div>
    </div>`;
  }).join('');
}

window.loadFeed = loadFeed;
window.rankPosts = rankPosts;
