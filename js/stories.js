import { supabase } from './supabase.js';
import { clean, getUser } from './auth.js';
import { loadFeed } from './feed.js';

export async function loadStories(){
  let { data } = await supabase.from('stories').select('*').order('created_at',{ascending:false}).limit(30);
  let now = Date.now();
  // 24 Hours Filter
  let valid = (data||[]).filter(s => (now - new Date(s.created_at).getTime()) < 24*60*60*1000);

  let box = document.getElementById('storyBox');
  if(!box) return;

  let u = getUser();
  let seenStories = JSON.parse(localStorage.getItem('pixoro_seen') || '[]');

  // Group by username - oru aalukku pala story irukkalam
  let grouped = {};
  valid.forEach(s => {
    if(!grouped[s.username]) grouped[s.username] = [];
    grouped[s.username].push(s);
  });

  let addBtn = `
  <div class="s" onclick="document.getElementById('fileInput').click()" style="cursor:pointer">
    <div class="r" style="background: #111; border:2px dashed #333; display:flex;align-items:center;justify-content:center;">
      <div style="font-size:22px">+</div>
    </div>
    <small>Your Story</small>
  </div>`;

  let list = Object.keys(grouped).map(username => {
    let stories = grouped[username];
    let isSeen = seenStories.includes(username);
    // Seen na grey border, Unseen na rainbow
    let ringStyle = isSeen
     ? `background: #333;`
      : `background: conic-gradient(from 0deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75);`;

    return `
    <div class="s" onclick="window.viewStoryGroup('${username}')" style="cursor:pointer">
      <div class="r" style="${ringStyle} padding:2.5px;">
        <div style="background:#000; padding:2px; border-radius:50%;">
          <img src="${stories[0].img}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:block;">
        </div>
      </div>
      <small>@${clean(username)}</small>
    </div>`;
  }).join('');

  box.innerHTML = addBtn + list + `<div class="s"><div class="r"><div style="font-size:20px">🌍</div></div><small>@pixoro</small></div>`;

  // Store for viewer
  window._pixoroGroupedStories = grouped;
}

// MASS STORY VIEWER - Instagram Style
window.viewStoryGroup = (username) => {
  let grouped = window._pixoroGroupedStories;
  let stories = grouped[username] || [];
  if(stories.length === 0) return;

  let currentIndex = 0;
  let isGhost = localStorage.getItem('pixoro_ghost') === 'true'; // Ghost Mode

  let d = document.createElement('div');
  d.id = 'pixoroStoryViewer';
  d.style.cssText = 'position:fixed; inset:0; background:#000; z-index:9999; display:flex; flex-direction:column;';

  function renderStory() {
    let s = stories[currentIndex];
    d.innerHTML = `
      <div style="display:flex; gap:3px; padding:8px;">
        ${stories.map((_,i) => `<div style="flex:1; height:2px; background:${i < currentIndex? '#fff' : i === currentIndex? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}; position:relative"><div id="prog${i}" style="height:100%; background:#fff; width:${i===currentIndex?'0%':'0%'}; transition:${i===currentIndex?'width 5s linear':''}"></div></div>`).join('')}
      </div>
      <div style="padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${s.img}" style="width:32px; height:32px; border-radius:50%;">
          <b style="color:#fff; font-size:14px">@${clean(username)}</b>
          <span style="color:#aaa; font-size:11px">• 2h ago</span>
          ${isGhost? '<span style="background:#222; color:#00BFFF; font-size:10px; padding:2px 6px; border-radius:10px; margin-left:8px">👻 Ghost</span>' : ''}
        </div>
        <span style="color:#fff; font-size:22px; cursor:pointer" onclick="document.getElementById('pixoroStoryViewer').remove()">✕</span>
      </div>
      <div style="flex:1; display:flex; align-items:center; justify-content:center; position:relative;" onclick="nextStory()">
        <img src="${s.img}" style="width:100%; max-width:500px; max-height:80vh; object-fit:contain;">
        <div style="position:absolute; left:0; top:0; bottom:0; width:30%; cursor:pointer" onclick="event.stopPropagation(); prevStory()"></div>
        <div style="position:absolute; right:0; top:0; bottom:0; width:70%; cursor:pointer" onclick="event.stopPropagation(); nextStory()"></div>
      </div>
      <div style="padding:15px; display:flex; gap:10px;">
        <input placeholder="Reply to @${username}..." style="flex:1; background:#222; border:1px solid #333; color:#fff; padding:10px 15px; border-radius:20px;">
        <span style="font-size:22px">❤️</span><span style="font-size:22px">📤</span>
      </div>
    `;
    document.body.appendChild(d);

    // Progress Animation
    setTimeout(() => {
      let prog = document.getElementById(`prog${currentIndex}`);
      if(prog) prog.style.width = '100%';
    }, 100);

    // Mark as seen (if not ghost mode)
    if(!isGhost){
      let seen = JSON.parse(localStorage.getItem('pixoro_seen') || '[]');
      if(!seen.includes(username)){
        seen.push(username);
        localStorage.setItem('pixoro_seen', JSON.stringify(seen));
      }
    }

    // Auto Next
    window._storyTimer = setTimeout(() => nextStory(), 5000);
  }

  window.nextStory = () => {
    clearTimeout(window._storyTimer);
    currentIndex++;
    if(currentIndex >= stories.length){
      d.remove();
      loadStories(); // Refresh ring to grey
    } else {
      d.innerHTML = '';
      renderStory();
    }
  }
  window.prevStory = () => {
    clearTimeout(window._storyTimer);
    currentIndex = Math.max(0, currentIndex-1);
    d.innerHTML = '';
    renderStory();
  }

  renderStory();
};

// Simple view for single image (old function backup)
window.viewStory = (img) => {
  window.viewStoryGroup = window.viewStoryGroup || (()=>{});
  // Find user for this img
  let grouped = window._pixoroGroupedStories || {};
  for(let u in grouped){
    if(grouped[u].some(s => s.img === img)){
      return window.viewStoryGroup(u);
    }
  }
  // Fallback old style
  let d = document.createElement('div');
  d.style.cssText='position:fixed; inset:0; background:#000; z-index:9999; display:flex; align-items:center; justify-content:center';
  d.innerHTML=`<img src="${img}" style="width:100%; max-width:500px; height:100%; object-fit:contain"><div style="position:absolute; top:20px; right:20px; color:#fff; font-size:24px">✕</div>`;
  d.onclick=()=>d.remove();
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 4000);
};
