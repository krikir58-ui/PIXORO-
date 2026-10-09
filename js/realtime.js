let realtimeChannel=null;
function enableRealtime(){
  realtimeChannel=supa.channel('pixoro-live')
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'comments'},p=>{if(!allComments.some(c=>c.id===p.new.id)){allComments.push(p.new);if(curPostId===p.new.post_id)renderComments();renderFeed();if(navigator.vibrate)navigator.vibrate(50)}})
  .on('postgres_changes',{event:'DELETE',schema:'public',table:'comments'},p=>{allComments=allComments.filter(c=>c.id!==p.old.id);renderComments();renderFeed()})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'likes'},p=>{if(!allLikes.some(l=>l.post_id===p.new.post_id&&l.username===p.new.username)){allLikes.push(p.new);renderFeed();if(p.new.username!==ME)blastHeart()}})
  .on('postgres_changes',{event:'DELETE',schema:'public',table:'likes'},p=>{allLikes=allLikes.filter(l=>!(l.post_id===p.old.post_id&&l.username===p.old.username));renderFeed()})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'follows'},p=>{if(!allFollows.some(f=>f.follower===p.new.follower&&f.following===p.new.following)){allFollows.push(p.new);renderFeed()}})
  .on('postgres_changes',{event:'DELETE',schema:'public',table:'follows'},p=>{allFollows=allFollows.filter(f=>!(f.follower===p.old.follower&&f.following===p.old.following));renderFeed()})
  .subscribe(s=>{if(s==='SUBSCRIBED')console.log('✅ Pixoro LIVE ON 🔵')});
    }
