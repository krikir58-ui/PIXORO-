// PIXORO REELS SYSTEM - SECRET NO 4 - 3 SEC VIEW COUNT
function getUser(){
  let u = localStorage.getItem('pixoro_v2_user') || 'Giri';
  try{ if(String(u).trim().startsWith('{')) u=JSON.parse(u).u||'Giri'; }catch(e){}
  return String(u).replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || 'Giri';
}

let views = JSON.parse(localStorage.getItem('pixoro_reel_views') || '{}');
let watchTimers = {};

// 3 Second Secret - Instagram formula!
export function startWatching(reelId, videoEl){
  if(watchTimers[reelId]) clearTimeout(watchTimers[reelId]);

  // 3 sec paatha than view!
  watchTimers[reelId] = setTimeout(()=>{
    addView(reelId);
  }, 3000); // 3000ms = 3 sec

  // Video pause panna timer cancel
  videoEl.addEventListener('pause', ()=> {
    if(watchTimers[reelId]) clearTimeout(watchTimers[reelId]);
  });

  // Loop aana kooda view!
  videoEl.addEventListener('ended', ()=> {
    addView(reelId);
  });
}

function addView(reelId){
  if(!views[reelId]) views[reelId] = [];

  let user = getUser();
  let now = Date.now();

  // Same person 1hr kazhichu than thirumba count
  let lastView = views[reelId].find(v => v.user === user);
  if(lastView && (now - lastView.time < 60*60*1000)){
    return; // 1hr ku munadi paatha count pannathe!
  }

  views[reelId].push({user, time: now});
  localStorage.setItem('pixoro_reel_views', JSON.stringify(views));
  updateViewCount(reelId);

  console.log('Reel View +1:', reelId, 'Total:', views[reelId].length);
}

function updateViewCount(reelId){
  let count = (views[reelId] || []).length;
  let el = document.getElementById('view-count-'+reelId);
  if(el) el.innerText = count + ' views';
  // Instagram maari 1000 = 1K
  if(el && count >= 1000){
    el.innerText = (count/1000).toFixed(1) + 'K views';
  }
}

export function getViews(reelId){
  return (views[reelId] || []).length;
}

export function loadReels(){
  let reels = JSON.parse(localStorage.getItem('pixoro_reels') || '[]');
  let box = document.getElementById('reelsBox');
  if(!box) return;

  box.innerHTML = reels.map(r=>{
    let v = getViews(r.id);
    return `
      <div class="reel-item" style="margin-bottom:20px;">
        <video id="video-${r.id}" src="${r.video}" style="width:100%; border-radius:10px;" controls muted loop
          onplay="startWatching('${r.id}', this)"></video>
        <div style="padding:5px;">
          <b>${r.user}</b> - <span id="view-count-${r.id}">${v} views</span>
        </div>
      </div>
    `;
  }).join('');
}

window.startWatching = startWatching;
window.loadReels = loadReels;
window.getViews = getViews;
