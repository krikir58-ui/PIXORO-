// V2 SECURE STORY - NO {"u","p"} LEAK
function cleanUsername(raw){
  if(!raw) return "Giri";
  let s = String(raw).trim();
  try{
    if(s.includes('"u"')){
      let j = JSON.parse(s);
      if(j.u) return j.u;
    }
  }catch(e){}
  if(s.includes('{') || s.includes('"')) return "Giri";
  if(s.includes('@')) s = s.split('@')[0];
  return s.slice(0,20);
}
export function loadStories(){
  let bar = document.getElementById('storyBar'); if(!bar) return;
  let user = cleanUsername(localStorage.getItem('pixoro_v2_user') || localStorage.getItem('username') || 'Giri');
  let yourLabel = document.getElementById('yourStoryLabel') || document.getElementById('yourStoryName');
  if(yourLabel) yourLabel.innerText = '@'+user;
  let safeBase = `<div class="story-item" onclick="document.getElementById('fileInput').click()"><div class="story-ring" style="background:#333;display:flex;align-items:center;justify-content:center;font-size:24px">+</div><small id="yourStoryLabel">@${user}</small></div>`;
  bar.innerHTML = safeBase + `<div class="story-item"><div class="story-ring"><img src="https://i.pravatar.cc/150?u=krikir58"></div><small>@krikir58</small></div>`;
}
window.loadStories = loadStories;
