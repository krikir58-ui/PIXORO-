const SB_URL = 'https://bpgmbywdfrfzprhmwnhn.supabase.co';
const SB_KEY = 'PASTE_YOUR_REAL_ANON_KEY_HERE';

async function saveToSupabase(){
  let p = getMyProfile();
  await fetch(SB_URL + '/rest/v1/profiles', {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer '+SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ username: p.username, display_name: p.name, avatar_url: p.photo, bio: 'Pixoro Creator 🔥' })
  });
}

// PIXORO CORE - ELLA EDATHULAYUM MAARUM DA
function getMyProfile(){
  return {
    username: localStorage.getItem('pixoro_user_id') || 'giri_official',
    name: localStorage.getItem('pixoro_display_name') || 'Giri',
    photo: localStorage.getItem('pixoro_profile_pic') || 'https://i.pravatar.cc/100?img=12'
  };
}

function updateAllProfiles(){
  let p = getMyProfile();
  document.querySelectorAll('.my-pfp, .profile-pic, .my-avatar').forEach(el => el.src = p.photo);
  document.querySelectorAll('.my-username').forEach(el => el.textContent = '@'+p.username);
  document.querySelectorAll('.my-name').forEach(el => el.textContent = p.name);
}

function saveEdit(){
  let newU = document.getElementById('editUsername').value.trim().toLowerCase().replace('@','');
  let newN = document.getElementById('editName').value.trim();
  let newP = document.getElementById('editPfpPreview')?.dataset?.new;

  if(newU) localStorage.setItem('pixoro_user_id', newU);
  if(newN) localStorage.setItem('pixoro_display_name', newN);
  if(newP) localStorage.setItem('pixoro_profile_pic', newP);

  saveToSupabase();
  updateAllProfiles();
  setTimeout(()=> location.reload(), 500);
}

document.addEventListener('DOMContentLoaded', updateAllProfiles);
