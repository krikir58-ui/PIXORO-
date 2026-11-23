// ===== PIXORO FOLLOW - THANI FILE DA =====
// RULE: Follow = Server la mattum thaan da - LocalStorage la Follow Illa da
//       Public = Direct Follow da - Private = Request da
//       Import / Export Illa da - Plain Script da - index.html la <script> nu Load Aagum da

function getFollowSupa(){ return window.getSupa ? window.getSupa() : window.supa; }

// Username vantha ID ah Maathura Function da
function resolveFollowUserId(uid){
  if(!uid) return null;
  uid = String(uid);
  if(uid.includes('-') && uid.length > 20) return uid;
  let allP = window.allProfiles || [];
  let pr = allP.find(x=>(x.username||'').toString().trim().toLowerCase()===uid.trim().toLowerCase());
  if(pr) return String(pr.id);
  if(window.profileMap){
    let pr2 = Object.values(window.profileMap).find(x=>(x.username||'').toString().trim().toLowerCase()===uid.trim().toLowerCase());
    if(pr2) return String(pr2.id);
  }
  return null;
}

// Ella Page layum Button ah Maathura Function da - Follow / Following / Requested
function syncAllFollowButtons(targetId, state){
  targetId = String(targetId);
  let txt = state==='following' ? 'Following' : state==='requested' ? 'Requested' : 'Follow';
  document.querySelectorAll('[data-follow-user]').forEach(btn=>{
    let bid = String(btn.dataset.followUser||'');
    if(bid===targetId || String(resolveFollowUserId(bid)||bid)===targetId){
      btn.innerText = btn.id==='followBtnMain' ? txt : txt;
      btn.classList.toggle('following', state==='following');
      btn.classList.toggle('requested', state==='requested');
      btn.dataset.followState = state;
    }
  });
  document.querySelectorAll('.followBtnPost, .followBtnPerusa, [id^="followBtn-"]').forEach(btn=>{
    let bid = btn.dataset.followUser;
    if(!bid){
      let oc = btn.getAttribute('onclick')||'';
      let m = oc.match(/['"]([^'"]+)['"]/);
      if(m) bid = m[1];
    }
    if(bid && String(resolveFollowUserId(bid) || bid)===targetId){
      btn.innerText = txt;
      btn.classList.toggle('following', state==='following');
      btn.classList.toggle('requested', state==='requested');
      btn.dataset.followState = state;
    }
  });
}

function broadcastFollow(targetId, state){
  targetId = String(targetId);
  syncAllFollowButtons(targetId, state);
  try{
    localStorage.setItem('pixoro_follow_sync', JSON.stringify({targetId, following: state, time: Date.now()}));
  }catch(e){}
  window.dispatchEvent(new CustomEvent('pixoroFollowChanged', {detail:{targetId, following: state}}));
}

window.addEventListener('storage', (e)=>{
  if(e.key==='pixoro_follow_sync' && e.newValue){
    try{ let d = JSON.parse(e.newValue); syncAllFollowButtons(d.targetId, d.following); }catch(err){}
  }
});
window.addEventListener('pixoroFollowChanged', (e)=>{
  syncAllFollowButtons(e.detail.targetId, e.detail.following);
});

// MAIN - Follow pannumbothu check pannum - Public vs Private da
async function followUser(currentUserId, targetUserId){
  let supabase = getFollowSupa(); if(!supabase) return {status:'follow'};
  targetUserId = resolveFollowUserId(targetUserId) || String(targetUserId);
  currentUserId = String(currentUserId);

  let {data: alreadyFollow} = await supabase.from('follows').select('*').eq('follower_id', currentUserId).eq('following_id', targetUserId).maybeSingle();
  if(alreadyFollow) return { status: 'following' };

  let {data: alreadyReq} = await supabase.from('follow_requests').select('*').eq('from_id', currentUserId).eq('to_id', targetUserId).eq('status','pending').maybeSingle();
  if(alreadyReq) return { status: 'requested' };

  let {data: target} = await supabase.from('profiles').select('is_private_account').eq('id', targetUserId).single();
  let isPrivate = target && target.is_private_account === true;

  if(isPrivate){
    let {error} = await supabase.from('follow_requests').insert({ from_id: currentUserId, to_id: targetUserId, status: 'pending' });
    if(error && error.code!=='23505') throw error;
    broadcastFollow(targetUserId, 'requested');
    return { status: 'requested' };
  } else {
    let {error} = await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId });
    if(error && error.code!=='23505') throw error;
    if(window.allFollows) window.allFollows.push({follower_id: currentUserId, following_id: targetUserId});
    broadcastFollow(targetUserId, 'following');
    return { status: 'following' };
  }
}

