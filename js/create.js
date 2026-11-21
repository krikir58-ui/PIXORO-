let type='post',file=null,url='',kind='image',filter='none',text='',song='Trending Audio',fontF='system-ui',adj={brightness:100,contrast:100,saturate:100},loc='Chennai, India',aud='Everyone',tag='@friend_name';
let clips=[],galleryPhotos=[],trimStart=0,trimEnd=15,totalDur=15,uploading=false,captionVal='',textEffect='none',myStickers=[],stickerImgUrl='',tfColor='#fff',galFilter='all',soundOn=false,zoom=1,panX=0,panY=0,hintTimer=null,toastTimer=null,prevFilter='none';
// ✅ TEXT MASS - SIZE / OPACITY / ROTATE / ALIGN / BOLD / BG
let tfSize=36,tfOpacity=100,tfRotate=0,tfAlign='center',tfBold=false,tfItalic=false,tfBg=false;
function toast(m){let t=document.getElementById('toast');if(!t)return;t.innerText=m;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800);}
function fmt(s){s=Math.max(0,s);return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
function updateChrome(id){document.body.classList.toggle('hideChrome',id!=='pageHome');}
let _histLock=false;
function _pushHist(){ try{ history.pushState({pixoro:1},''); }catch(e){} }
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));document.getElementById(id).classList.add('on');updateChrome(id);closeFullAll(); if(!_histLock) _pushHist();}
function goBack(){
  let openFullPage=document.querySelector('.fullPage.show');
  if(openFullPage){
    if(openFullPage.id==='pageFilterFull'){ filter=prevFilter; applyFilter(); }
    if(openFullPage.id==='pageTextFull'){ let inp=document.getElementById('tfInput'); if(inp) inp.value=text||''; }
    closeFull(); return;
  }
  let dp=document.getElementById('draftPopup');
  if(dp && dp.classList.contains('show')){ closeDraft(); return; }
  let cs=document.getElementById('createSheet');
  if(cs && cs.classList.contains('show')){ closeCreateSheet(); return; }
  let cur=document.querySelector('.page.on')?.id;
  if(cur==='pageUpload'){ showPage('pageEdit'); return; }
  if(cur==='pageEdit'){ askDraft(); return; }
  if(cur==='pageHome'){ return; }
  showPage('pageHome');
}
window.addEventListener('popstate',function(e){ e.preventDefault(); _histLock=true; goBack(); setTimeout(()=>{ _histLock=false; },100); });
function openCreateSheet(){document.getElementById('createSheet')?.classList.add('show');document.getElementById('sheetBg')?.classList.add('show'); _pushHist();}
function closeCreateSheet(){document.getElementById('createSheet')?.classList.remove('show');document.getElementById('sheetBg')?.classList.remove('show');}
function pickCreate(t){closeCreateSheet();setMode(t);showPage('pageHome');}
let savedByMode={post:null,story:null,reels:null,live:null};
function saveCurMode(){ savedByMode[type]= url ? {url:url,kind:kind,file:file,clips:[...clips]} : null; }
function loadMode(m){
  let s=savedByMode[m];
  if(s){ url=s.url; kind=s.kind; file=s.file; clips=[...s.clips]; }
  else{ url=''; kind='image'; file=null; clips=[]; }
  zoom=1; panX=0; panY=0; text=''; filter='none';
  let o=document.getElementById('ovText'); if(o){ o.innerText=''; o.style.transform='translate(-50%,-50%)'; }
  let st=document.getElementById('ovStick'); if(st) st.innerHTML='';
  applyFilter();
}
function toggleStoryUI(){
  let pe=document.getElementById('pageEdit');
  if(pe) pe.classList.toggle('storyMode', type==='story');
  let ph=document.getElementById('pageHome');
  if(ph) ph.classList.toggle('storySelect', type==='story');
  let st=document.getElementById('storyTopRow');
  if(st) st.style.display = (type==='story') ? 'flex' : 'none';
  let ht=document.getElementById('homeTitle');
  if(ht && type==='story') ht.innerText='Add to story';
}
function setMode(t){
  if(type!==t) saveCurMode();
  type=t; loadMode(t);
  document.querySelectorAll('#modePill button').forEach(b=>b.classList.toggle('on',b.dataset.mode===t));
  let a=document.querySelector('#modePill button.on'),ind=document.getElementById('modeInd');
  if(a&&ind){ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+(a.offsetLeft-4)+'px)';}
  document.getElementById('homeTitle').innerText=t==='post'?'New post':t==='reels'?'New reel':t==='story'?'Add to story':'Live';
  document.getElementById('galPreview').className='galPreview '+t;
  document.getElementById('pvChipTxt').innerText=t==='post'?'1:1 - Drag to adjust':t==='reels'?'9:16 - Reels':t==='story'?'9:16 - Story':'LIVE - Camera';
  document.getElementById('sugAudio').style.display=(t==='reels'&&url)?'flex':'none';
  setType(t); updatePreview(); fitVideoFullScreen(); toggleStoryUI(); renderMedia(); renderFilm();
  if(t==='live')toast('Live - Go Live');
}
function setType(t){type=t;let e=document.getElementById('editTitle');if(e)e.innerText=t==='post'?'Edit Photo':t==='reels'?'Edit Reel':'Story Edit';let u=document.getElementById('uploadTitle');if(u)u.innerText=t==='post'?'Upload Post':t==='reels'?'Upload Reel':'Upload Story';renderQuickBar(); toggleStoryUI();}
function clampPan(){let st=document.getElementById('pvStage');if(!st)return;let mx=Math.max(0,(st.clientWidth*(zoom-1))/2),my=Math.max(0,(st.clientHeight*(zoom-1))/2);panX=Math.max(-mx,Math.min(mx,panX));panY=Math.max(-my,Math.min(my,panY));}
function applyZoom(){
  clampPan();
  let t='translate3d('+panX+'px,'+panY+'px,0) scale('+zoom+')';
  let pv = kind==='video'?document.getElementById('pvVid'):document.getElementById('pvImg');
  if(pv) pv.style.transform=t;
  let ev = kind==='video'?document.getElementById('editVid'):document.getElementById('editImg');
  if(ev) ev.style.transform=t;
}
function fitVideoFullScreen(){
  zoom=1; panX=0; panY=0;
  ['pvVid','pvImg','editVid','editImg','evVid','evImg'].forEach(id=>{
    let el=document.getElementById(id); if(!el) return;
    el.style.objectFit='cover'; el.style.objectPosition='center center';
    el.style.transform='translate3d(0px,0px,0) scale(1)';
  });
}
function updateSoundIcon(){
  let pairs=[['soundOnIcon','soundOffIcon'],['soundOnIconEdit','soundOffIconEdit'],['soundOnIcon2','soundOffIcon2']];
  pairs.forEach(p=>{
    let on=document.getElementById(p[0]), off=document.getElementById(p[1]);
    if(!on||!off) return;
    on.style.display = soundOn ? 'grid' : 'none';
    off.style.display = soundOn ? 'none' : 'grid';
  });
  document.querySelectorAll('.soundBtn').forEach(b=>b.classList.toggle('on', soundOn));
  let es=document.getElementById('editSound');
  if(es) es.classList.toggle('on', soundOn);
}
function toggleSound(e){
  if(e) e.stopPropagation();
  soundOn=!soundOn;
  ['pvVid','editVid','evVid','auVid','tfVid','voVid','upVidPost'].forEach(id=>{
    let v=document.getElementById(id); if(!v) return;
    v.muted=!soundOn;
    if(soundOn && v.src) v.play().catch(()=>{});
  });
  updateSoundIcon(); toast(soundOn?'Sound ON':'Sound OFF');
}
function syncEditVideoUI(){
  let isVid = kind==='video' && !!url;
  let es=document.getElementById('editSound');
  let cp=document.getElementById('centerPlay');
  let ev=document.getElementById('editVid');
  if(es) es.style.display = isVid ? 'grid' : 'none';
  if(cp) cp.style.display = isVid ? 'grid' : 'none';
  if(ev && isVid){ ev.muted=!soundOn; ev.play().catch(()=>{}); }
  updateSoundIcon();
}
function tapPreviewPlay(e){
  if(kind!=='video') return;
  if(e.target.closest('.editSound') || e.target.closest('#ovText') || e.target.closest('#ovStick')) return;
  togglePlay(e);
}
function togglePlay(e){
  if(e) e.stopPropagation();
  if(kind!=='video'){ toast('Video select pannu - Photo ku Play Illa'); return; }
  let v=document.getElementById('editVid');
  let cp=document.getElementById('centerPlay');
  let icon=document.getElementById('centerPlayIcon');
  if(v.paused){ v.muted=!soundOn; v.play().catch(()=>{}); if(cp) cp.style.display='none'; if(icon) icon.innerHTML='<path d="M8 5l11 7-11 7V5z"/>'; }
  else { v.pause(); if(cp) cp.style.display='grid'; if(icon) icon.innerHTML='<path d="M7 5v14M17 5v14"/>'; }
}
function updatePreview(){
  let pi=document.getElementById('pvImg'),pv=document.getElementById('pvVid'),pl=document.getElementById('pvPlay');
  if(!url){pi.style.display='none';pv.style.display='none';document.getElementById('pvEmpty').style.display='grid';document.getElementById('pvTop').style.display='none';document.getElementById('cropHint').style.display='none';document.getElementById('sugAudio').style.display='none';if(pl)pl.style.display='none';return;}
  document.getElementById('pvEmpty').style.display='none';document.getElementById('pvTop').style.display='flex';
  let h=document.getElementById('cropHint');h.style.display='block';h.classList.remove('hide');clearTimeout(hintTimer);hintTimer=setTimeout(()=>h.classList.add('hide'),2500);
  showMedia(pi,pv,url,kind);applyZoom();
  document.getElementById('sugAudio').style.display=type==='reels'?'flex':'none';
  if(kind==='video'){ pv.muted=!soundOn; pv.currentTime=0; pv.play().catch(()=>{}); pl.style.display='none'; }
  else{pl.style.display='none';try{pv.pause();}catch(e){}}
  updateSoundIcon();
}
function togglePreviewPlay(e){
  if(e) e.stopPropagation();
  let v=document.getElementById('pvVid'); if(!v) return;
  if(v.paused){ v.muted=!soundOn; v.play(); document.getElementById('pvPlay').style.display='none'; }
  else { v.pause(); document.getElementById('pvPlay').style.display='grid'; }
}
function showMedia(a,b,s,k){if(!a||!b)return;if(k==='video'){b.src=s;b.style.display='block';a.style.display='none';}else{a.src=s;a.style.display='block';b.style.display='none';try{b.pause();}catch(e){}}}
function renderMedia(){let list=galleryPhotos.filter(p=>galFilter==='all'||p.kind===galFilter);let html='';if(type!=='story'){ html='<div class="galleryBtn" onclick="document.getElementById(\'fileMulti\').click()"><div><b>Gallery la irunthu Photo / Video Add Pannu</b><div style="font-size:11px;color:#aaa">Real Gallery mattum thaan</div></div></div>'; }html+=list.map(p=>{let i=galleryPhotos.indexOf(p);return '<div class="tile '+(url===p.url?'sel':'')+'" onclick="selectGallery('+i+')">'+(p.kind==='video'?'<video src="'+p.url+'" muted playsinline></video><span class="dur">0:15</span>':'<img src="'+p.url+'">')+'<span class="tick">'+(url===p.url?'✓':'')+'</span></div>';}).join('');let gh=document.getElementById('mediaGridHome');if(gh)gh.innerHTML=html;}
function selectGallery(i){let p=galleryPhotos[i];if(!p)return;url=p.url;kind=p.kind;file=p.file;saveCurMode();fitVideoFullScreen();showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);renderMedia();renderFilm();updatePreview();syncEditVideoUI(); if(type==='reels'||type==='story') setTimeout(()=>goEdit(),200);}
function setGalTab(f,b){galFilter=f;document.querySelectorAll('.galTabs button').forEach(x=>x.classList.remove('sel'));if(b)b.classList.add('sel');renderMedia();}
function goSelectNext(){if(!url){document.getElementById('fileMulti').click();return;}goEdit();}
function goEdit(){if(!url){toast('Gallery la irunthu Photo Add Pannu');return;}showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);showMedia(document.getElementById('upImgPost'),document.getElementById('upVidPost'),url,kind);showPage('pageEdit');renderFilm();setType(type);fitVideoFullScreen();syncEditVideoUI();}
function goUpload(){if(!url){toast('Photo illa');return;}showPage('pageUpload');document.getElementById('captionPost').value=captionVal;syncFields();}
function syncCap(){captionVal=document.getElementById('captionPost').value;}
function syncFields(){let l=document.getElementById('locVal');if(l)l.innerText=loc||'Add Location';let t=document.getElementById('tagVal');if(t)t.innerText=tag||'Tag People';let m=document.getElementById('musicVal');if(m)m.innerText=song;let a=document.getElementById('audVal');if(a)a.innerText=aud;}
function promptLoc(){let l=prompt('Location',loc||'Chennai, India');if(l!==null){loc=l;syncFields();}}
function clearLoc(){loc='';syncFields();}
function promptTag(){let t=prompt('Tag People',tag||'@friend_name');if(t!==null){tag=t;syncFields();}}
function clearTag(){tag='';syncFields();}
function toggleAud(){aud=aud==='Everyone'?'Private':'Everyone';syncFields();}
function removeUploadPhoto(){url='';file=null;clips=[];saveCurMode();showPage('pageHome');renderMedia();updatePreview();}
function renderQuickBar(){let q=document.getElementById('quickBar'); if(q) q.innerHTML='';}
function askDraft(){document.getElementById('draftPopup').classList.add('show');}
function closeDraft(){document.getElementById('draftPopup').classList.remove('show');}
function startOver(){closeDraft();resetEdit();showPage('pageHome');}
function closeFull(){document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));}
function closeFullAll(){document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));}
function openFull(id){
  if(id==='pageFilterFull'){ prevFilter=filter; }
  document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));
  let e=document.getElementById(id);if(e){void e.offsetWidth;e.classList.add('show');}
  if(id==='pageAudioFull'){showMedia(document.getElementById('auImg'),document.getElementById('auVid'),url,kind);renderSongs('');}
  // ✅ Hi FIX - Text empty na - Empty ah thaan varum - Hi varaathu
  if(id==='pageTextFull'){showMedia(document.getElementById('tfImg'),document.getElementById('tfVid'),url,kind);let inp=document.getElementById('tfInput');if(inp){inp.value=text||'';inp.placeholder='Type...';inp.style.fontFamily=fontF;inp.style.color=tfColor;inp.style.fontSize=tfSize+'px';inp.style.textAlign=tfAlign;inp.style.opacity=tfOpacity/100;inp.style.transform='translate(-50%,-50%) rotate('+tfRotate+'deg)';setTimeout(()=>inp.focus(),350);}}
  if(id==='pageVoiceFull'){showMedia(document.getElementById('voImg'),document.getElementById('voVid'),url,kind);}
  if(id==='pageEditVideoFull'){showMedia(document.getElementById('evImg'),document.getElementById('evVid'),url,kind);renderFilm();updateSoundIcon();}
  if(id==='pageFilterFull'){renderFilterFull();}
}
function renderSongs(q){
  let list=[['Leo - Naa Ready','Sai Abhyankkar'],['Jailer - Hukum','Anirudh'],['Vikram','Anirudh'],['Trending Audio','Pixoro'],['Veezha Veera','Anirudh'],['Sheru Bhai','Sai Abhyankkar']];
  let f=list.filter(x=>!q||x[0].toLowerCase().includes(q.toLowerCase()));
  let el=document.getElementById('songListFull');
  if(el) el.innerHTML=f.map(s=>'<div class="songRow" onclick="pickSong(\''+s[0]+'\')"><div class="th"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div><div><b>'+s[0]+'</b><span>'+s[1]+'</span></div></div>').join('');
}
function pickSong(s){song=s;let st=document.getElementById('songTxt');if(st)st.innerText='Song: '+s;let sg=document.getElementById('sugTxt');if(sg)sg.innerText=s+' - Suggested Audio';syncFields();closeFull();toast('Song Added');}
function searchSong(q){renderSongs(q);}
// ✅ CONFIRM - Empty na Save aagaathu - Size / Opacity / Rotate ellaam Save aagum
function confirmTextFull(){
  let v=document.getElementById('tfInput').value.trim();
  if(!v){ closeFull(); return; }
  text=v; let o=document.getElementById('ovText');
  o.innerText=v; o.style.fontFamily=fontF; o.style.color=tfColor; o.style.fontSize=tfSize+'px'; o.style.textAlign=tfAlign; o.style.fontStyle=tfItalic?'italic':'normal'; o.style.background=tfBg?'rgba(0,0,0,.6)':'transparent'; o.style.padding=tfBg?'8px 14px':'0'; o.style.borderRadius=tfBg?'12px':'0'; o.style.opacity=tfOpacity/100; o.style.transform='translate(-50%,-50%) rotate('+tfRotate+'deg)';
  applyTextEffect(); toast('Text Added'); closeFull();
}
function removeTextFull(){text='';let i=document.getElementById('tfInput');if(i)i.value='';document.getElementById('ovText').innerText='';closeFull();}
function setTFFont(f,b){fontF=f;let inp=document.getElementById('tfInput');if(inp)inp.style.fontFamily=f;document.querySelectorAll('#tfFontRow button').forEach(x=>x.classList.remove('sel'));if(b)b.classList.add('sel');}
// ✅ MASS FEATURES - SIZE / ALIGN / BOLD / BG / OPACITY / ROTATE
function setTFSize(v){ tfSize=v; let el=document.getElementById('tfSizeVal'); if(el)el.innerText=v+'px'; let i=document.getElementById('tfInput'); if(i) i.style.fontSize=v+'px'; }
function setTFAlign(a,b){ tfAlign=a; document.querySelectorAll('.tfIconBtn').forEach(x=>{ if(['◀','▬','▶'].includes(x.innerText)) x.classList.remove('sel'); }); if(b)b.classList.add('sel'); let i=document.getElementById('tfInput'); if(i) i.style.textAlign=a; }
function toggleTFBold(b){ tfBold=!tfBold; if(b)b.classList.toggle('sel',tfBold); let i=document.getElementById('tfInput'); if(i) i.style.fontWeight='900'; }
function toggleTFItalic(b){ tfItalic=!tfItalic; if(b)b.classList.toggle('sel',tfItalic); let i=document.getElementById('tfInput'); if(i) i.style.fontStyle=tfItalic?'italic':'normal'; }
function toggleTFBg(b){ tfBg=!tfBg; if(b)b.classList.toggle('sel',tfBg); let i=document.getElementById('tfInput'); if(i){ i.style.background=tfBg?'rgba(0,0,0,.6)':'transparent'; i.style.padding=tfBg?'8px 14px':'0'; i.style.borderRadius=tfBg?'12px':'0'; } }
function setTFOpacity(v){ tfOpacity=v; let el=document.getElementById('tfOpacityVal'); if(el)el.innerText=v+'%'; let i=document.getElementById('tfInput'); if(i) i.style.opacity=v/100; }
function setTFRotate(v){ tfRotate=v; let el=document.getElementById('tfRotateVal'); if(el)el.innerText=v+'°'; let i=document.getElementById('tfInput'); if(i) i.style.transform='translate(-50%,-50%) rotate('+v+'deg)'; }
function setTFEffect(e,b){
  textEffect=e;
  document.querySelectorAll('.tfRow button').forEach(x=>{ if(['None','Hard Shadow','Neon','Halo','Outline','Glow','3D'].includes(x.innerText)) x.classList.remove('sel'); });
  if(b)b.classList.add('sel');
  let inp=document.getElementById('tfInput');
  if(!inp) return;
  if(e==='shadow')inp.style.textShadow='4px 4px 0 #000';
  else if(e==='neon')inp.style.textShadow='0 0 10px #fff,0 0 20px #ff2d95';
  else if(e==='halo')inp.style.textShadow='0 0 12px #fff';
  else if(e==='outline')inp.style.textShadow='-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000';
  else if(e==='glow')inp.style.textShadow='0 0 20px '+tfColor+',0 0 40px '+tfColor;
  else if(e==='3d')inp.style.textShadow='1px 1px 0 #000,2px 2px 0 #000,3px 3px 0 #000,4px 4px 0 #000';
  else inp.style.textShadow='0 2px 10px #000';
}
function setTFColor(c,el){tfColor=c;let inp=document.getElementById('tfInput');if(inp)inp.style.color=c;document.querySelectorAll('.tfColors div').forEach(x=>x.classList.remove('sel'));if(el)el.classList.add('sel');}
function applyTextEffect(){
  let o=document.getElementById('ovText'); if(!o) return;
  if(textEffect==='shadow')o.style.textShadow='4px 4px 0 #000';
  else if(textEffect==='neon')o.style.textShadow='0 0 10px #fff,0 0 20px #ff2d95';
  else if(textEffect==='halo')o.style.textShadow='0 0 12px #fff';
  else if(textEffect==='outline')o.style.textShadow='-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000';
  else if(textEffect==='glow')o.style.textShadow='0 0 20px '+tfColor+',0 0 40px '+tfColor;
  else if(textEffect==='3d')o.style.textShadow='1px 1px 0 #000,2px 2px 0 #000,3px 3px 0 #000,4px 4px 0 #000';
  else o.style.textShadow='0 2px 8px #000';
  o.style.color=tfColor; o.style.fontSize=tfSize+'px'; o.style.opacity=tfOpacity/100;
}
function pickSticker(k){
  let map={ fire:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png', heart:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png', laugh:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f602.png', crown:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f451.png', love:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60d.png', star:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png', party:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f389.png', hundred:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4af.png', cool:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f60e.png', cry:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f622.png', angry:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f621.png', kiss:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f618.png' };
  let el=document.getElementById('ovStick');
  el.innerHTML='<img src="'+(map[k]||map.star)+'" style="width:90px;height:90px;object-fit:contain;border:0;background:transparent">';
  el.style.left='50%'; el.style.top='60%'; stickerImgUrl=map[k]||'';
  closeFull(); toast('Sticker Added');
}
function pickMySticker(s){let el=document.getElementById('ovStick');el.innerHTML='<img src="'+s+'" style="width:90px;height:90px;object-fit:contain;border:0;background:transparent">';el.style.left='50%';el.style.top='60%';stickerImgUrl=s;closeFull();}
function renderMyStickers(){let box=document.getElementById('myStickerList');if(!box)return;box.innerHTML=myStickers.map(s=>'<div style="width:72px;height:72px;border-radius:14px;overflow:hidden;display:inline-block;margin:4px" onclick="pickMySticker(\''+s+'\')"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover"></div>').join('');}
function removeText(){text='';stickerImgUrl='';document.getElementById('ovText').innerText='';document.getElementById('ovStick').innerHTML='';closeFull();}
function startVoice(b){document.getElementById('voiceTxt').innerText='Voice: Recording...';if(b)b.innerText='Recording...';toast('Recording...');}
function stopVoice(){document.getElementById('voiceTxt').innerText='Voice: Added';toast('Voice Added');}
function resetEdit(){filter='none';prevFilter='none';text='';document.getElementById('ovText').innerText='';document.getElementById('ovStick').innerHTML='';applyFilter();}
function renderFilterFull(){
  let r=document.getElementById('filterRowFull');
  if(r)r.innerHTML=[['None','none'],['Vivid','brightness(1.15) saturate(1.5)'],['Warm','sepia(.45)'],['Retro','sepia(.6)'],['B&W','grayscale(1)'],['Cool','brightness(1.05) hue-rotate(180deg)'],['Golden','sepia(.3) saturate(1.4)']].map(a=>'<button onclick="previewFilter(\''+a[1]+'\')">'+a[0]+'</button>').join('');
}
function previewFilter(f){filter=f;applyFilter();}
function buildFilter(){return filter==='none'?'brightness('+adj.brightness+'%) contrast('+adj.contrast+'%) saturate('+adj.saturate+'%)':'brightness('+adj.brightness+'%) contrast('+adj.contrast+'%) saturate('+adj.saturate+'%) '+filter;}
function applyFilter(){let f=buildFilter();let ei=document.getElementById('editImg');if(ei)ei.style.filter=f;let ev=document.getElementById('editVid');if(ev)ev.style.filter=f;let up=document.getElementById('upImgPost');if(up)up.style.filter=f;}
function setFilter(f){prevFilter=f;filter=f;applyFilter();closeFull();toast('Filter Applied');}
// ✅ ADJUST - Brightness / Contrast / Saturate
function setAdj(k,v){ adj[k]=v; applyFilter(); }
function setupVideo(){let v=document.getElementById('editVid');if(kind==='video'){v.onloadedmetadata=()=>{totalDur=v.duration||15;trimStart=0;trimEnd=totalDur;let p=document.getElementById('playTime');if(p)p.innerText='0:00 / '+fmt(totalDur);updateTrimUI();};v.ontimeupdate=()=>{let p=document.getElementById('playTime');if(p)p.innerText=fmt(v.currentTime)+' / '+fmt(v.duration);};}renderFilm();}
function seekVideo(v){let vid=document.getElementById('editVid');if(kind!=='video'||!vid.duration)return;vid.currentTime=vid.duration*v/100;}
function renderFilm(){let f=document.getElementById('filmStrip');if(!f||!url)return;let c=Math.max(clips.length,1),h='';for(let i=0;i<6;i++){let cl=clips[i%c]||{url:url,kind:kind};h+='<div>'+(cl.kind==='video'?'<video src="'+cl.url+'" muted playsinline></video>':'<img src="'+cl.url+'">')+'</div>';}f.innerHTML=h;}
function cutAtCurrent(){let v=document.getElementById('editVid');let ct=kind==='video'?v.currentTime:(trimStart+trimEnd)/2;if(ct<=trimStart+0.3||ct>=trimEnd-0.3){toast('Naduvula Play panni Cut pannu');return;}clips=[{url:url,kind:kind,file:file},{url:url,kind:kind,file:file}];renderFilm();toast('Cut - 2 Clips');}
function splitClip(){cutAtCurrent();}
function deleteClip(){if(clips.length>1){clips.splice(0,1);renderFilm();updateTrimUI();toast('Clip Deleted');}else{removeText();toast('Deleted');}}
function updateTrimUI(){let a=document.getElementById('trimInfo');if(a)a.innerText='Trim: '+fmt(trimStart)+' - '+fmt(trimEnd);let b=document.getElementById('clipInfo');if(b)b.innerText=clips.length+' Clip • '+fmt(trimEnd-trimStart);}
function isFakeFile(f){let n=(f.name||'').toLowerCase();return n.match(/ai|generated|fake|unsplash|sample|demo|download|midjourney|dalle/)?true:false;}
function addClip(f){if(!f)return;if(isFakeFile(f)){toast('Fake Photo');return;}let r=new FileReader();r.onload=ev=>{let k=f.type.includes('video')?'video':'image';let c={url:ev.target.result,kind:k,file:f};galleryPhotos.push(c);clips.push({url:c.url,kind:k,file:f});url=c.url;kind=k;file=f;saveCurMode();showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);renderMedia();renderFilm();updatePreview();syncEditVideoUI();if(type==='reels')setupVideo(); if(type==='reels'||type==='story'){ setTimeout(()=>{ let cur=document.querySelector('.page.on')?.id; if(cur==='pageHome') goEdit(); },350); }};r.readAsDataURL(f);}
document.getElementById('file')?.addEventListener('change',e=>{addClip(e.target.files[0]);e.target.value='';});
document.getElementById('fileMulti')?.addEventListener('change',e=>{Array.from(e.target.files).forEach(f=>addClip(f));e.target.value='';});
document.getElementById('fileAdd')?.addEventListener('change',e=>{Array.from(e.target.files).forEach(f=>addClip(f));e.target.value='';toast('Reel Added');});
document.getElementById('fileSticker')?.addEventListener('change',e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{myStickers.push(ev.target.result);pickMySticker(ev.target.result);renderMyStickers();};r.readAsDataURL(f);e.target.value='';});
document.getElementById('fileReplace')?.addEventListener('change',e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{url=ev.target.result;kind=f.type.includes('video')?'video':'image';file=f;showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);renderFilm();syncEditVideoUI();};r.readAsDataURL(f);e.target.value='';});
(function(){let pv=document.getElementById('galPreview'),st=document.getElementById('pvStage'),sx=0,sy=0,ox=0,oy=0,drag=false,ld=0;if(!pv)return;pv.addEventListener('touchstart',e=>{if(!url)return;st.classList.add('dragging');if(e.touches.length===1){drag=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;ox=panX;oy=panY;}if(e.touches.length===2){drag=false;ld=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}},{passive:true});pv.addEventListener('touchmove',e=>{if(!url)return;if(e.touches.length===1&&drag){panX=ox+(e.touches[0].clientX-sx);panY=oy+(e.touches[0].clientY-sy);applyZoom();}if(e.touches.length===2){let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(ld>0){zoom=Math.max(1,Math.min(3,zoom*(d/ld)));applyZoom();}ld=d;}},{passive:true});pv.addEventListener('touchend',()=>{drag=false;ld=0;st.classList.remove('dragging');});pv.addEventListener('dblclick',()=>{if(!url)return;fitVideoFullScreen();});})();
(function(){let pv=document.getElementById('editPreview');if(!pv)return;let sx=0,sy=0,ox=0,oy=0,drag=false,ld=0;pv.addEventListener('touchstart',e=>{if(!url)return;if(e.target.closest('#ovText')||e.target.closest('#ovStick')||e.target.closest('.editSound')||e.target.closest('.centerPlay')||e.target.closest('.storySide')||e.target.closest('.storyBottom'))return;if(e.touches.length===1){drag=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;ox=panX;oy=panY;}if(e.touches.length===2){drag=false;ld=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}},{passive:true});pv.addEventListener('touchmove',e=>{if(!url)return;if(e.target.closest('#ovText')||e.target.closest('#ovStick'))return;if(e.touches.length===1&&drag){panX=ox+(e.touches[0].clientX-sx);panY=oy+(e.touches[0].clientY-sy);applyZoom();}if(e.touches.length===2){let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(ld>0){zoom=Math.max(1,Math.min(3,zoom*(d/ld)));applyZoom();}ld=d;}},{passive:true});pv.addEventListener('touchend',()=>{drag=false;ld=0;});pv.addEventListener('dblclick',()=>{if(!url)return;fitVideoFullScreen();});})();
(function(){let pill=document.getElementById('modePill');if(!pill)return;let sx=0,modes=['post','story','reels','live'];pill.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});pill.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){let cur=modes.indexOf(type);if(dx<0&&cur<3)setMode(modes[cur+1]);if(dx>0&&cur>0)setMode(modes[cur-1]);}},{passive:true});})();
(function(){function mk(id,isSt){let el=document.getElementById(id);if(!el)return;let sx=0,sy=0,ol=0,ot=0,dr=false,hot=false;el.addEventListener('pointerdown',e=>{if(!el.innerText&&!el.innerHTML)return;dr=true;sx=e.clientX;sy=e.clientY;let r=el.getBoundingClientRect(),p=document.getElementById('editPreview').getBoundingClientRect();ol=(r.left-p.left+r.width/2)/p.width*100;ot=(r.top-p.top+r.height/2)/p.height*100;el.setPointerCapture(e.pointerId);document.getElementById('dragDelete').classList.add('show');e.stopPropagation();});el.addEventListener('pointermove',e=>{if(!dr)return;let p=document.getElementById('editPreview').getBoundingClientRect();let nx=Math.max(5,Math.min(95,ol+(e.clientX-sx)/p.width*100)),ny=Math.max(5,Math.min(95,ot+(e.clientY-sy)/p.height*100));el.style.left=nx+'%';el.style.top=ny+'%';let bin=document.getElementById('deleteBin').getBoundingClientRect();hot=(e.clientX>bin.left-30&&e.clientX<bin.right+30&&e.clientY>bin.top-30&&e.clientY<bin.bottom+30);document.getElementById('dragDelete').classList.toggle('hot',hot);});el.addEventListener('pointerup',()=>{if(!dr)return;dr=false;document.getElementById('dragDelete').classList.remove('show');document.getElementById('dragDelete').classList.remove('hot');if(hot){if(isSt){el.innerHTML=''; stickerImgUrl='';}else{el.innerText='';text='';}toast('Deleted');}});}mk('ovText',false);mk('ovStick',true);})();
function getSupa(){return window.supa;}
async function shareStory(mode){
  if(!url || !file){ toast('Photo / Video Select Pannu'); return; }
  if(uploading) return; uploading=true; toast('Story Uploading...');
  try{
    let supa=getSupa(); if(!supa) throw new Error('Supabase connect aagala');
    let {data:{session}}=await supa.auth.getSession(); if(!session){ location.href='./login.html'; return; }
    let ME=session.user.email.split('@')[0];
    let blob=file;
    if(kind!=='video'){
      blob=await new Promise(res=>{ let img=new Image(); img.onload=()=>{ let W=1080,H=1920; let cc=document.createElement('canvas'); cc.width=W; cc.height=H; let ctx=cc.getContext('2d'); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); ctx.filter=buildFilter(); let sc=Math.max(W/img.width,H/img.height)*zoom; let dw=img.width*sc,dh=img.height*sc; ctx.drawImage(img,(W-dw)/2+panX*2,(H-dh)/2+panY*2,dw,dh); if(text){ ctx.filter='none'; ctx.font='900 60px '+fontF; ctx.textAlign='center'; ctx.fillStyle=tfColor; ctx.fillText(text,W/2,H*0.35); } cc.toBlob(b=>res(b||file),'image/jpeg',0.92); }; img.src=url; });
    }
    let ext=kind==='video'?'mp4':'jpg'; let fn='stories/'+session.user.id+'/'+Date.now()+'.'+ext;
    let {error:upErr}=await supa.storage.from('stories').upload(fn,blob,{contentType:kind==='video'?'video/mp4':'image/jpeg'});
    if(upErr) throw new Error('Storage: '+upErr.message);
    let {data:ud}=supa.storage.from('stories').getPublicUrl(fn);
    let {error}=await supa.from('stories').insert({ user_id:session.user.id, username:ME, media_url:ud.publicUrl, media_type:kind, caption:captionVal||document.getElementById('storyCap')?.value||'', song:song, privacy: mode==='close' ? 'Close Friends' : 'Everyone', expires_at: new Date(Date.now()+24*60*60*1000).toISOString() });
    if(error) throw new Error(error.message);
    toast('Story Uploaded - Server la Save Aachu!'); uploading=false; setTimeout(()=>location.href='./index.html',1000);
  }catch(e){ uploading=false; toast('Story Error: '+e.message); }
}
async function saveToServer(isDraft){
  let supa=getSupa(); if(!supa) throw new Error('Supabase connect aagala');
  let {data:{session}}=await supa.auth.getSession(); if(!session){location.href='./login.html';return false;}
  let ME=session.user.email.split('@')[0];
  let blob;
  if(kind==='video'){blob=file;}
  else{blob=await new Promise(res=>{let img=new Image();img.onload=()=>{let W=1080,H=type==='reels'?1920:1350;let cc=document.createElement('canvas');cc.width=W;cc.height=H;let ctx=cc.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.filter=buildFilter();let sc=Math.max(W/img.width,H/img.height)*zoom;let dw=img.width*sc,dh=img.height*sc;ctx.drawImage(img,(W-dw)/2+panX*2,(H-dh)/2+panY*2,dw,dh);if(text){ctx.filter='none';ctx.font='900 60px '+fontF;ctx.textAlign='center';ctx.fillStyle=tfColor;ctx.fillText(text,W/2,H*0.35);}cc.toBlob(b=>res(b||file),'image/jpeg',0.92);};img.src=url;});}
  let folder=type==='story'?'stories':type==='reels'?'reels':'posts';
  let ext=kind==='video'?'mp4':'jpg';
  let fn=folder+'/'+session.user.id+'/'+Date.now()+(isDraft?'-draft':'')+'.'+ext;
  let {error:upErr}=await supa.storage.from(folder).upload(fn,blob,{contentType:kind==='video'?'video/mp4':'image/jpeg'});
  if(upErr) throw new Error('Storage: '+upErr.message);
  let {data:ud}=supa.storage.from(folder).getPublicUrl(fn);
  if(isDraft){let {error}=await supa.from('drafts').insert({user_id:session.user.id,media_url:ud.publicUrl,media_type:type,caption:captionVal||'',crop_zoom:zoom,crop_x:panX,crop_y:panY});if(error)throw new Error(error.message);return true;}
  if(type==='story'){let {error}=await supa.from('stories').insert({user_id:session.user.id,username:ME,media_url:ud.publicUrl,media_type:kind,caption:captionVal||'',song:song});if(error)throw new Error(error.message);return true;}
  let {error}=await supa.from('posts').insert({user_id:session.user.id,username:ME,media_url:ud.publicUrl,image_url:kind==='image'?ud.publicUrl:null,video_url:kind==='video'?ud.publicUrl:null,media_type:type,caption:captionVal||'Just Pixoro',location:loc||'',tagged_users:tag||'',song:song,privacy:aud,crop_zoom:zoom,crop_x:panX,crop_y:panY,is_draft:false});
  if(error)throw new Error(error.message);return true;
}
async function startLive(){let supa=getSupa();if(!supa)return;let {data:{session}}=await supa.auth.getSession();if(!session){location.href='./login.html';return;}let {error}=await supa.from('live_sessions').insert({user_id:session.user.id,username:session.user.email.split('@')[0],title:'Live',privacy:'Everyone',status:'live'});if(error)toast('Live Start Aagala');else toast('Live Started');}
async function sharePost(){if(uploading)return;uploading=true;if(!file||!url){toast('Photo Add Pannu');uploading=false;return;}let btn=document.getElementById('shareBtnPost');if(btn){btn.innerText='Uploading...';btn.disabled=true;}try{await saveToServer(false);let sb=document.getElementById('successBox');if(sb)sb.classList.add('show');let st=document.getElementById('status');if(st)st.innerText='Server la Save aayiduchu!';if(btn)btn.innerText='Uploaded';toast('Uploaded');setTimeout(()=>location.href='./index.html',1200);}catch(e){let st=document.getElementById('status');if(st)st.innerText='Error: '+e.message;if(btn){btn.innerText='Upload Post';btn.disabled=false;}uploading=false;toast('Error - Try Again');}}
async function saveDraftAndBack(){closeDraft();try{await saveToServer(true);toast('Draft Saved');}catch(e){toast('Draft Error: '+e.message);}showPage('pageHome');}
(async()=>{let supa=getSupa();if(!supa)return;let {data:{session}}=await supa.auth.getSession();if(!session)location.href='./login.html';})();
_pushHist();
showPage('pageHome');renderMedia();renderQuickBar();setMode('post');updatePreview();
