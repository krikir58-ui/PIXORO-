// Pixoro Comment System - Instagram Style 🔵
let curPostId = null;
let replyTo = null;

function timeAgo(date){
  let sec = Math.floor((new Date() - new Date(date))/1000)
  if(sec < 10) return 'just now'
  if(sec < 60) return sec+'s'
  if(sec < 3600) return Math.floor(sec/60)+'m'
  if(sec < 86400) return Math.floor(sec/3600)+'h'
  if(sec < 604800) return Math.floor(sec/86400)+'d'
  if(sec < 2592000) return Math.floor(sec/604800)+'w'
  return new Date(date).toLocaleDateString()
}

function openComments(postId){
  curPostId = postId;
  document.getElementById('commentModal').style.display='flex';
  renderComments();
}
function closeComments(){
  document.getElementById('commentModal').style.display='none';
  cancelReply();
}
function cancelReply(){
  replyTo=null;
  document.getElementById('replyTag').style.display='none';
  document.getElementById('cmtInput').placeholder='What do you think of this?';
}
function setReply(user){
  replyTo=user;
  document.getElementById('replyTag').style.display='flex';
  document.getElementById('replyTxt').innerText='Replying to '+user;
  document.getElementById('cmtInput').value='@'+user+' ';
  document.getElementById('cmtInput').focus();
}
function addEmoji(e){
  document.getElementById('cmtInput').value+=e;
  document.getElementById('cmtInput').focus();
}
function renderComments(){
  let cmts = allComments.filter(c=>c.post_id==curPostId)
  let html=''
  for(let c of cmts){
    let time = timeAgo(c.created_at)
    html+=`<div class="cmtRow">
      <div class="cmtAvatar">${c.username[0].toUpperCase()}</div>
      <div class="cmtContent">
        <div class="cmtUser">${c.username} <span style="color:#777;margin-left:6px">${time}</span></div>
        <div class="cmtText">${c.comment}</div>
        <div class="cmtMeta"><b onclick="setReply('${c.username}')">Reply</b></div>
      </div>
      <div class="cmtLike" onclick="likeComment(${c.id})">♡</div>
    </div>`
  }
  if(cmts.length==0) html='<p style="text-align:center;color:#777;margin-top:30px">No comments yet<br><small>Be first to comment 🔵</small></p>'
  document.getElementById('cmtList').innerHTML=html
}
async function postComment(){
  let txt=document.getElementById('cmtInput').value.trim();
  if(!txt||!curPostId) return
  await supa.from('comments').insert({post_id:curPostId, username:ME, comment:txt})
  document.getElementById('cmtInput').value=''; cancelReply()
  let {data}=await supa.from('comments').select('*').order('created_at',{ascending:true})
  allComments=data||[]; renderComments(); renderFeed();
}
async function likeComment(cid){ alert('Comment ❤️ soon da! 🔵') }