// Unfollow / Cancel Request / Toggle - Ella Page layum Itha than Use Pannanum da
// ✅ FIX - Feed la irunthu (username, btn) nu Varum da - 2 Param ah Yum Vaangiten da
async function pixoroToggleFollow(rawId, btn){
  let supabase = getFollowSupa(); if(!supabase) return null;
  let targetId = resolveFollowUserId(rawId) || String(rawId);
  // ✅ Username ah iruntha - Server la irunthu ID ah Edu da
  if(!targetId.includes('-')){
    try{
      let {data:p} = await supabase.from('profiles').select('id').ilike('username', String(rawId).replace('@','')).maybeSingle();
      if(p) targetId = String(p.id);
    }catch(e){}
  }
  let me = window.ME_ID;
  if(!me){
    try{ let {data:{session}} = await supabase.auth.getSession(); me = session?.user?.id; window.ME_ID = me; }catch(e){}
  }
  if(!targetId || String(targetId)===String(me)) return null;

  let {data: isF} = await supabase.from('follows').select('*').eq('follower_id', me).eq('following_id', targetId).maybeSingle();
  if(isF){
    await supabase.from('follows').delete().eq('follower_id', me).eq('following_id', targetId);
    if(window.allFollows) window.allFollows = window.allFollows.filter(f=>!(String(f.follower_id)===String(me) && String(f.following_id)===String(targetId)));
    broadcastFollow(targetId, 'follow');
    return { status: 'follow' };
  }

  let {data: isR} = await supabase.from('follow_requests').select('*').eq('from_id', me).eq('to_id', targetId).eq('status','pending').maybeSingle();
  if(isR){
    await supabase.from('follow_requests').delete().eq('from_id', me).eq('to_id', targetId);
    broadcastFollow(targetId, 'follow');
    return { status: 'follow' };
  }

  let res = await followUser(me, targetId);
  return res;
}

// Private ID request Accept / Decline da
async function handleFollowRequest(requestId, action){
  let supabase = getFollowSupa(); if(!supabase) return;
  let {data: req} = await supabase.from('follow_requests').select('*').eq('id', requestId).single();
  if(!req) return;
  if(action === 'accept'){
    await supabase.from('follows').insert({ follower_id: req.from_id, following_id: req.to_id });
    await supabase.from('follow_requests').delete().eq('id', requestId);
    broadcastFollow(req.from_id, 'following');
  } else {
    await supabase.from('follow_requests').delete().eq('id', requestId);
  }
}

window.resolveFollowUserId = resolveFollowUserId;
window.syncAllFollowButtons = syncAllFollowButtons;
window.broadcastFollow = broadcastFollow;
window.pixoroToggleFollow = pixoroToggleFollow;
window.followUser = followUser;
window.handleFollowRequest = handleFollowRequest;

window.toggleFollow = async function(otherId, btn){
  let r = await pixoroToggleFollow(otherId, btn);
  if(!r) return;
  if(window.showToast) showToast(r.status==='following' ? 'Followed da 🔥' : r.status==='requested' ? 'Request Sent da 🔒' : 'Unfollowed da 😴');
  if(window.feedMode==='following' && typeof renderFeed==='function') renderFeed();
};
window.toggleF = async function(uid, pid){
  let r = await pixoroToggleFollow(uid);
  if(!r) return;
  if(window.showToast) showToast(r.status==='following' ? 'Followed da 🔥' : r.status==='requested' ? 'Request Sent da 🔒' : 'Unfollowed da 😴');
};
window.toggleFollowMain = async function(){
  let targetId = window.VIEW_PROFILE ? window.VIEW_PROFILE.id : window.VIEW_USER_ID;
  let r = await pixoroToggleFollow(targetId);
  if(!r) return;
  let fc = document.getElementById('followerCount');
  if(fc && r.status==='following'){
    fc.innerText = parseInt(fc.innerText||'0')+1;
  }
  if(window.showToast) showToast(r.status==='following' ? 'Followed da 🔥' : r.status==='requested' ? 'Request Sent da 🔒' : 'Unfollowed da 😴');
};

// ✅ Feed ku - Username la irunthu Following ah nu Check pannu da
window.pixoroIsFollowing = function(uname){
  if(!uname) return false;
  let id = resolveFollowUserId(uname);
  if(window.allFollows && id) return window.allFollows.some(f=>String(f.following_id)===String(id));
  return false;
};
window.pixoroLoadFollowing = async function(){
  let supabase = getFollowSupa(); if(!supabase || !window.ME_ID) return;
  try{
    let {data} = await supabase.from('follows').select('following_id').eq('follower_id', window.ME_ID);
    window.allFollows = data||[];
    if(window.pixoroPaintAllFollowBtns) window.pixoroPaintAllFollowBtns();
  }catch(e){}
};
window.pixoroPaintAllFollowBtns = function(){
  // Feed Render pannumbothu thaan Paint aagum da - Ithu Extra Sync mattum da
};
