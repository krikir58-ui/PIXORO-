// follow.js - Public ID vs Private ID + Global Sync - Instagram Mari da
import { supabase } from './supabase.js'

// Username vantha ID ah Maathura Function da
export function resolveFollowUserId(uid){
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
export function syncAllFollowButtons(targetId, state){
  // state = 'following' | 'follow' | 'requested'
  targetId = String(targetId);
  let txt = state==='following' ? 'Following ✓' : state==='requested' ? 'Requested' : 'Follow';
  document.querySelectorAll('[data-follow-user]').forEach(btn=>{
    if(String(btn.dataset.followUser)===targetId){
      btn.innerText = btn.id==='followBtnMain' ? (state==='following' ? 'Following' : state==='requested' ? 'Requested' : 'Follow') : txt;
      btn.classList.toggle('following', state==='following');
      btn.classList.toggle('requested', state==='requested');
      btn.dataset.followState = state;
    }
  });
  // Pazhaya Button kum
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

export function broadcastFollow(targetId, state){
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
export async function followUser(currentUserId, targetUserId){
  targetUserId = resolveFollowUserId(targetUserId) || String(targetUserId);
  currentUserId = String(currentUserId);

  // 1. Already Following ah nu Check Pannu da
  let {data: alreadyFollow} = await supabase.from('follows').select('*').eq('follower_id', currentUserId).eq('following_id', targetUserId).maybeSingle();
  if(alreadyFollow) return { status: 'following' };

  // 2. Already Requested ah nu Check Pannu da
  let {data: alreadyReq} = await supabase.from('follow_requests').select('*').eq('from_id', currentUserId).eq('to_id', targetUserId).eq('status','pending').maybeSingle();
  if(alreadyReq) return { status: 'requested' };

  // 3. Target Private ah nu Check Pannu da
  let {data: target} = await supabase.from('profiles').select('is_private_account').eq('id', targetUserId).single();
  let isPrivate = target && target.is_private_account === true;

  if(isPrivate){
    // PRIVATE ID - Request anuppanum da
    let {error} = await supabase.from('follow_requests').insert({ from_id: currentUserId, to_id: targetUserId, status: 'pending' });
    if(error && error.code!=='23505') throw error;
    broadcastFollow(targetUserId, 'requested');
    return { status: 'requested' };
  } else {
    // PUBLIC ID - Direct follow da
    let {error} = await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId });
    if(error && error.code!=='23505') throw error;
    if(window.allFollows) window.allFollows.push({follower_id: currentUserId, following_id: targetUserId});
    broadcastFollow(targetUserId, 'following');
    return { status: 'following' };
  }
}

// Unfollow / Cancel Request / Toggle - Ella Page layum Itha than Use Pannanum da
export async function pixoroToggleFollow(rawId){
  let targetId = resolveFollowUserId(rawId) || String(rawId);
  let me = window.ME_ID || (await supabase.auth.getSession()).data.session?.user?.id;
  if(!targetId || String(targetId)===String(me)) return null;

  // 1. Following ah Irundha - Unfollow Pannu da
  let {data: isF} = await supabase.from('follows').select('*').eq('follower_id', me).eq('following_id', targetId).maybeSingle();
  if(isF){
    await supabase.from('follows').delete().eq('follower_id', me).eq('following_id', targetId);
    if(window.allFollows) window.allFollows = window.allFollows.filter(f=>!(String(f.follower_id)===String(me) && String(f.following_id)===String(targetId)));
    broadcastFollow(targetId, 'follow');
    return { status: 'follow' };
  }

  // 2. Requested ah Irundha - Request ah Cancel Pannu da
  let {data: isR} = await supabase.from('follow_requests').select('*').eq('from_id', me).eq('to_id', targetId).eq('status','pending').maybeSingle();
  if(isR){
    await supabase.from('follow_requests').delete().eq('from_id', me).eq('to_id', targetId);
    broadcastFollow(targetId, 'follow');
    return { status: 'follow' };
  }

  // 3. Illana - Follow / Request Pannu da
  let res = await followUser(me, targetId);
  return res;
}

// Private ID request Accept / Decline da
export async function handleFollowRequest(requestId, action){
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

// Pazhaya Function Names - HTML la onclick la Use Pannura Function da
window.resolveFollowUserId = resolveFollowUserId;
window.syncAllFollowButtons = syncAllFollowButtons;
window.broadcastFollow = broadcastFollow;
window.pixoroToggleFollow = pixoroToggleFollow;
window.followUser = followUser;
window.handleFollowRequest = handleFollowRequest;

window.toggleFollow = async function(otherId, btn){
  let r = await pixoroToggleFollow(otherId);
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
