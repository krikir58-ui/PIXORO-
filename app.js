const SUPABASE_URL = "https://yecpltndhlzfjplzhcpm.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY_INGA_PODU_DA";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = localStorage.getItem("pixoro_user") || "";
let allPosts = [];
let zoomImg = null;

async function init() {
  if(currentUser) document.getElementById("loginBox").value = currentUser;
  loadFeed(); loadStories(); checkVerification();
}

function login() {
  const u = document.getElementById("loginBox").value.trim();
  if(!u) return alert("Name sollu da Giri!");
  currentUser = u;
  localStorage.setItem("pixoro_user", u);
  sb.from('profiles').upsert([{username: u}]).then(()=>{});
  document.getElementById("hiMsg").innerText = "Hi " + u + " da! 🔥";
  alert("Login Aayiduchi da Giri! " + u);
  loadFeed();
}

function logout(){ localStorage.clear(); location.reload(); }

// UPLOAD FEED DA
async function uploadPost() {
  const file = document.getElementById("fileInput").files[0];
  const cap = document.getElementById("captionInput").value;
  if(!file) return alert("Photo select pannu da Giri!");
  if(!currentUser) return alert("Login pannu da Giri!");

  const fileName = Date.now() + "-" + file.name;
  let {error} = await sb.storage.from('post-images').upload(fileName, file);
  if(error) return alert(error.message);
  let {data} = sb.storage.from('post-images').getPublicUrl(fileName);
  await sb.from('posts').insert([{image_url: data.publicUrl, caption: cap, username: currentUser}]);
  alert("PIXORO Post Aayiduchi da! 🔥");
  loadFeed();
}

// FEED WITH ALL FEATURES DA
async function loadFeed() {
  let {data: posts} = await sb.from('posts').select('*').order('created_at', {ascending:false});
  allPosts = posts || [];
  let html = "";
  for(let p of allPosts) {
    let {data: likes} = await sb.from('likes').select('*').eq('post_id', p.id);
    let {data: cmts} = await sb.from('comments').select('*').eq('post_id', p.id).order('created_at');
    let isLiked = likes?.some(l => l.username === currentUser);

    html += `
    <div style="background:#111; border:1px solid #333; border-radius:15px; margin:15px 0; overflow:hidden;">
      <div style="padding:10px; display:flex; justify-content:space-between;">
        <b onclick="openProfile('${p.username}')" style="cursor:pointer;">👤 ${p.username || 'Giri'}</b>
        <span onclick="deletePost('${p.id}')" style="color:red; cursor:pointer;">🗑️</span>
      </div>
      <img src="${p.image_url}" onclick="zoomImage('${p.image_url}')" style="width:100%; cursor:zoom-in;">
      <div style="padding:10px;">
        <div style="display:flex; gap:15px; font-size:22px;">
          <span onclick="likePost('${p.id}')" style="cursor:pointer; color:${isLiked?'red':'white'}">${isLiked?'❤️':'🤍'} ${likes?.length||0}</span>
          <span onclick="document.getElementById('cmt-${p.id}').focus()" style="cursor:pointer;">💬 ${cmts?.length||0}</span>
          <span onclick="sharePost('${p.image_url}')" style="cursor:pointer;">🚀 Share</span>
        </div>
        <p><b>${p.username}</b> ${p.caption||''}</p>
        <div style="max-height:80px; overflow-y:auto;">
          ${(cmts||[]).map(c=>`<p style="font-size:13px;"><b>${c.username}:</b> ${c.comment_text}</p>`).join('')}
        </div>
        <div style="display:flex; margin-top:5px;">
          <input id="cmt-${p.id}" placeholder="Comment pannu da Giri..." style="flex:1; background:#222; border:none; color:white; padding:8px; border-radius:10px;">
          <button onclick="addComment('${p.id}')" style="background:yellow; border:none; border-radius:10px; margin-left:5px; padding:0 12px;">Post</button>
        </div>
      </div>
    </div>`;
  }
  document.getElementById("feed").innerHTML = html || "No posts da Giri!";
}

