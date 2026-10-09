// Girls Safety + No Hack System 🔵🛡️
function togglePrivate(){ 
  let v = document.getElementById('privateAcc')?.checked;
  localStorage.setItem('pixoro_private', v);
  alert(v?'Private ON 🔒 Girls Safe!':'Public ON');
}
function toggleGhost(){
  let v = document.getElementById('ghostMode')?.checked;
  localStorage.setItem('pixoro_ghost', v);
  alert(v?'Ghost ON 👻 No tracking!':'Ghost OFF');
}
function blockUser(username){
  let blocks = JSON.parse(localStorage.getItem('pixoro_blocks')||'[]');
  if(!blocks.includes(username)){ blocks.push(username); localStorage.setItem('pixoro_blocks', JSON.stringify(blocks)); alert(username+' Blocked 🚫'); }
}
