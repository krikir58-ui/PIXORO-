// js/story-camera.js
let stream,facing='user';
async function startCam(){ try{ stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing}}); document.getElementById('camVid').srcObject=stream; }catch(e){ alert('Camera permission kudunga da!'); } }
function flipCam(){ facing=facing==='user'?'environment':'user'; if(stream) stream.getTracks().forEach(t=>t.stop()); startCam(); }
function cycleFilter(){ let v=document.getElementById('camVid'); v.style.filter=v.style.filter===''?'grayscale(1)':v.style.filter==='grayscale(1)'?'sepia(1)':'none'; }
function takePhoto(){ let v=document.getElementById('camVid'); let c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); sessionStorage.setItem('pixoro_story_data',c.toDataURL('image/jpeg')); sessionStorage.setItem('pixoro_story_type','image'); location.href='./story-editor.html'; }
startCam();
