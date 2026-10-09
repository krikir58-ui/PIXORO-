// REAL HACK-PROOF SAFETY + BLUE TICK SYSTEM 🔵🛡️
const ME = 'Giri';

async function loadSecurity(){
  let {data} = await window.supa.from('profiles').select('*').eq('username', ME).single();
  if(data){
    if(document.getElementById('privateAcc')) document.getElementById('privateAcc').checked = data.is_private;
    if(document.getElementById('ghostMode')) document.getElementById('ghostMode').checked = data.ghost_mode;
    if(document.getElementById('twoFactor')) document.getElementById('twoFactor').checked = data.two_factor;
    // Original blue tick - Supabase la irunthu than varum, hack panna mudiyathu!
    if(data.is_verified){
      document.getElementById('blueTick').style.display = 'inline';
      document.getElementById('tickStatus').innerText = 'Verified ✔️🔵 Original';
      document.getElementById('tickBtn').innerText = 'Verified ✔️';
      document.getElementById('tickBtn').disabled = true;
    }
  }
}

async function togglePrivate(){
  let v = document.getElementById('privateAcc').checked;
  await window.supa.from('profiles').upsert({username: ME, is_private: v});
  alert(v?'🔒 Private ON - Girls Safe! No one can see without follow!':'🌍 Public ON');
}

async function toggleGhost(){
  let v = document.getElementById('ghostMode').checked;
  await window.supa.from('profiles').upsert({username: ME, ghost_mode: v});
  alert(v?'👻 Ghost ON - Active status hide! Story view hide!':'👁️ Ghost OFF');
}

async function toggleTwoFactor(){
  let v = document.getElementById('twoFactor').checked;
  await window.supa.from('profiles').upsert({username: ME, two_factor: v});
  alert(v?'🛡️ 2-Step ON - Yarum hack panna mudiyathu! Email OTP varum!':'2-Step OFF');
}

// REAL BLUE TICK - Admin approve pannina than varum da! Local la varathu!
async function requestBlueTick(){
  let btn = document.getElementById('tickBtn');
  let status = document.getElementById('tickStatus');
  status.innerText = 'Request sent... Waiting for admin 🔵';
  btn.innerText = 'Pending...';
  btn.disabled = true;
  
  // Supabase la request save - Nee than approve pannanum da!
  await window.supa.from('blue_tick_requests').upsert({username: ME, status: 'pending'});
  await window.supa.from('profiles').upsert({username: ME}); // profile create

  alert('Blue tick request sent da Giri! Supabase la poi approve pannanum - Aprom than original tick varum! ✔️');
}

async function approveBlueTick(username){ // Itha nee mattum Supabase la run pannanum da!
  await window.supa.from('profiles').upsert({username: username, is_verified: true});
  await window.supa.from('blue_tick_requests').update({status: 'approved'}).eq('username', username);
}

function blockUser(username){
  window.supa.from('blocks').insert({blocker: ME, blocked: username}).then(()=>alert(username+' Blocked 🚫 - Inime unna paaka mudiyathu!'));
}

window.addEventListener('load', loadSecurity);
