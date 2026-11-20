let type='post',file=null,url='',kind='image',filter='none',text='',song='Trending Audio',loc='Chennai, India',aud='Everyone',tag='@friend_name';
let clips=[],galleryPhotos=[],trimStart=0,trimEnd=15,totalDur=15,uploading=false,captionVal='',galFilter='all',soundOn=false,zoom=1,panX=0,panY=0,hintTimer=null,toastTimer=null;

function toast(m){let t=document.getElementById('toast');t.innerText=m;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800);}
function fmt(s){s=Math.max(0,s);return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}
function updateChrome(id){document.body.classList.toggle('hideChrome',id!=='pageHome');}
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));document.getElementById(id).classList.add('on');updateChrome(id);closeFullAll();}
function openCreateSheet(){document.getElementById('createSheet')?.classList.add('show');}
function closeCreateSheet(){document.getElementById('createSheet')?.classList.remove('show');}

/* POST / STORY / REEL / LIVE - KILLA PILL MOVE */
function setMode(t){
  type=t;
  document.querySelectorAll('#modePill button').forEach(b=>b.classList.toggle('on',b.dataset.mode===t));
  let active=document.querySelector('#modePill button.on');let ind=document.getElementById('modeInd');
  if(active&&ind){ind.style.width=active.offsetWidth+'px';ind.style.transform='translateX('+(active.offsetLeft-4)+'px)';}
  document.getElementById('homeTitle').innerText=t==='post'?'New post':t==='reels'?'New reel':t==='story'?'New story':'Live';
  document.getElementById('galPreview').className='galPreview '+t;
  document.getElementById('pvChipTxt').innerText=t==='post'?'1:1 - Drag to adjust':t==='reels'?'9:16 - Reels':t==='story'?'9:16 - Story':'LIVE';
  document.getElementById('sugAudio').style.display=(t==='reels'&&url)?'flex':'none';
  setType(t);updatePreview();
}
function setType(t){type=t;document.getElementById('editTitle').innerText=t==='post'?'Edit Photo':t==='reels'?'Edit Reel':'Story Edit';document.getElementById('uploadTitle').innerText=t==='post'?'Upload Post':t==='reels'?'Upload Reel':'Upload Story';renderQuickBar();}

/* PREVIEW - PHOTO MATTUM ADJUST - BLACK GAP VARAATHU */
function clampPan(){let st=document.getElementById('pvStage');let maxX=Math.max(0,(st.clientWidth*(zoom-1))/2);let maxY=Math.max(0,(st.clientHeight*(zoom-1))/2);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));}
function applyZoom(){clampPan();let el=kind==='video'?document.getElementById('pvVid'):document.getElementById('pvImg');if(el)el.style.transform='translate3d('+panX+'px,'+panY+'px,0) scale('+zoom+')';}
function updatePreview(){
  let pvImg=document.getElementById('pvImg'),pvVid=document.getElementById('pvVid'),play=document.getElementById('pvPlay');
  if(!url){pvImg.style.display='none';pvVid.style.display='none';document.getElementById('pvEmpty').style.display='grid';document.getElementById('pvTop').style.display='none';document.getElementById('cropHint').style.display='none';document.getElementById('sugAudio').style.display='none';return;}
  document.getElementById('pvEmpty').style.display='none';document.getElementById('pvTop').style.display='flex';
  let hint=document.getElementById('cropHint');hint.style.display='block';hint.classList.remove('hide');clearTimeout(hintTimer);hintTimer=setTimeout(()=>hint.classList.add('hide'),2500);
  showMedia(pvImg,pvVid,url,kind);applyZoom();
  document.getElementById('sugAudio').style.display=type==='reels'?'flex':'none';
  if(kind==='video'){pvVid.muted=!soundOn;pvVid.currentTime=0;pvVid.play().catch(()=>{});play.style.display='none';}
  else{play.style.display='none';try{pvVid.pause();}catch(e){}}
}
function toggleSound(e){if(e)e.stopPropagation();soundOn=!soundOn;let v=document.getElementById('pvVid');if(v){v.muted=!soundOn;if(soundOn)v.play().catch(()=>{});}toast(soundOn?'Sound ON':'Sound OFF');}
function togglePreviewPlay(e){if(e)e.stopPropagation();let v=document.getElementById('pvVid');if(v.paused){v.play();document.getElementById('pvPlay').style.display='none';}else{v.pause();document.getElementById('pvPlay').style.display='grid';}}

