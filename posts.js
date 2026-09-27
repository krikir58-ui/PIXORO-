const Posts = {
  async loadHome(){
    let {data:posts}=await sb.from('posts').select('*').order('created_at',{ascending:false}).limit(30);
    let {data:profiles}=await sb.from('profiles').select('username,is_verified');
    let pMap={}; (profiles||[]).forEach(p=>pMap[p.username]=p);
    let html=""; for(let p of posts||[]){
      let {data:likes}=await sb.from('likes').select('*').eq('post_id',p.id);
      let {data:comments}=await sb.from('comments').select('*').eq('post_id',p.id);
      let {data:saved}=await sb.from('saves').select('*').eq('post_id',p.id).eq('user_id',currentUser.id).single();
      let {data:views}=await sb.from('views').select('*').eq('post_id',p.id);
      let liked=likes?.some(l=>l.user_id==currentUser.id); let isOwn=p.user_id==currentUser.id;
      html+=`<div class="card" style="padding:0;"><div class="card-pad" style="display:flex;justify-content:space-between;"><b>👤 ${p.username} ${pMap[p.username]?.is_verified?'✅':''}</b><span style="display:flex;gap:10px;"><small>${views?.length||0} 👁️</small>${isOwn?`<span onclick="Posts.edit('${p.id}','${(p.caption||'').replace(/'/g,"")}')" style="cursor:pointer;">✏️</span><span onclick="Posts.del('${p.id}')" style="cursor:pointer;">🗑️</span>`:''}</span></div>
      <img src="${p.image_url}" class="post-img" onclick="Posts.view('${p.id}')"><div class="card-pad"><div style="display:flex;gap:18px;font-size:22px;"><span onclick="Posts.like('${p.id}')">${liked?'❤️':'🤍'} ${likes?.length||0}</span><span>💬 ${comments?.length||0}</span><span onclick="Posts.save('${p.id}')">${saved?'💾':'🔖'}</span></div><p><b>${p.username}</b> ${p.caption||''}</p>${(comments||[]).slice(-2).map(c=>`<p style="font-size:13px;color:#ccc;"><b>${c.username}:</b> ${c.comment_text}</p>`).join('')}<div style="display:flex;margin-top:8px;"><input id="c-${p.id}" placeholder="Comment..."><button onclick="Posts.comment('${p.id}')" style="background:#ffeb3b;color:#000;margin-left:5px;border-radius:8px;">Post</button></div></div></div>`;
    } document.getElementById("page-home").innerHTML=html;
  },
  async upload(){ const file=document.getElementById("fileInput").files[0], cap=document.getElementById("capInput").value, type=document.getElementById("postType").value; if(!file) return alert("File select pannu!"); const fn=currentUser.id+"/"+Date.now()+"-"+file.name; await sb.storage.from('post-images').upload(fn,file); let {data}=sb.storage.from('post-images').getPublicUrl(fn); if(type=='story'){ await sb.from('stories').insert([{user_id:currentUser.id,username:currentProfile.username,image_url:data.publicUrl}]); } else { await sb.from('posts').insert([{image_url:data.publicUrl,caption:cap,username:currentProfile.username,user_id:currentUser.id}]); } App.show('home'); },
  async like(pid){ let {data}=await sb.from('likes').select('*').eq('post_id',pid).eq('user_id',currentUser.id).single(); if(data) await sb.from('likes').delete().eq('id',data.id); else await sb.from('likes').insert([{post_id:pid,user_id:currentUser.id,username:currentProfile.username}]); this.loadHome(); },
  async comment(pid){ const t=document.getElementById("c-"+pid).value; if(!t) return; await sb.from('comments').insert([{post_id:pid,user_id:currentUser.id,username:currentProfile.username,comment_text:t}]); this.loadHome(); },
  async save(pid){ let {data}=await sb.from('saves').select('*').eq('post_id',pid).eq('user_id',currentUser.id).single(); if(data) await sb.from('saves').delete().eq('id',data.id); else await sb.from('saves').insert([{post_id:pid,user_id:currentUser.id}]); this.loadHome(); },
  async view(pid){ await sb.from('views').insert([{post_id:pid,user_id:currentUser.id}]); },
  async del(id){ if(!confirm("Delete da?")) return; await sb.from('posts').delete().eq('id',id); this.loadHome(); },
  async edit(id,oldCap){ let nc=prompt("Caption maathu da Giri:",oldCap); if(nc!=null){ await sb.from('posts').update({caption:nc}).eq('id',id); this.loadHome(); } }
}
