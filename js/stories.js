// PIXORO STORY SYSTEM - SECRET NO 3 - 24HR AUTO DELETE
function getUser(){
  let u = localStorage.getItem('pixoro_v2_user') || 'Giri';
  try{ if(String(u).trim().startsWith('{')) u=JSON.parse(u).u||'Giri'; }catch(e){}
  return String(u).replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || 'Giri';
}

// Story add pannu
export function addStory(img){
  let key = 'pixoro_stories';
  let stories = JSON.parse(localStorage.getItem(key) || '[]');
  stories.push({
    id: 'story_'+Date.now(),
    user: getUser(),
    img: img,
    time: Date.now() // Ithu than main secret!
  });
  localStorage.setItem(key, JSON.stringify(stories));
  loadStories();
}

// 24hr check - Instagram secret formula
function isExpired(storyTime){
  let now = Date.now();
  let twentyFourHours = 24 * 60 * 60 * 1000; // 24hrs in ms
  return (now - storyTime) > twentyFourHours;
}

export function loadStories(){
  let box = document.getElementById('storyBox');
  if(!box) return;
  
  let stories = JSON.parse(localStorage.getItem('pixoro_stories') || '[]');
  
  // 24hr ku mela irukkura story ah auto delete - SECRET!
  let activeStories = stories.filter(s => !isExpired(s.time));
  
  // Expired ah delete pannu
  if(activeStories.length !== stories.length){
    localStorage.setItem('pixoro_stories', JSON.stringify(activeStories));
    console.log('Expired stories deleted:', stories.length - activeStories.length);
  }
  
  // Active story mattum kaamu
  box.innerHTML = activeStories.map(s=>`
    <div class="story-item" style="text-align:center; margin-right:10px;">
      <div style="width:60px; height:60px; border-radius:50%; border:3px solid #ff3040; padding:2px;">
        <img src="${s.img}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
      </div>
      <small>${s.user}</small>
    </div>
  `).join('');
  
  if(activeStories.length === 0){
    box.innerHTML = `<div style="padding:10px; opacity:0.5;">No stories - 24hr la delete aayidum da!</div>`;
  }
}

// Auto check every 1 minute
setInterval(loadStories, 60*1000);

window.addStory = addStory;
window.loadStories = loadStories;
