import { supabase } from './supabase.js';
import { clean, getUser } from './auth.js';

export async function loadFeed(filter=null){
  let { data: posts } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(30);
  if(!posts) posts=[];

  // Follow list edukkurom
  let me = getUser();
  let { data: myFollows } = await supabase.from('follows').select('following').eq('follower', me);
  let following = (myFollows||[]).map(f=>f.following);

  let html = '';
  for(let p of posts){
    let { data: likes } = await supabase.from('likes').select('*').eq('post_id', p.id);
    let { data: cmts } = await supabase.from('comments').select('*').eq('post_id', p.id).order('created_at',{ascending:true}).limit(5);
    let likeCount = likes?.length || 0;
    let isLiked = likes?.some(l=>l.username===me);
    let isFollowing = following.includes(p.username);

    html+=`
    <div class="post">
      <div class="post-top">
        <img src="https://i.pravatar.cc/100?u=${p.username}">
        <b>@${clean(p.username)}</b>
        ${p.username!==me ? `<button onclick="window.doFollow('${p.username}')" style="margin-left:auto; background:${isFollowing?'#222':'#0095f6'}; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px">${isFollowing?'Following':'Follow'}</button>` : ''}
      </div>
      <img class="post-img" src="${p.img}" ondblclick="window.doLike('${p.id}')">
      <div class="post-cap">
        <div style="display:flex; gap:14px; font-size:22px; margin-bottom:6px">
          <span onclick="window.doLike('${p.id}')" style="cursor:pointer">${isLiked?'❤️':'🤍'} ${likeCount}</span>
          <span onclick="window.openComment('${p.id}')" style="cursor:pointer">💬 ${cmts?.length||''}</span>
          <span onclick="window.doShare('${p.id}')" style="cursor:pointer">✈️</span>
        </div>
        <b>@${clean(p.username)}</b> ${p.cap||''}
        <div id="c-${p.id}" style="margin-top:6px; font-size:13px; opacity:0.9">
          ${(cmts||[]).map(c=>`<div><b>@${clean(c.username)}</b> ${c.text}</div>`).join('')}
        </div>
        <div style="display:flex; gap:6px; margin-top:6px">
          <input id="inp-${p.id}" placeholder="Add comment..." style="flex:1; background:#111; border:1px solid #222; color:#fff; padding:6px 10px; border-radius:20px; font-size:12px">
          <button onclick="window.addComment('${p.id}')" style="background:#0095f6; border:none; color:#fff; padding:6px 12px; border-radius:20px; font-size:12px">Post</button>
        </div>
      </div>
    </div>`;
  }
  document.getElementById('feedList').innerHTML = html;
}

// Global functions
window.doLike = async (postId)=>{
  let u=getUser();
  let { data } = await supabase.from('likes').select('*').eq('post_id', postId).eq('username', u);
  if(data && data.length>0){ await supabase.from('likes').delete().eq('post_id', postId).eq('username', u); }
  else{ await supabase.from('likes').insert([{post_id:postId, username:u}]); }
  loadFeed();
};

window.addComment = async (postId)=>{
  let inp=document.getElementById('inp-'+postId); let txt=inp.value.trim(); if(!txt) return;
  await supabase.from('comments').insert([{post_id:postId, username:getUser(), text:txt}]);
  inp.value=''; loadFeed();
};

window.doShare = async (postId)=>{
  if(navigator.share){ navigator.share({title:'Pixoro', text:'Check this on Pixoro 🔥', url: location.href}); }
  else{ navigator.clipboard.writeText(location.href); alert('Link copied da Giri! 📋'); }
};

window.doFollow = async (username)=>{
  let me=getUser(); let { data } = await supabase.from('follows').select('*').eq('follower',me).eq('following',username);
  if(data && data.length>0){ await supabase.from('follows').delete().eq('follower',me).eq('following',username); }
  else{ await supabase.from('follows').insert([{follower:me, following:username}]); }
  loadFeed();
};

window.openComment = (id)=>{ document.getElementById('inp-'+id)?.focus(); };
