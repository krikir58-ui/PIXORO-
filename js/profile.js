// Profile Photo + Real Blue Tick - Secure da!
function chooseGilli(){ document.getElementById('gilliInput')?.click(); }

async function requestBlueTick(){
  let btn = document.getElementById('tickBtn');
  let status = document.getElementById('tickStatus');
  if(btn) btn.innerText = 'Checking...';
  
  const { data: { user } } = await supa.auth.getUser();
  if(!user){ alert('Login pannu da!'); return; }

  // Supabase la real ah verified ah nu check pannu da!
  const { data: profile } = await supa.from('profiles').select('is_verified').eq('id', user.id).single();
  
  if(profile && profile.is_verified){
    if(status) status.innerText = 'Verified ✔️💙';
    if(document.getElementById('blueTick')) document.getElementById('blueTick').style.display = 'inline';
    localStorage.setItem('pixoro_bluetick','verified');
    alert('Blue Tick Already Verified da Giri! ✔️💙');
  } else {
    // Verified illa na - request page ku anuppu da
    window.location.href = 'verify-request.html';
  }
}

// Page load aagumbothu blue tick check pannu
async function checkBlueTickOnLoad(){
  const { data: { user } } = await supa.auth.getUser();
  if(!user) return;
  const { data: profile } = await supa.from('profiles').select('is_verified').eq('id', user.id).single();
  if(profile && profile.is_verified){
    let status = document.getElementById('tickStatus');
    if(status) status.innerText = 'Verified ✔️💙';
    if(document.getElementById('blueTick')) document.getElementById('blueTick').style.display = 'inline';
  }
}
checkBlueTickOnLoad();
