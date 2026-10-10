import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// Ghost Mode ON panna - Nee invisible aayiduva da!
export async function enableGhostMode() {
  let username = getUser(); // Local user - Giri
  if(!username) username = 'Giri';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if(user){
      await supabase.from('profiles').update({ 
        is_ghost: true,
        last_seen: null 
      }).eq('id', user.id);
    } else {
      // Auth illa na - profiles table la username vechu update pannu
      await supabase.from('profiles').update({ 
        is_ghost: true 
      }).eq('username', username);
    }
  } catch(e){
    console.log("Ghost DB error, but local ON:", e)
  }
  
  localStorage.setItem('ghostMode', 'true');
  localStorage.setItem('pixoro_ghost', 'true'); // Stories.js ku
  localStorage.setItem('pixoro_seen', JSON.stringify([])); // Reset seen
  
  // UI Effect
  document.body.style.filter = 'grayscale(0.2)';
  
  alert("👻 Ghost Mode ON da Giri!\n\n✅ Story paatha theriyathu\n✅ Online nu theriyathu\n✅ Last seen hide\n\nNee ippo invisible da! 🔵");
  updateGhostUI(true);
}

// Ghost Mode OFF panna
export async function disableGhostMode() {
  let username = getUser();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if(user){
      await supabase.from('profiles').update({ is_ghost: false }).eq('id', user.id);
    } else {
      await supabase.from('profiles').update({ is_ghost: false }).eq('username', username || 'Giri');
    }
  } catch(e){}

  localStorage.removeItem('ghostMode');
  localStorage.removeItem('pixoro_ghost');
  document.body.style.filter = 'none';

  alert("👁️ Ghost Mode OFF\nIppo normal da Giri! Ellarum unna paakalam!");
  updateGhostUI(false);
}

export function toggleGhost(){
  let isGhost = localStorage.getItem('ghostMode') === 'true';
  if(isGhost) disableGhostMode();
  else enableGhostMode();
}

export function isGhostMode(){
  return localStorage.getItem('ghostMode') === 'true';
}

function updateGhostUI(isGhost){
  let btn = document.getElementById('ghostToggleBtn');
  if(btn){
    btn.innerText = isGhost ? '👻 Ghost ON' : '👁️ Ghost OFF';
    btn.style.background = isGhost ? '#00BFFF' : '#222';
    btn.style.color = isGhost ? '#000' : '#fff';
  }
}

// Auto check on load
window.addEventListener('DOMContentLoaded', ()=>{
  if(isGhostMode()){
    document.body.style.filter = 'grayscale(0.2)';
    updateGhostUI(true);
  }
});

// Global ku
window.toggleGhost = toggleGhost;
