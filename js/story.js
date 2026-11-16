// ===== PIXORO STORY - v1013 - REAL STORY + MY STORY DA =====
async function loadStories(){
  let bar = document.getElementById('storyBar'); if(!bar) return;
  let s = window.getSupa ? window.getSupa() : window.supa; if(!s) return;
  // ✅ 24hrs ku munnadi story mattum da
  let since = new Date(Date.now() - 24*60*60*1000).toISOString();
  let {data} = await s.from('stories').select('*').gte('created_at', since).order('created_at',{ascending:false}).limit(50);
  let list = data || [];
  // ✅ Group by user da - oru user ku oru circle thaan da
  let byUser = {};
  list.forEach(st=>{ let k = String(st.user_id||st.username); if(!byUser[k]) byUser[k] = []; byUser[k].push(st); });
  let myAvatar = (window.ME_ID && window.pixoroGetAvatar) ? window.pixoroGetAvatar(window.ME_ID) : 'https://ui-avatars.com/api/?name=P&background=ff5ea8&color=fff';
  let myName = window.ME_RAW || 'You';
  let myHasStory = !!byUser[String(window.ME_ID)];
  // ✅ MY STORY FIRST DA
  let html = `<div class="sItem" onclick="location.href='./story-upload.html'">
    <div class="sAddWrap"><img class="sAddImg" src="${myAvatar}"><div class="sAddPlus">+</div></div>
    <div class="sName">My Story</div></div>`;
  // ✅ REAL STORY - vera users oda story da
  Object.keys(byUser).forEach(k=>{
    if(k === String(window.ME_ID)) return; // En story ah thaniya kaamikka vendaam da
    let arr = byUser[k]; let first = arr[0];
    let uname = String(first.username || 'user').replace('@','');
    let avatar = window.pixoroGetAvatar ? window.pixoroGetAvatar(first) : first.avatar_url;
    let img = first.media_url || first.image_url || avatar;
    html += `<div class="sItem" onclick="location.href='./story.html?user=${first.user_id}'">
      <div class="sRing"><div class="sRingInner"><img src="${img}" onerror="this.src='${avatar}'"></div></div>
      <div class="sName">${uname}</div></div>`;
  });
  // ✅ Enakku story iruntha My Story ah click panna en story kaamikum da
  if(myHasStory){
    html = html.replace(`onclick="location.href='./story-upload.html'"`, `onclick="location.href='./story.html?user=${window.ME_ID}'"`);
  }
  bar.innerHTML = html;
  bar.style.display = 'flex';
}
window.loadStories = loadStories;
