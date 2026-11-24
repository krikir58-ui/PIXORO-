// ===== PIXORO STORY - v1003 - CORRECTED DA - G PROBLEM FIXED DA =====
async function loadStories(){
  let bar = document.getElementById('storyRow') || document.getElementById('storyBox') || document.getElementById('storyBar');
  if(!bar) return;

  function isRealPhoto(u){
    if(!u) return false;
    u = String(u);
    if(u.length < 20) return false;
    if(u.includes('ui-avatars')) return false;
    if(u.endsWith('/')) return false;
    if(u.includes('placeholder')) return false;
    return true;
  }

  // ✅ FIX 1 DA - navPfp la irunthu Edukka Koodathu da - Athulayum G thaan irukkum da
  function getMyPhotoFromPage(){
    if(isRealPhoto(window.MY_PFP)) return window.MY_PFP;
    if(isRealPhoto(window.ME_PFP)) return window.ME_PFP;
    try{
      let saved = JSON.parse(localStorage.getItem('pixoro_user') || '{}');
      if(isRealPhoto(saved.avatar_url)) return saved.avatar_url;
      if(isRealPhoto(saved.photo)) return saved.photo;
      if(isRealPhoto(saved.avatar)) return saved.avatar;
    }catch(e){}
    return '';
  }

  function paintMyPhoto(){
    let photo = getMyPhotoFromPage();
    if(!photo) return false;
    let img = document.getElementById('myStoryImg');
    let letter = document.getElementById('myStoryLetter');
    if(img){
      if(img.src !== photo) img.src = photo;
      img.style.display = 'block';
      img.onerror = () => { img.style.display = 'none'; if(letter) letter.style.display = 'grid'; };
    }
    if(letter) letter.style.display = 'none';
    return true;
  }

  // ✅ FIX 2 DA - First la G venaam da - Empty va Vechirom da
  bar.innerHTML = `<div class="sItem" onclick="location.href='./story-upload.html'">
    <div class="sAddWrap" style="position:relative;width:74px;height:74px">
      <img id="myStoryImg" class="sAddImg" src="" style="width:74px;height:74px;border-radius:50%;object-fit:cover;display:none">
      <div class="sLetter avaLetterHome" id="myStoryLetter" style="display:none;width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">G</div>
      <div class="sAddPlus" style="position:absolute;bottom:2px;right:2px;width:22px;height:22px;background:#0095f6;border:2px solid #000;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff;z-index:10">+</div>
    </div>
    <div class="sName">My Story</div></div>`;
  bar.style.display = 'flex';

  let tries = 0;
  let timer = setInterval(function(){ tries++; if(paintMyPhoto() || tries > 30) clearInterval(timer); }, 200);

  let s = null;
  for(let i=0;i<20;i++){ s = window.getSupa ? window.getSupa() : window.supa; if(s) break; await new Promise(r=> setTimeout(r, 200)); }
  if(!s) return;
  if(!window.ME_ID){ try{ let {data:{session}} = await s.auth.getSession(); if(session) window.ME_ID = session.user.id; }catch(e){} }

  let since = new Date(Date.now() - 24*60*60*1000).toISOString();
  let {data} = await s.from('stories').select('*').gte('created_at', since).order('created_at',{ascending:false}).limit(50);
  let list = data || [];
  let byUser = {};
  list.forEach(st=>{ let k = String(st.user_id||st.username); if(!byUser[k]) byUser[k] = []; byUser[k].push(st); });
  let profMap = {};
  try{ let r = await s.from('profiles').select('id,username,avatar_url').limit(200); (r.data||[]).forEach(p=>{ profMap[String(p.id)] = p; }); }catch(e){}

  let myAvatar = getMyPhotoFromPage();
  let myName = window.ME_RAW || 'You';
  try{
    const { data: { user } } = await s.auth.getUser();
    if(user){
      if(!window.ME_ID) window.ME_ID = user.id;
      const { data: prof } = await s.from('profiles').select('avatar_url,username').eq('id', user.id).single();
      if(prof){
        let p = String(prof.avatar_url || '').trim();
        if(isRealPhoto(p)){ myAvatar = p; window.MY_PFP = p; window.ME_PFP = p; }
        if(prof.username) myName = prof.username;
      }
    }
  }catch(e){}

  let myFirst = String(myName || 'G').replace('@','').charAt(0).toUpperCase();
  // ✅ FIX 3 DA - Avatar iruntha Letter ah Kaata Koodathu da
  let myImg = `<img id="myStoryImg" class="sAddImg" src="${myAvatar}" style="width:74px;height:74px;border-radius:50%;object-fit:cover;display:${isRealPhoto(myAvatar) ? 'block' : 'none'}" onerror="this.style.display='none';let l=document.getElementById('myStoryLetter');if(l)l.style.display='grid'">`;
  let myLetterHtml = `<div class="sLetter avaLetterHome" id="myStoryLetter" style="display:${isRealPhoto(myAvatar) ? 'none' : 'grid'};width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">${myFirst}</div>`;
  let myHasStory = !!byUser[String(window.ME_ID)];
  let myLink = myHasStory ? `./story.html?user=${window.ME_ID}` : './story-upload.html';
  let html = `<div class="sItem" onclick="location.href='${myLink}'">
    <div class="sAddWrap" style="position:relative;width:74px;height:74px">${myImg}${myLetterHtml}<div class="sAddPlus" style="position:absolute;bottom:2px;right:2px;width:22px;height:22px;background:#0095f6;border:2px solid #000;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff;z-index:10">+</div></div>
    <div class="sName">My Story</div></div>`;

  Object.keys(byUser).forEach(k=>{
    if(k === String(window.ME_ID)) return;
    let arr = byUser[k]; let first = arr[0];
    let uname = String(first.username || profMap[k]?.username || 'user').replace('@','').toLowerCase();
    let prof = profMap[k] || {};
    let avatar = String(prof.avatar_url || '').trim();
    let letter = uname.charAt(0).toUpperCase();
    let imgHtml = isRealPhoto(avatar) ? `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" onerror="this.remove();this.parentElement.querySelector('.sLetter2').style.display='grid'">` : '';
    let letterHtml = `<div class="sLetter2" style="display:${isRealPhoto(avatar) ? 'none' : 'grid'};width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">${letter}</div>`;
    html += `<div class="sItem" onclick="location.href='./story.html?user=${first.user_id}'">
      <div class="sRing" style="width:74px;height:74px;padding:3px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00)"><div class="sRingInner" style="position:relative;width:100%;height:100%;border-radius:50%;background:#000;padding:2px">${imgHtml}${letterHtml}</div></div>
      <div class="sName">${uname}</div></div>`;
  });

  bar.innerHTML = html;
  bar.style.display = 'flex';
  paintMyPhoto();

  // ✅ FIX 4 DA - Kadasiyila Supabase la irunthu Direct ah Sync pannu da
  setTimeout(async () => {
    try{
      let {data:{user}} = await s.auth.getUser();
      if(!user) return;
      let {data: prof} = await s.from('profiles').select('avatar_url').eq('id', user.id).single();
      let p = String(prof?.avatar_url || '').trim();
      console.log('MY AVATAR CHECK DA:', p);
      if(isRealPhoto(p)){
        window.MY_PFP = p;
        let img = document.getElementById('myStoryImg');
        let letter = document.getElementById('myStoryLetter');
        if(img){ img.src = p; img.style.display = 'block'; }
        if(letter) letter.style.display = 'none';
      }
    }catch(e){}
  }, 1000);

  let outer = document.getElementById('storyBar'); if(outer) outer.style.display = 'flex';
  let box = document.getElementById('storyBox'); if(box) box.style.display = 'flex';
}
window.loadStories = loadStories;
if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', ()=> loadStories()); } else { loadStories(); }
