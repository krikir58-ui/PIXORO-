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
    name: localStorage.getItem('pixoro_name_'+uid) || localStorage.getItem('pixoro_name_giri') || 'Giri',
    photo: localStorage.getItem('pixoro_profile_pic') || 'https://i.pravatar.cc/100?img=12'
  };
}

// ===== PIXORO VERIFIED - GOLD STAR TICK - CORRECTED =====
function isGoldUser(u){
  if(!u) return false;
  let c=String(u).toLowerCase().split('@')[0].replace(/[^a-z0-9_.]/g,'');
  if(c==='giri_office'||c==='giri') return true;
  if(localStorage.getItem('pixoro_gold_'+c)==='yes') return true;
  return false;
}
function goldTickHTML(){
  return '<span class="pixoro-verified"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6.5" stroke="black" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
}
function getTick(u){ return isGoldUser(u) ? goldTickHTML() : ''; }
function addGoldCSS(){
  if(document.getElementById('pixoro-verified-style')) return;
  let s=document.createElement('style'); s.id='pixoro-verified-style';
  s.innerHTML='.pixoro-verified{width:16px;height:16px;min-width:16px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFE9A8,#FFD700 45%,#C9A227);clip-path:polygon(50% 0%,61% 5%,72% 2%,81% 10%,93% 12%,93% 25%,100% 35%,95% 50%,100% 65%,93% 75%,93% 88%,81% 90%,72% 98%,61% 95%,50% 100%,39% 95%,28% 98%,19% 90%,7% 88%,7% 75%,0% 65%,5% 50%,0% 35%,7% 25%,7% 12%,19% 10%,28% 2%,39% 5%);vertical-align:middle;margin-left:5px;flex-shrink:0}.pixoro-verified svg{width:9px;height:9px}';
  document.head.appendChild(s);
}
function applyGoldTicks(){
  addGoldCSS();
  document.querySelectorAll('#topUsername, #usernameTag, .my-username, .username, .user-name, [data-username]').forEach(el=>{
    if(el.querySelector('.pixoro-verified')) return;
    let txt = el.textContent.trim().replace('@','');
    if(isGoldUser(txt)){
      el.innerHTML = el.textContent.trim() + ' ' + goldTickHTML();
    }
  });
  // Giri name ah clear panna venaam - Tick anga venaam
}

function updateAllProfiles(){
  let p = getMyProfile();
  document.querySelectorAll('.my-pfp, .profile-pic, .my-avatar').forEach(el => el.src = p.photo);
  document.querySelectorAll('.my-username').forEach(el => el.textContent = '@'+p.username);
  document.querySelectorAll('.my-name').forEach(el => {
    el.textContent = p.name;
  });
  let top = document.getElementById('topUsername'); if(top) top.textContent = p.username;
  let tag = document.getElementById('usernameTag'); if(tag) tag.textContent = p.username;
  let dn = document.getElementById('displayName'); if(dn) dn.textContent = p.name;
  setTimeout(applyGoldTicks, 50);
}

function saveEdit(){
  let newU = document.getElementById('editUsername').value.trim().toLowerCase().replace('@','');
  let newN = document.getElementById('editName').value.trim();
  let newP = document.getElementById('editPfpPreview')?.dataset?.new;
  let oldU = getMyProfile().username;
  if(newU) {
    localStorage.setItem('pixoro_user_id', newU);
    localStorage.setItem('pixoro_current_user', newU);
    localStorage.setItem('pixoro_display_name', newU);
    localStorage.setItem('pixoro_old_user', oldU);
  }
  if(newN) {
    localStorage.setItem('pixoro_name_'+(newU||oldU), newN);
    localStorage.setItem('pixoro_name_'+oldU, newN);
  }
  if(newP) localStorage.setItem('pixoro_profile_pic', newP);
  saveToSupabase();
  updateAllProfiles();
  setTimeout(()=> location.reload(), 500);
}

document.addEventListener('DOMContentLoaded', ()=>{ updateAllProfiles(); setTimeout(applyGoldTicks,300); setTimeout(applyGoldTicks,1000); });
