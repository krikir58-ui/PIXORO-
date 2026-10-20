const SB_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SB_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

async function saveToSupabase(){
  let p = getMyProfile();
  await fetch(SB_URL + '/rest/v1/profiles', {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer '+SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ username: p.username, display_name: p.name, avatar_url: p.photo, bio: 'Pixoro Creator 🔥' })
  });
}

function getMyProfile(){
  let uid = localStorage.getItem('pixoro_user_id') || localStorage.getItem('pixoro_current_user') || 'giri_office';
  uid = uid.trim().toLowerCase().replace('@','');
  return {
    username: uid,
    name: localStorage.getItem('pixoro_name_'+uid) || localStorage.getItem('pixoro_name_giri_office') || 'Giri',
    photo: localStorage.getItem('pixoro_profile_pic') || 'https://i.pravatar.cc/100?img=12'
  };
}

// ===== PIXORO VERIFIED - ONE LINK - MATTUM GIRI_OFFICE DA =====
function isGoldUser(u){
  if(!u) return false;
  let c=String(u).toLowerCase().split('@')[0].replace(/[^a-z0-9_.]/g,'');
  // MATTUM GIRI_OFFICE DA - GIRI KU ILLA DA
  if(c==='giri_office') return true;
  if(localStorage.getItem('pixoro_gold_'+c)==='yes') return true;
  return false;
}
function goldTickHTML(){
  return '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
}
function getTick(u){ return isGoldUser(u) ? goldTickHTML() : ''; }
window.getTick = getTick;
window.isGoldUser = isGoldUser;
window.goldTickHTML = goldTickHTML;

function addGoldCSS(){
  if(document.getElementById('pixoro-verified-style')) return;
  let s=document.createElement('style'); s.id='pixoro-verified-style';
  s.innerHTML='.pixoro-verified{width:16px;height:16px;min-width:16px;display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:50%;vertical-align:middle;margin-left:5px;flex-shrink:0}.pixoro-verified svg{width:10px;height:10px}';
  document.head.appendChild(s);
}
addGoldCSS();

// UPDATE - PFP MATTUM DA - NAME AH THODATHA DA
function updateAllProfiles(){
  let p = getMyProfile();
  document.querySelectorAll('.my-pfp').forEach(el => { if(p.photo) el.src = p.photo; });
  // NAME / USERNAME AH INGA MAATHATHA - PROFILE.HTML PAATHUKUM DA
}

// SAVE EDIT - CORE LA VECHIKATHA - PROFILE.HTML LA THAN IRUKANUM DA
// ITHA DELETE PANNTEN DA - DOUBLE SAVE PROBLEM VARUM DA
