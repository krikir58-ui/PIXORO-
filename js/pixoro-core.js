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
  let uid = localStorage.getItem('pixoro_user_id') || localStorage.getItem('pixoro_current_user') || 'giri_official';
  uid = uid.trim().toLowerCase().replace('@','');
  return {
    username: uid,
    name: localStorage.getItem('pixoro_name_'+uid) || localStorage.getItem('pixoro_name_giri') || 'Giri',
    photo: localStorage.getItem('pixoro_profile_pic') || 'https://i.pravatar.cc/100?img=12'
  };
}

function updateAllProfiles(){
  let p = getMyProfile();
  document.querySelectorAll('.my-pfp, .profile-pic, .my-avatar').forEach(el => el.src = p.photo);
  document.querySelectorAll('.my-username').forEach(el => el.textContent = '@'+p.username);
  // ID = Username mattum da - Name illa da
  document.querySelectorAll('.my-name').forEach(el => {
    if(el.id === 'displayName') el.textContent = p.name;
    else el.textContent = p.username;
  });
  // Top ID & Username tag - Username thaan da
  let top = document.getElementById('topUsername'); if(top) top.textContent = p.username;
  let tag = document.getElementById('usernameTag'); if(tag) tag.textContent = p.username;
  let dn = document.getElementById('displayName'); if(dn) dn.textContent = p.name;
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

document.addEventListener('DOMContentLoaded', updateAllProfiles);
