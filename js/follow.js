// PIXORO FOLLOW SYSTEM - Instagram Style 🔵
let allFollows = []
let blockedUsers = []

async function loadFollows(){
  let {data} = await supa.from('follows').select('*')
  allFollows = data || []
  let {data:blocks} = await supa.from('blocks').select('*').eq('blocker', ME)
  blockedUsers = (blocks||[]).map(b=>b.blocked)
}

function getFollowersCount(username){
  return allFollows.filter(f=>f.following==username && f.status!=='pending').length
}

function isFollowing(username){
  return allFollows.some(f=>f.follower==ME && f.following==username)
}

function followBtnHtml(username){
  if(username===ME) return `<span style="font-size:11px;color:#777;font-weight:600">YOU ✓</span>`
  
  // INTHA STYLE THAN NEENGA KETTA IMAGE MAARI DA - White Border!
  let following = isFollowing(username)
  if(following){
    return `<button onclick="toggleFollow('${username}',this)" style="border:1.5px solid #fff;border-radius:20px;background:#fff;color:#000;padding:5px 16px;font-size:13px;font-weight:600;cursor:pointer">Following</button>`
  } else {
    return `<button onclick="toggleFollow('${username}',this)" style="border:1.5px solid #fff;border-radius:20px;background:#000;color:#fff;padding:5px 18px;font-size:13px;font-weight:600;cursor:pointer">Follow</button>`
  }
}

async function toggleFollow(username, btn){
  if(btn) {
    btn.textContent = '...'
    btn.disabled = true
  }
  
  let already = isFollowing(username)
  if(already){
    await supa.from('follows').delete().eq('follower',ME).eq('following',username)
  } else {
    await supa.from('follows').insert({follower:ME, following:username, status:'accepted'})
  }
  
  await loadFollows()
  if(window.renderFeed) renderFeed()
}

function openFollowModal(username, tab){ /* your existing modal code */ }
function closeFollowModal(){ document.getElementById('followModal').style.display='none' }
function switchFollowTab(t){ }