/* GALLERY + EDIT + UPLOAD */
function showMedia(imgEl,vidEl,src,k){if(k==='video'){vidEl.src=src;vidEl.style.display='block';imgEl.style.display='none';}else{imgEl.src=src;imgEl.style.display='block';vidEl.style.display='none';try{vidEl.pause();}catch(e){}}}
function renderMedia(){let list=galleryPhotos.filter(p=>galFilter==='all'||p.kind===galFilter);let html=list.map((p)=>{let idx=galleryPhotos.indexOf(p);return '<div class="tile '+(url===p.url?'sel':'')+'" onclick="selectGallery('+idx+')">'+(p.kind==='video'?'<video src="'+p.url+'" muted playsinline></video>':'<img src="'+p.url+'">')+'<span class="tick">'+(url===p.url?'✓':'')+'</span></div>';}).join('');document.getElementById('mediaGridHome').innerHTML=html;}
function selectGallery(i){let p=galleryPhotos[i];if(!p)return;url=p.url;kind=p.kind;file=p.file;zoom=1;panX=0;panY=0;showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);renderMedia();updatePreview();}
function setGalTab(f,btn){galFilter=f;document.querySelectorAll('.galTabs button').forEach(b=>b.classList.remove('sel'));if(btn)btn.classList.add('sel');renderMedia();}
function goSelectNext(){if(!url){document.getElementById('fileMulti').click();return;}goEdit();}
function goEdit(){if(!url){toast('Gallery la irunthu Photo Add Pannu');return;}showMedia(document.getElementById('editImg'),document.getElementById('editVid'),url,kind);showMedia(document.getElementById('upImgPost'),document.getElementById('upVidPost'),url,kind);showPage('pageEdit');setType(type);}
function goUpload(){if(!url){toast('Photo illa');return;}showPage('pageUpload');document.getElementById('captionPost').value=captionVal;syncFields();}
function syncCap(){captionVal=document.getElementById('captionPost').value;}
function syncFields(){document.getElementById('locVal').innerText=loc;document.getElementById('tagVal').innerText=tag;document.getElementById('musicVal').innerText=song;document.getElementById('audVal').innerText=aud;}
function promptLoc(){let l=prompt('Location',loc);if(l!==null){loc=l;syncFields();}}
function promptTag(){let t=prompt('Tag People',tag);if(t!==null){tag=t;syncFields();}}
function toggleAud(){aud=aud==='Everyone'?'Private':'Everyone';syncFields();}
function removeUploadPhoto(){url='';file=null;showPage('pageHome');renderMedia();updatePreview();}
function renderQuickBar(){let q=document.getElementById('quickBar');if(type==='post')q.innerHTML='<button onclick="openFull(\'pageTextFull\')">Aa Text</button><button onclick="openFull(\'pageStickerFull\')">Sticker</button>';else q.innerHTML='<button onclick="openFull(\'pageAudioFull\')">Add Song</button><button onclick="openFull(\'pageTextFull\')">Aa Text</button><button onclick="openFull(\'pageStickerFull\')">Sticker</button>';}
function askDraft(){document.getElementById('draftPopup').classList.add('show');}
function closeDraft(){document.getElementById('draftPopup').classList.remove('show');}
function startOver(){closeDraft();showPage('pageHome');}
function closeFull(){document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));}
function closeFullAll(){document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));}
function openFull(id){document.querySelectorAll('.fullPage').forEach(p=>p.classList.remove('show'));let e=document.getElementById(id);if(e)e.classList.add('show');}

/* FILE + DRAG / PINCH - */
function addClip(f){let r=new FileReader();r.onload=ev=>{let k=f.type.includes('video')?'video':'image';let c={url:ev.target.result,kind:k,file:f};galleryPhotos.push(c);url=c.url;kind=k;file=f;renderMedia();updatePreview();};r.readAsDataURL(f);}
document.getElementById('file')?.addEventListener('change',e=>{addClip(e.target.files[0]);e.target.value='';});
document.getElementById('fileMulti')?.addEventListener('change',e=>{Array.from(e.target.files).forEach(f=>addClip(f));e.target.value='';});

(function(){
  let pv=document.getElementById('galPreview'),stage=document.getElementById('pvStage'),sx=0,sy=0,ox=0,oy=0,drag=false,lastDist=0;
  pv.addEventListener('touchstart',e=>{if(!url)return;stage.classList.add('dragging');if(e.touches.length===1){drag=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;ox=panX;oy=panY;}if(e.touches.length===2){drag=false;lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}},{passive:true});
  pv.addEventListener('touchmove',e=>{if(!url)return;if(e.touches.length===1&&drag){panX=ox+(e.touches[0].clientX-sx);panY=oy+(e.touches[0].clientY-sy);applyZoom();}if(e.touches.length===2){let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(lastDist>0){zoom=Math.max(1,Math.min(3,zoom*(d/lastDist)));applyZoom();}lastDist=d;}},{passive:true});
  pv.addEventListener('touchend',()=>{drag=false;lastDist=0;stage.classList.remove('dragging');});
  pv.addEventListener('dblclick',()=>{if(!url)return;zoom=zoom===1?2:1;panX=0;panY=0;applyZoom();});
})();
(function(){let pill=document.getElementById('modePill'),sx=0,modes=['post','story','reels','live'];pill.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});pill.addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){let cur=modes.indexOf(type);if(dx<0&&cur<3)setMode(modes[cur+1]);if(dx>0&&cur>0)setMode(modes[cur-1]);}},{passive:true});})();

async function saveToServer(isDraft){/* Un Pazhaya saveToServer Function ah Inga Paste pannu da - Matha Venaam */}
async function sharePost(){if(uploading)return;uploading=true;if(!file||!url){toast('Photo Add Pannu');uploading=false;return;}let btn=document.getElementById('shareBtnPost');btn.innerText='Uploading...';try{await saveToServer(false);toast('Uploaded');setTimeout(()=>{location.href='./index.html';},1200);}catch(e){btn.innerText='Upload Post';uploading=false;toast('Error - Try Again');}}
async function saveDraftAndBack(){closeDraft();await saveToServer(true);showPage('pageHome');toast('Draft Saved');}

showPage('pageHome');renderMedia();renderQuickBar();setMode('post');updatePreview();
