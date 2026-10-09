// Profile Photo + Blue Tick 🔵
function chooseGilli(){ document.getElementById('gilliInput')?.click(); }
function requestBlueTick(){
  let btn = document.getElementById('tickBtn');
  let status = document.getElementById('tickStatus');
  if(status) status.innerText = 'Pending... 🔵';
  if(btn) btn.innerText = 'Pending...';
  localStorage.setItem('pixoro_bluetick','pending');
  setTimeout(()=>{
    if(status) status.innerText='Verified ✔️🔵';
    if(document.getElementById('blueTick')) document.getElementById('blueTick').style.display='inline';
    localStorage.setItem('pixoro_bluetick','verified');
    alert('Blue Tick Verified da Giri! ✔️🔵');
  },2000);
}
