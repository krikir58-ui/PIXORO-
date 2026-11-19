// create.js - Pixoro - js/supabase.js la irukka supa va use pannum da - KEY podave vendaam da
let step=1,type='post',file=null,url='',kind='image',filter='none',zoom=1,panX=0,panY=0,text='',tagged='',loc='',isPrivate=false;
let drawMode=false,drawColor='#ff2d55',eraser=false,hist=[],drawing=false,lastPos=null;
let dc=document.getElementById('drawCanvas'),dctx=dc.getContext('2d');
function getSupa(){ return window.supa || window.supabaseClient || window.SUPA; }
function setType(t,el){type=t;document.querySelectorAll('#typeTabs span').forEach(s=>s.classList.remove('on'));el.classList.add('on');document.getElementById('topTitle').innerText=t==='post'?'New post':t==='reels'?'New reel':'New story';}
function applyT(){let el=kind==='video'?document.getElementById('prevVid'):document.getElementById('prevImg');el.style.transform=`translate(-50%,-50%) translate(${panX}px,${panY}px) scale(${zoom})`;el.style.position='absolute';el.style.left='50%';el.style.top='50%';document.getElementById('zoomSlider').value=zoom;}
function setZoom(z){if(drawMode)return;zoom=Math.max(1,Math.min(3,z));if(zoom===1){panX=0;panY=0;}applyT();}
function setFilter(f,btn){filter=f;document.querySelectorAll('#editBar button').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');document.getElementById('prevImg').style.filter=f;document.getElementById('prevVid').style.filter=f;}
function addText(){let t=prompt('Text ezhuthu da');if(t)text=t;}
function toggleDraw(){drawMode=!drawMode;dc.classList.toggle('on',drawMode);document.getElementById('drawBar').style.display=drawMode?'flex':'none';if(drawMode){let b=document.getElementById('previewBox');let old=dc.toDataURL();dc.width=b.clientWidth;dc.height=b.clientHeight;let im=new Image();im.onload=()=>dctx.drawImage(im,0,0);im.src=old;}}
function setColor(c){eraser=false;drawColor=c;}
function setEraser(){eraser=true;}
function undoDraw(){if(!hist.length)return;let l=hist.pop();let im=new Image();im.onload=()=>{dctx.clearRect(0,0,dc.width,dc.height);dctx.drawImage(im,0,0);};im.src=l;}
function clearDraw(){hist.push(dc.toDataURL());dctx.clearRect(0,0,dc.width,dc.height);}
function getPos(e){let r=dc.getBoundingClientRect();return{x:(e.touches?e.touches[0].clientX:e.clientX)-r.left,y:(e.touches?e.touches[0].clientY:e.clientY)-r.top};}
dc.addEventListener('touchstart',e=>{e.preventDefault();hist.push(dc.toDataURL());drawing=true;lastPos=getPos(e);},{passive:false});
dc.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;let p=getPos(e);dctx.lineCap='round';dctx.lineJoin='round';dctx.globalCompositeOperation=eraser?'destination-out':'source-over';if(!eraser)dctx.strokeStyle=drawColor;dctx.lineWidth=eraser?20:8;dctx.beginPath();dctx.moveTo(lastPos.x,lastPos.y);dctx.lineTo(p.x,p.y);dctx.stroke();lastPos=p;},{passive:false});
dc.addEventListener('touchend',()=>{drawing=false;dctx.globalCompositeOperation='source-over';});
let stage=document.getElementById('previewBox'),sd=0,sz=1,sx=0,sy=0,spx=0,spy=0,drag=false;
stage.addEventListener('touchstart',e=>{if(drawMode||step!==2)return;if(e.touches.length===2){sd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);sz=zoom;}else if(e.touches.length===1){drag=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;spx=panX;spy=panY;}},{passive:true});
stage.addEventListener('touchmove',e=>{if(drawMode||step!==2)return;if(e.touches.length===2&&sd>0){let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setZoom(sz*(d/sd));}else if(e.touches.length===1&&drag&&zoom>1){panX=Math.max(-200,Math.min(200,spx+(e.touches[0].clientX-sx)));panY=Math.max(-300,Math.min(300,spy+(e.touches[0].clientY-sy)));applyT();}},{passive:true});
stage.addEventListener('touchend',()=>{drag=false;sd=0;});
document.getElementById('file').onchange=e=>{let f=e.target.files[0];if(!f)return;file=f;kind=f.type.includes('video')?'video':'image';if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);document.getElementById('emptyBox').style.display='none';zoom=1;panX=0;panY=0;if(kind==='video'){let v=document.getElementById('prevVid');v.src=url;v.style.display='block';v.play();document.getElementById('prevImg').style.display='none';}else{let p=document.getElementById('prevImg');p.src=url;p.style.display='block';document.getElementById('prevVid').style.display='none';}applyT();document.getElementById('grid').innerHTML='<div class="tile">'+(kind==='video'?'<video src="'+url+'" muted></video>':'<img src="'+url+'">')+'</div>';document.getElementById('nextBtn').style.display='block';};
function goBack(){if(step===3){step=2;showStep();}else if(step===2){step=1;showStep();}else location.href='./index.html';}
function showStep(){document.getElementById('step12').style.display=step===3?'none':'block';document.getElementById('step3').style.display=step===3?'block':'none';document.getElementById('gridSection').style.display=step===1?'block':'none';document.getElementById('typeTabs').style.display=step===1?'flex':'none';document.getElementById('editBar').style.display=step===2?'flex':'none';document.getElementById('zoomBar').style.display=step===2?'flex':'none';document.getElementById('cropGrid').style.display=step===2?'block':'none';if(step===3)document.getElementById('shareThumb').src=url;}
function goNext(){if(!file){document.getElementById('file').click();return;}if(step===1){step=2;showStep();return;}if(step===2){step=3;showStep();return;}}
function tagPeople(){let t=prompt('Username:');if(t){tagged=t;document.getElementById('tagTxt').innerText='@'+t+' ›';}}
function addLocation(){let l=prompt('Location:');if(l){loc=l;document.getElementById('locTxt').innerText=l+' ›';}}
function togglePrivate(){isPrivate=!isPrivate;document.getElementById('audTxt').innerText=isPrivate?'Private ›':'Everyone ›';}
async function bake(){if(kind==='video')return file;return new Promise(res=>{let img=new Image();img.onload=()=>{let W=1080,H=type==='post'?1350:1920;let c=document.createElement('canvas');c.width=W;c.height=H;let ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.filter=filter==='none'?'none':filter;let sc=Math.max(W/img.width,H/img.height)*zoom;let dw=img.width*sc,dh=img.height*sc;ctx.drawImage(img,(W-dw)/2+panX*(W/400),(H-dh)/2+panY*(H/600),dw,dh);if(text){ctx.filter='none';ctx.font='900 60px system-ui';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=10;ctx.fillStyle='#fff';ctx.fillText(text,W/2,H*0.35);}if(dc.width>0){ctx.filter='none';ctx.drawImage(dc,0,0,W,H);}c.toBlob(b=>res(b||file),'image/jpeg',0.92);};img.src=url;});}
async function sharePost(){
  let supa=getSupa(); if(!supa){alert('Supabase load aagala da - refresh pannu da');return;}
  let btn=document.getElementById('shareBtn');btn.innerText='Sharing...';btn.disabled=true;
  let st=document.getElementById('status');st.innerText='Uploading...';
  let cap=document.getElementById('caption').value||'Just Pixoro 🔥';if(tagged)cap+=' @'+tagged;if(loc)cap+=' 📍 '+loc;
  try{
    let {data:{session}}=await supa.auth.getSession();if(!session){location.href='./login.html';return;}
    let ME_RAW=session.user.email.split('@')[0];
    let finalBlob=await bake();
    let folder=type==='story'?'stories':type==='reels'?'reels':'posts';
    let ext=kind==='video'?'mp4':'jpg';
    let fn=folder+'/'+session.user.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.'+ext;
    let {error:upErr}=await supa.storage.from(folder).upload(fn,finalBlob,{contentType:kind==='video'?'video/mp4':'image/jpeg'});
    if(upErr)throw new Error('Storage: '+upErr.message);
    let {data:ud}=supa.storage.from(folder).getPublicUrl(fn);
    let {error}=await supa.from('posts').insert({user_id:session.user.id,username:ME_RAW,media_url:ud.publicUrl,image_url:kind==='image'?ud.publicUrl:null,video_url:kind==='video'?ud.publicUrl:null,media_type:type,caption:cap,visibility:isPrivate?'private_share':'public'});
    if(error)throw new Error('DB: '+error.message);
    location.href='./index.html';
  }catch(e){st.innerText='Error: '+e.message;alert('Error: '+e.message);btn.innerText='Share';btn.disabled=false;}
}
(async()=>{let supa=getSupa(); if(!supa) return; let {data:{session}}=await supa.auth.getSession();if(!session)location.href='./login.html';})();
showStep();
