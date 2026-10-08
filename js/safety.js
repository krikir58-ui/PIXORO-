// js/safety.js - Girls Safety Secret System 🔒
import { supabase } from '../supabase.js';

// SCREENSHOT ALERT - Yaar screenshot eduthalum kandupudikkum!
export function initScreenshotAlert() {
  document.addEventListener('keyup', (e) => {
    // PrintScreen button
    if (e.key === 'PrintScreen') {
      reportScreenshot();
    }
  });

  // Phone la screenshot + Screen record block trick
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User vere app ku ponan - maybe screenshot tool open pannitan
      console.log("Safety check...");
    }
  });
}

async function reportScreenshot() {
  const { data: { user } } = await supabase.auth.getUser();
  // Yaar photo paathukittu iruntharo avangalukku alert pogum
  await supabase.from('safety_logs').insert({
    action: 'screenshot_taken',
    taken_by: user.id,
    taken_at: new Date()
  });
  alert("⚠️ Screenshot edutha - Owner ku theriyum!");
}

// FAKE ID BLOCK - 1 naal la 20 perukku mela follow panna block!
export async function checkFakeFollow(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
   .from('follows')
   .select('*', { count: 'exact' })
   .eq('follower_id', userId)
   .gte('created_at', today);

  if (count > 20) {
    // Auto Shadow Ban - Avan comment ellam yaarukkum theriyathu!
    await supabase.from('profiles').update({ is_shadow_banned: true }).eq('id', userId);
    return false; // Follow panna vida koodathu
  }
  return true;
    }