async function likePost(postId) {
  if(!currentUser) return alert("Login pannu da!");
  let {data} = await sb.from('likes').select('*').eq('post_id', postId).eq('username', currentUser);
  if(data && data.length>0) { await sb.from('likes').delete().eq('post_id', postId).eq('username', currentUser); }
  else { await sb.from('likes').insert([{post_id: postId, username: currentUser}]); }
  loadFeed();
}
async function addComment(postId) {
  const input = document.getElementById(`cmt-${postId}`);
  if(!input.value.trim()) return;
  await sb.from('comments').insert([{post_id: postId, username: currentUser, comment_text: input.value}]);
  input.value=""; loadFeed();
}
async function deletePost(id){ if(confirm("Delete pannava da Giri?")){ await sb.from('posts').delete().eq('id', id); loadFeed(); } }
function sharePost(url){ if(navigator.share){ navigator.share({title:'PIXORO', url}); } else { navigator.clipboard.writeText(url); alert("Link Copy Aayiduchi da Giri! 🚀"); } }

// PROFILE + FOLLOW + PRIVATE DA
async function openProfile(username) {
  let {data: profile} = await sb.from('profiles').select('*').eq('username', username).single();
  let {data: followers} = await sb.from('follows').select('*').eq('following', username).eq('status','accepted');
  let {data: following} = await sb.from('follows').select('*').eq('follower', username).eq('status','accepted');
  let isFollowing = false;
  if(currentUser){ let {data} = await sb.from('follows').select('*').eq('follower', currentUser).eq('following', username); isFollowing = data && data.length>0; }

  let isPrivate = profile?.is_private;
  document.getElementById("feed").innerHTML = `
    <div style="background:#111; padding:15px; border-radius:15px; text-align:center;">
      <h2>👤 ${username} ${profile?.is_private?'🔒':''}</h2>
      <p>${profile?.bio||'Bio illa da Giri'}</p>
      <p>Followers: ${followers?.length||0} | Following: ${following?.length||0}</p>
      ${username!==currentUser? `<button onclick="followUser('${username}')" style="background:${isFollowing?'#333':'yellow'}; color:${isFollowing?'white':'black'}; padding:8px 15px; border-radius:20px; border:none;">${isFollowing?'Following':'Follow Da Giri'}</button>` : ''}
      ${username===currentUser? `<br><br><button onclick="togglePrivate()" style="background:#222; color:white; padding:6px 12px; border-radius:10px; border:1px solid #555;">Make ${isPrivate?'Public':'Private'} Account</button>` : ''}
      <br><br><button onclick="loadFeed()" style="background:white; color:black; padding:6px 12px; border-radius:10px;">Back to Feed</button>
    </div>`;
}

async function followUser(username) {
  if(!currentUser) return alert("Login pannu da!");
  let {data: target} = await sb.from('profiles').select('is_private').eq('username', username).single();
  let status = target?.is_private? 'pending' : 'accepted';
  let {data: existing} = await sb.from('follows').select('*').eq('follower', currentUser).eq('following', username);
  if(existing && existing.length>0){ await sb.from('follows').delete().eq('follower', currentUser).eq('following', username); alert("Unfollow pannita da Giri!"); }
  else { await sb.from('follows').insert([{follower: currentUser, following: username, status}]); alert(status==='pending'?'Follow Request Pochu da - Private Account da! 🔒':'Follow Aayita da Giri! 🔥'); }
  openProfile(username);
}
async function togglePrivate(){ let {data} = await sb.from('profiles').select('is_private').eq('username', currentUser).single(); await sb.from('profiles').update({is_private:!data?.is_private}).eq('username', currentUser); alert(!data?.is_private?"Account Private Aayiduchi da! 🔒":"Account Public Aayiduchi da! 🌍"); openProfile(currentUser); }

// ZOOM DA GIRI
function zoomImage(url){ document.getElementById("zoomBox").innerHTML = `<div onclick="this.parentElement.style.display='none'" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:9999;"><img src="${url}" style="max-width:95%; max-height:95%; border-radius:10px;"></div>`; document.getElementById("zoomBox").style.display='block'; }

// SEARCH DA
async function searchUsers(q){ if(!q) return; let {data} = await sb.from('profiles').select('*').ilike('username', `%${q}%`).limit(5); document.getElementById("searchResult").innerHTML = (data||[]).map(u=>`<p onclick="openProfile('${u.username}')" style="cursor:pointer; background:#222; padding:8px; border-radius:10px; margin:5px 0;">👤 ${u.username} ${u.is_private?'🔒':''}</p>`).join(''); }

// OTHERS - Stories, Verification old code same
async function loadStories(){ /* un old code */ }
async function checkVerification(){ /* un old code */ }
init();
