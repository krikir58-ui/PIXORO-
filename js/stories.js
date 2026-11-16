// ===== PIXORO STORY - v1018 - REAL AVATAR ONLY + MY STORY DA =====
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

  // ✅ MY AVATAR - SERVER ONLY - Real Profile Photo da
  let myAvatar = '';
  let myName = window.ME_RAW || 'You';
  try{
    const { data: { user } } = await s.auth.getUser();
    if(user){
      const { data: prof } = await s.from('profiles').select('avatar_url, username').eq('id', user.id).single();
      if(prof){
        if(prof.avatar_url) myAvatar = prof.avatar_url;
        if(prof.username) myName = prof.username;
      }
    }
  }catch(e){}
  if(!myAvatar) myAvatar = (window.ME_ID && window.pixoroGetAvatar) ? window.pixoroGetAvatar(window.ME_ID) : 'https://ui-avatars.com/api/?name=P&background=111&color=fff&size=200&bold=true';

  let myHasStory = !!byUser[String(window.ME_ID)];

  // ✅ MY STORY FIRST DA - Pixoro Style Circle + Plus
  let html = `<div class="sItem" onclick="location.href='./story-upload.html'">
    <div class="sAddWrap"><img class="sAddImg" src="${myAvatar}" onerror="this.src='https://ui-avatars.com/api/?name=P&background=111&color=fff&size=200&bold=true'"><div class="sAddPlus">+</div></div>
    <div class="sName">My Story</div></div>`;

  // ✅ REAL STORY - Avatar mattum thaan da, Story Photo illa da
  Object.keys(byUser).forEach(k=>{
    if(k === String(window.ME_ID)) return; // En story ah thaniya kaamikka vendaam da
    let arr = byUser[k]; let first = arr[0];
    let uname = String(first.username || 'user').replace('@','');
    // ✅ FIX DA - media_url ah edukka koodathu da, avatar mattum thaan da
    let avatar = first.avatar_url || (window.pixoroGetAvatar ? window.pixoroGetAvatar(first) : '');
    if(!avatar) avatar = 'https://ui-avatars.com/api/?name=' + uname.charAt(0).toUpperCase() + '&background=111&color=fff&size=200&bold=true';
    // ✅ Background remove - avatar mattum
    html += `<div class="sItem" onclick="location.href='./story.html?user=${first.user_id}'">
      <div class="sRing"><div class="sRingInner"><img src="${avatar}" onerror="this.src='https://ui-avatars.com/api/?name=${uname.charAt(0).toUpperCase()}&background=111&color=fff&size=200&bold=true'"></div></div>
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
