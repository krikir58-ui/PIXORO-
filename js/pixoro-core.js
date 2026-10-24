// PIXORO CORE - Correct Version 🔥 - Gold Tick + Post Fix da
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SB_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co'
const SB_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_'

export const supabase = window.supa || createClient(SB_URL, SB_KEY)
if(!window.supa) window.supa = supabase

// Gold User Check - PIXORO + Old Name Rendum da - Veliya Instagram Name Theriyathu da
export function isGoldUser(profile){
  if(!profile) return false
  if(typeof profile === 'string'){
    let c = profile.toLowerCase().replace(/[^a-z0-9_.]/g,'')
    return c === 'pixoro_giri' || c === 'giri_office'
  }
  let u = String(profile.username||'').toLowerCase()
  return u === 'pixoro_giri' || u === 'giri_office' || profile.verified === true || profile.is_gold === true
}

export function goldTickHTML(){
  return `<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
}

window.isGoldUser = isGoldUser
window.goldTickHTML = goldTickHTML
window.getTick = (p) => isGoldUser(p) ? goldTickHTML() : ''
window.supabase = supabase
