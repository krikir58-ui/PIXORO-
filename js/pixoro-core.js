// PIXORO CORE - Correct Version 🔥
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SB_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co'
const SB_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_'

export const supabase = window.supa || createClient(SB_URL, SB_KEY)
if(!window.supa) window.supa = supabase

export function isGoldUser(profile){
  if(!profile) return false
  if(typeof profile === 'string'){
    return profile.toLowerCase().replace(/[^a-z0-9_.]/g,'') === 'giri_office'
  }
  return String(profile.username||'').toLowerCase() === 'giri_office' || profile.verified === true
}

export function goldTickHTML(){
  return `<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
}

window.isGoldUser = isGoldUser
window.goldTickHTML = goldTickHTML
window.getTick = (p) => isGoldUser(p) ? goldTickHTML() : ''
window.supabase = supabase
