// PIXORO CORE - Correct Version 🔥
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SB_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co'
const SB_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_'

// One Connection Only da - Double Aagathu da
export const supabase = window.supa || createClient(SB_URL, SB_KEY)
if(!window.supa) window.supa = supabase

// GOLD TICK - giri_office ku Mattum da - String + Object Rendum Work Aagum da
export function isGoldUser(profile){
  if(!profile) return false
  // String vantha - getTick('giri_office') - Feed, Comment la ippadi thaan varum da
  if(typeof profile === 'string'){
    return profile.toLowerCase().replace(/[^a-z0-9_.]/g,'') === 'giri_office'
  }
  // Object vantha - getTick({username:'giri_office'}) - Profile la ippadi varum da
  return profile.username === 'giri_office' || profile.verified === true
}

export function goldTickHTML(){
  return `<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
}

// Ella Page kum - Easy ah da
window.isGoldUser = isGoldUser
window.goldTickHTML = goldTickHTML
window.getTick = (p) => isGoldUser(p) ? goldTickHTML() : ''
window.supabase = supabase
