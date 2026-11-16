// ===== PIXORO STORY - v1022 - OREY PROFILE PHOTO ELLA PAGE KUM DA =====
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

  // ✅ Profiles la irunthu Real Photo va edu da - Story la avatar illa da
  let profMap = {};
  try{
    let r = await s.from('profiles').select('id,username,avatar_url,profile_pic,photo_url').limit(200);
    (r.data||[]).forEach(p=>{ profMap[String(p.id)] = p; });
  }catch(e){}

  // ✅ MY AVATAR - OREY PHOTO DA - Profile la irukka photo thaan da
  let myAvatar = window.MY_PFP || window.ME_PFP || '';
  let myName = window.ME_RAW || 'You';
  try{
    const { data: { user } } = await s.auth.getUser();
    if(user){
      const { data: prof } = await s.from('profiles').select('avatar_url,profile_pic,photo_url,username').eq('id', user.id).single();
      if(prof){
        let p = String(prof.avatar_url || prof.profile_pic || prof.photo_url || '').trim();
        if(p) myAvatar = p;
        if(prof.username) myName = prof.username;
        // ✅ Orey Photo va save pannidu da - Feed kum ithu thaan da
        window.MY_PFP = myAvatar; window.ME_PFP = myAvatar;
      }
    }
  }catch(e){}
  // ✅ Photo illa na Letter thaan da - Karuppu Block vendaam da
  let myLetter = `<div class="avaLetterHome" style="background:linear-gradient(135deg,#ff5ea8,#ff7a00)!important">Y</div>`;
  let myImg = myAvatar ? `<img class="sAddImg" src="${myAvatar}" onerror="this.remove();this.parentElement.querySelector('.sLetter').style.display='grid'">` : '';
  let myLetterHtml = `<div class="sLetter avaLetterHome" style="display:${myAvatar ? 'none' : 'grid'};width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">Y</div>`;

  let myHasStory = !!byUser[String(window.ME_ID)];

  // ✅ MY STORY FIRST DA - Pixoro Style Circle + Plus - Orey Photo da
  let html = `<div class="sItem" onclick="location.href='./story-upload.html'">
    <div class="sAddWrap" style="position:relative">${myImg}${myLetterHtml}<div class="sAddPlus">+</div></div>
    <div class="sName">My Story</div></div>`;

  // ✅ REAL STORY - Profile Photo mattum thaan da, Story Photo illa da
  Object.keys(byUser).forEach(k=>{
    if(k === String(window.ME_ID)) return; // En story ah thaniya kaamikka vendaam da
    let arr = byUser[k]; let first = arr[0];
    let uname = String(first.username || profMap[k]?.username || 'user').replace('@','').toLowerCase();
    // ✅ FIX DA - Story la irunthu edukka koodathu da, Profiles la irunthu edukkanum da
    let prof = profMap[k] || {};
    let avatar = String(prof.avatar_url || prof.profile_pic || prof.photo_url || first.avatar_url || '').trim();
    // ✅ En story na En Profile Photo thaan da - ID / Name maathinaalum da
    if(k === String(window.ME_ID) && (window.MY_PFP || window.ME_PFP)) avatar = window.MY_PFP || window.ME_PFP;
    let letter = uname.charAt(0).toUpperCase();
    let imgHtml = avatar ? `<img src="${avatar}" onerror="this.remove();this.parentElement.querySelector('.sLetter2').style.display='grid'">` : '';
    let letterHtml = `<div class="sLetter2" style="display:${avatar ? 'none' : 'grid'};width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#ff5ea8,#ff7a00);place-items:center;font-weight:900;font-size:22px;color:#fff">${letter}</div>`;
    html += `<div class="sItem" onclick="location.href='./story.html?user=${first.user_id}'">
      <div class="sRing"><div class="sRingInner" style="position:relative">${imgHtml}${letterHtml}</div></div>
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
