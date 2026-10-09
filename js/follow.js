// Pixoro Follow + Follow Request System V2 🔵
let followTab='followers'; let currentProfile=ME;

async function loadFollows(){
  try{
    let {data:follows}=await supa.from('follows').select('*');
    let {data:blocks}=await supa.from('blocks').select('*').eq('blocker',ME);
    let {data:reqs}=await supa.from('follow_requests').select('*');
    window.allFollowRequests = reqs||[];
    allFollows=follows||[]; blockedUsers=(blocks||[]).map(b=>b.blocked);
  }catch(e){ allFollows=[]; blockedUsers=[]; window.allFollowRequests=[]; }
}
function isFollowing(u){return allFollows.some(f=>f.follower===ME && f.following===u)}
function hasRequested(u){return (window.allFollowRequests||[]).some(r=>r.follower===ME && r.following===u && r.status==='pending')}
function getFollowers(u){return allFollows.filter(f=>f.following===u)}
function getFollowing(u){return allFollows.filter(f=>f.follower===u)}
function getFollowersCount(u){return getFollowers(u).length}
function getFollowingCount(u){return getFollowing(u).length}
function getPendingRequests(){return (window.allFollowRequests||[]).filter(r=>r.following===ME && r.status==='pending')}

function followBtnHtml(username){
  if(username===ME) return `<span style="color:#555;font-size:11px">YOU ✔️</span>`;
  if(isFollowing(username)) return `<button onclick="unfollowUser('${username}')" class="followingBtn">Following</button>`;
  if(hasRequested(username)) return `<button onclick="cancelRequest('${username}')" class="requestedBtn">Requested</button>`;
  return `<button onclick="followUser('${username}')" class="followBtn">Follow</button>`;
}

// Follow pannum bothu request ah pogum
async function followUser(username){
  // Check if profile is private - for now all are private like insta
  let {data:profile}=await supa.from('profiles').select('is_private').eq('username', username).single();
  let isPrivate = profile?.is_private || true; // default private

  if(isPrivate){
    // Request anuppu
    await supa.from('follow_requests').insert({follower:ME, following:username, status:'pending'});
    // Notification
    await supa.from('notifications').insert({to_user:username, from_user:ME, type:'follow_request', message:`@${ME} requested to follow you`});
  } else {
    await supa.from('follows').insert({follower:ME, following:username});
  }
  await loadFollows(); renderFeed();
  if(document.getElementById('followModal').style.display==='flex') renderFollowList();
}

async function cancelRequest(username){
  await supa.from('follow_requests').delete().eq('follower',ME).eq('following',username);
  await loadFollows(); renderFeed(); renderFollowList();
}

async function unfollowUser(username){
  await supa.from('follows').delete().eq('follower',ME).eq('following',username);
  await supa.from('follow_requests').delete().eq('follower',ME).eq('following',username);
  await loadFollows(); renderFeed(); renderFollowList();
}

// Request Accept / Reject
async function acceptRequest(follower){
  await supa.from('follows').insert({follower:follower, following:ME});
  await supa.from('follow_requests').delete().eq('follower',follower).eq('following',ME);
  await supa.from('notifications').insert({to_user:follower, from_user:ME, type:'follow_accept', message:`@${ME} accepted your follow request`});
  await loadFollows(); renderRequests();
}
async function rejectRequest(follower){
  await supa.from('follow_requests').delete().eq('follower',follower).eq('following',ME);
  await loadFollows(); renderRequests();
}

// Modals
function openFollowModal(username,tab='followers'){currentProfile=username;followTab=tab;document.getElementById('followModal').style.display='flex';updateFollowTabs();renderFollowList()}
function closeFollowModal(){document.getElementById('followModal').style.display='none'}
function updateFollowTabs(){
  let count = getPendingRequests().length;
  document.getElementById('tabFollowers').className=followTab==='followers'?'active':'';
  document.getElementById('tabFollowing').className=followTab==='following'?'active':'';
  document.getElementById('tabRequests').className=followTab==='requests'?'active':'';
  document.getElementById('tabRequests').innerHTML = count>0 ? `Requests <span style="background:#ff3040;color:#fff;padding:2px 6px;border-radius:10px;font-size:10px">${count}</span>` : 'Requests';
}
function switchFollowTab(tab){followTab=tab;updateFollowTabs();renderFollowList()}

function renderFollowList(){
  if(followTab==='requests'){ renderRequests(); return; }
  let list=followTab==='followers'?getFollowers(currentProfile):getFollowing(currentProfile);
  let users=followTab==='followers'?list.map(f=>f.follower):list.map(f=>f.following);
  let html=''; if(users.length===0) html=`<p style="text-align:center;color:#777;margin-top:40px">No ${followTab} yet 🔵</p>`;
  else{for(let uname of users){if(blockedUsers.includes(uname))continue;html+=`<div class="followRow"><div class="followUser"><div class="followAvatar">${uname[0].toUpperCase()}</div><div><b>@${uname}</b><br><small style="color:#777">${getFollowersCount(uname)} followers</small></div></div>${followBtnHtml(uname)}</div>`}}
  document.getElementById('followList').innerHTML=html; document.getElementById('followTitle').innerText=`${currentProfile} - ${users.length} ${followTab}`;
}

function renderRequests(){
  let reqs = getPendingRequests();
  let html=''; 
  if(reqs.length===0) html=`<p style="text-align:center;color:#777;margin-top:40px">No pending requests 🔵<br><small>Someone requests, it will show here</small></p>`;
  else{
    for(let r of reqs){
      html+=`<div class="followRow"><div class="followUser"><div class="followAvatar">${r.follower[0].toUpperCase()}</div><div><b>@${r.follower}</b><br><small style="color:#777">Wants to follow you</small></div></div><div style="display:flex;gap:6px"><button onclick="acceptRequest('${r.follower}')" class="followBtn">Accept</button><button onclick="rejectRequest('${r.follower}')" class="followingBtn">Reject</button></div></div>`;
    }
  }
  document.getElementById('followList').innerHTML=html;
  document.getElementById('followTitle').innerText=`Requests - ${reqs.length}`;
}

// Top la Request count kaamikkanum na
function requestCountHtml(){
  let c = getPendingRequests().length;
  return c>0 ? `<span onclick="openFollowModal('${ME}','requests')" style="background:#ff3040;color:#fff;padding:4px 8px;border-radius:12px;font-size:12px;cursor:pointer;margin-left:8px">${c} requests</span>` : '';
}
