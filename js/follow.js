let followTab='followers'; let currentProfile=ME;
async function loadFollows(){
  try{
    let {data:follows}=await supa.from('follows').select('*');
    let {data:blocks}=await supa.from('blocks').select('*').eq('blocker',ME);
    allFollows=follows||[]; blockedUsers=(blocks||[]).map(b=>b.blocked);
  }catch(e){ allFollows=[]; blockedUsers=[]; }
}
function isFollowing(u){return allFollows.some(f=>f.follower===ME && f.following===u)}
function getFollowers(u){return allFollows.filter(f=>f.following===u)}
function getFollowing(u){return allFollows.filter(f=>f.follower===u)}
function getFollowersCount(u){return getFollowers(u).length}
function getFollowingCount(u){return getFollowing(u).length}
function followBtnHtml(username){
  if(username===ME) return `<span style="color:#555;font-size:11px">YOU ✔️</span>`;
  if(isFollowing(username)) return `<button onclick="unfollowUser('${username}')" class="followingBtn">Following</button>`;
  return `<button onclick="followUser('${username}')" class="followBtn">Follow</button>`;
}
async function followUser(username){await supa.from('follows').insert({follower:ME,following:username});await loadFollows();renderFeed();if(document.getElementById('followModal').style.display==='flex')renderFollowList()}
async function unfollowUser(username){await supa.from('follows').delete().eq('follower',ME).eq('following',username);await loadFollows();renderFeed();if(document.getElementById('followModal').style.display==='flex')renderFollowList()}
function openFollowModal(username,tab='followers'){currentProfile=username;followTab=tab;document.getElementById('followModal').style.display='flex';updateFollowTabs();renderFollowList()}
function closeFollowModal(){document.getElementById('followModal').style.display='none'}
function updateFollowTabs(){document.getElementById('tabFollowers').className=followTab==='followers'?'active':'';document.getElementById('tabFollowing').className=followTab==='following'?'active':''}
function switchFollowTab(tab){followTab=tab;updateFollowTabs();renderFollowList()}
function renderFollowList(){
  let list=followTab==='followers'?getFollowers(currentProfile):getFollowing(currentProfile);
  let users=followTab==='followers'?list.map(f=>f.follower):list.map(f=>f.following);
  let html=''; if(users.length===0) html=`<p style="text-align:center;color:#777;margin-top:40px">No ${followTab} yet 🔵</p>`;
  else{for(let uname of users){if(blockedUsers.includes(uname))continue;html+=`<div class="followRow"><div class="followUser"><div class="followAvatar">${uname[0].toUpperCase()}</div><div><b>@${uname}</b><br><small style="color:#777">${getFollowersCount(uname)} followers</small></div></div>${followBtnHtml(uname)}</div>`}}
  document.getElementById('followList').innerHTML=html; document.getElementById('followTitle').innerText=`${currentProfile} - ${users.length} ${followTab}`;
}
