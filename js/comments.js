let curPostId=null, replyTo=null, selectedCmt=null;
function timeAgo(d){if(!d)return'now';let diff=Math.floor((new Date()-new Date(d))/1000);if(diff<10)return'just now';if(diff<60)return diff+'s';if(diff<3600)return Math.floor(diff/60)+'m';if(diff<86400)return Math.floor(diff/3600)+'h';if(diff<604800)return Math.floor(diff/86400)+'d';return new Date(d).toLocaleDateString()}
function openComments(id){curPostId=id;document.getElementById('commentModal').style.display='flex';renderComments()}
function closeComments(){document.getElementById('commentModal').style.display='none';cancelReply();closeCmtOptions()}
function cancelReply(){replyTo=null;document.getElementById('replyTag').style.display='none'}
function setReply(u){replyTo=u;document.getElementById('replyTag').style.display='flex';document.getElementById('replyTxt').innerText='Replying to @'+u;document.getElementById('cmtInput').value='@'+u+' ';document.getElementById('cmtInput').focus()}
function addEmoji(e){document.getElementById('cmtInput').value+=e;document.getElementById('cmtInput').focus()}
function showCmtOptions(cId,username){selectedCmt={id:cId,username};let isMine=username===ME;document.getElementById('cmtOptContent').innerHTML=`${isMine?`<button onclick="deleteComment(${cId})" style="color:#ff3040">🗑️ Delete</button>`:''}<button onclick="reportComment(${cId})">🚩 Report</button>${!isMine?`<button onclick="blockUser('${username}')" style="color:#ff3040">🚫 Block @${username}</button>`:''}<button onclick="closeCmtOptions()" style="color:#888">Cancel</button>`;document.getElementById('cmtOptionModal').style.display='flex'}
function closeCmtOptions(){document.getElementById('cmtOptionModal').style.display='none'}
async function deleteComment(cId){if(!confirm('Delete ah?'))return;await supa.from('comments').delete().eq('id',cId);closeCmtOptions();let{data}=await supa.from('comments').select('*').order('created_at',{ascending:true});allComments=data||[];renderComments();renderFeed()}
async function reportComment(){alert('Reported @'+selectedCmt.username+' 🔵');closeCmtOptions()}
async function blockUser(username){if(!confirm('Block @'+username+'?'))return;try{await supa.from('blocks').insert({blocker:ME,blocked:username})}catch(e){}if(!blockedUsers.includes(username))blockedUsers.push(username);closeCmtOptions();renderComments();renderFeed()}
function renderComments(){
  let cmts=allComments.filter(c=>c.post_id==curPostId).filter(c=>!blockedUsers.includes(c.username));
  let html=''; for(let c of cmts){html+=`<div class="cmtRow"><div class="cmtAvatar">${c.username[0].toUpperCase()}</div><div class="cmtContent" onclick="showCmtOptions(${c.id},'${c.username}')"><div class="cmtUser">${c.username} <span style="color:#777;margin-left:6px">${timeAgo(c.created_at)}</span></div><div class="cmtText">${c.comment}</div><div class="cmtMeta"><b onclick="event.stopPropagation();setReply('${c.username}')">Reply</b> • •••</div></div></div>`}
  if(cmts.length==0) html='<p style="text-align:center;color:#777;margin-top:30px">No comments yet<br><small>Be first 🔵</small></p>';
  document.getElementById('cmtList').innerHTML=html
}
async function postComment(){let txt=document.getElementById('cmtInput').value.trim();if(!txt||!curPostId)return;let {error}=await supa.from('comments').insert({post_id:curPostId,username:ME,comment:txt});if(error){alert(error.message);return}document.getElementById('cmtInput').value='';cancelReply();let{data}=await supa.from('comments').select('*').order('created_at',{ascending:true});allComments=data||[];renderComments();renderFeed()}
