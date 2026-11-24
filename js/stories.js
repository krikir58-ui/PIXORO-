// ===== PIXORO STORY - v9999 - CORRECTED DA - EMPTY BAR FIX DA =====
async function loadStories(){
  let bar = document.getElementById('storyRow') || document.getElementById('storyBox') || document.getElementById('storyBar');
  if(!bar) return;

  // ✅ FIX 1 DA - MUDHALA MY STORY AH KAATIDU DA - Supa Late aanaalum Bar Empty aagaathu da
  bar.innerHTML = `<div class="sItem" onclick="location.href='./story-upload.html'">
    <div class="sAddWrap" style="position:relative;width:62px;height:62px">
      <div class="sLetter avaLetterHome" style="display:grid;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">Y</div>
      <div class="sAddPlus" style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:#0095f6;border:2px solid #000;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff">+</div>
    </div>
    <div class="sName">My Story</div></div>`;
  bar.style.display = 'flex';

  // ✅ FIX 2 DA - Supa Varra Varaikkum Wait pannu da - Odane Return aaga Kudathu da
  let s = null;
  for(let i=0;i<20;i++){
    s = window.getSupa ? window.getSupa() : window.supa;
    if(s) break;
    await new Promise(r=> setTimeout(r, 200));
  }
  if(!s) return;

  // ✅ ME_ID Illana Edu da
  if(!window.ME_ID){
    try{
      let {data:{session}} = await s.auth.getSession();
      if(session) window.ME_ID = session.user.id;
    }catch(e){}
  }

  // ✅ 24hrs ku munnadi story mattum da
  let since = new Date(Date.now() - 24*60*60*1000).toISOString();
  let {data} = await s.from('stories').select('*').gte('created_at', since).order('created_at',{ascending:false}).limit(50);
  let list = data || [];

  // ✅ Group by user da - oru user ku oru circle thaan da
  let byUser = {};
  list.forEach(st=>{ let k = String(st.user_id||st.username); if(!byUser[k]) byUser[k] = []; byUser[k].push(st); });

  // ✅ FIXED DA - avatar_url mattum thaan da
  let profMap = {};
  try{
    let r = await s.from('profiles').select('id,username,avatar_url').limit(200);
    (r.data||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  // ✅ MY AVATAR - OREY PHOTO DA - Profile la irukka photo thaan da
  let myAvatar = window.MY_PFP || window.ME_PFP || '';
  let myName = window.ME_RAW || 'You';
  try{
    const { data: { user } } = await s.auth.getUser();
    if(user){
      if(!window.ME_ID) window.ME_ID = user.id;
      const { data: prof } = await s.from('profiles').select('avatar_url,username').eq('id', user.id).single();
      if(prof){
        let p = String(prof.avatar_url || '').trim();
        if(p) myAvatar = p;
        if(prof.username) myName = prof.username;
        window.MY_PFP = myAvatar; window.ME_PFP = myAvatar;
      }
    }
  }catch(e){}
  // ✅ FIXED DA - Y nu hardcode vendaam da - Un name oda first letter thaan da
  let myFirst = String(myName || 'Y').replace('@','').charAt(0).toUpperCase();
  let myImg = myAvatar ? `<img class="sAddImg" src="${myAvatar}" style="width:62px;height:62px;border-radius:50%;object-fit:cover" onerror="this.remove();this.parentElement.querySelector('.sLetter').style.display='grid'">` : '';
  let myLetterHtml = `<div class="sLetter avaLetterHome" style="display:${myAvatar ? 'none' : 'grid'};width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">${myFirst}</div>`;

  let myHasStory = !!byUser[String(window.ME_ID)];

  // ✅ MY STORY FIRST DA - Pixoro Style Circle + Plus - Orey Photo da
  let myLink = myHasStory ? `./story.html?user=${window.ME_ID}` : './story-upload.html';
  let html = `<div class="sItem" onclick="location.href='${myLink}'">
    <div class="sAddWrap" style="position:relative;width:62px;height:62px">${myImg}${myLetterHtml}<div class="sAddPlus" style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:#0095f6;border:2px solid #000;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff">+</div></div>
    <div class="sName">My Story</div></div>`;

  // ✅ REAL STORY - Profile Photo mattum thaan da, Story Photo illa da
  Object.keys(byUser).forEach(k=>{
    if(k === String(window.ME_ID)) return;
    let arr = byUser[k]; let first = arr[0];
    let uname = String(first.username || profMap[k]?.username || 'user').replace('@','').toLowerCase();
    let prof = profMap[k] || {};
    let avatar = String(prof.avatar_url || '').trim();
    let letter = uname.charAt(0).toUpperCase();
    let imgHtml = avatar ? `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" onerror="this.remove();this.parentElement.querySelector('.sLetter2').style.display='grid'">` : '';
    let letterHtml = `<div class="sLetter2" style="display:${avatar ? 'none' : 'grid'};width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">${letter}</div>`;
    html += `<div class="sItem" onclick="location.href='./story.html?user=${first.user_id}'">
      <div class="sRing" style="width:62px;height:62px;padding:3px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00)"><div class="sRingInner" style="position:relative;width:100%;height:100%;border-radius:50%;background:#000;padding:2px">${imgHtml}${letterHtml}</div></div>
      <div class="sName">${uname}</div></div>`;
  });

  bar.innerHTML = html;
  bar.style.display = 'flex';
  let outer = document.getElementById('storyBar');
  if(outer) outer.style.display = 'flex';
  let box = document.getElementById('storyBox');
  if(box) box.style.display = 'flex';
}
window.loadStories = loadStories;
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=> loadStories());
} else {
  loadStories();
}
