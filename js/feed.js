import { getCurrentUser, cleanUsername } from "./auth.js";
function cleanName(raw){
  if(!raw) return "Giri";
  let s = String(raw);
  try{ if(s.includes('"u"')){ let j = JSON.parse(s); if(j.u) return j.u; } }catch(e){}
  if(s.includes('{') || s.includes('"')) return "Giri";
  if(s.includes('@')) s = s.split('@')[0];
  return s.slice(0,20);
}
export function loadFeed(){
  const feed = document.getElementById('feedList'); if(!feed) return;
  let posts = []; try{ posts = JSON.parse(localStorage.getItem('pixoro_v2_posts')||'[]'); }catch(e){}
  posts = posts.map(p=>{ p.username = cleanName(p.username||p.user); return p; }).filter(p=>!p.username.includes('{'));
  let demo = [{username:'Giri', user:'Giri', cap:'🌍 V2 SECURE DA! No leak! @Giri only! 🔒', img:'https://picsum.photos/500/600?random=10', likes:2400, location:'Tiruchuli • V2'}];
  let all = [...posts,...demo];
  feed.innerHTML = all.map(p=>{
    let u = cleanName(p.username);
    return `<div class="ig-post"><div class="ig-post-header"><div class="ig-post-user"><img src="https://i.pravatar.cc/100?u=${u}"><div><b>@${u}</b> ✓</div></div></div><img class="ig-post-img" src="${p.img}"><div class="post-action-bar"><div>❤️ ${p.likes||0} 💬 12 ✈️</div></div><div style="padding:4px 12px 14px"><b>@${u}</b> ${p.cap}</div></div>`;
  }).join('');
}
window.loadFeed = loadFeed;
