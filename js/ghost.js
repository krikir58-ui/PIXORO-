import { supabase } from './supabase.js';

// Ghost Mode ON panna - Nee invisible aayiduva da!
export async function enableGhostMode() {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('profiles').update({ 
    is_ghost: true,
    last_seen: null 
  }).eq('id', user.id);
  
  localStorage.setItem('ghostMode', 'true');
  alert("👻 Ghost Mode ON da Giri! Nee online nu yaarukkum theriyathu!");
}

// Ghost Mode OFF panna
export async function disableGhostMode() {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('profiles').update({ 
    is_ghost: false 
  }).eq('id', user.id);
  
  localStorage.removeItem('ghostMode');
  alert("Ghost Mode OFF - Ippo normal da!");
    }
