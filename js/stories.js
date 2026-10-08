import { getCurrentUser } from "./auth.js";
export function loadStories(){
  let bar = document.getElementById('storyBar'); if(!bar) return;
  let user = getCurrentUser();
  let yourLabel = document.getElementById('yourStoryLabel'); if(yourLabel) yourLabel.innerText = '@'+user;
  let safeBase = `<div class="story-item" onclick="document.getElementById('fileInput').click()"><div class="story-ring" style="background:#333;display:flex;align-items:center;justify-content:center;font-size:24px">+</div><small id="yourStoryLabel">@${user}</small></div>`;
  let demo = [{user:'krikir58', img:'https://i.pravatar.cc/150?u=krikir58'}];
  bar.innerHTML = safeBase + demo.map(s=>`<div class="story-item"><div class="story-ring"><img src="${s.img}"></div><small>@${s.user}</small></div>`).join('');
}
window.loadStories = loadStories;
