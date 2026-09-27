const Reels = {
  async load(){ let {data:posts}=await sb.from('posts').select('*').order('created_at',{ascending:false}).limit(50); document.getElementById("page-reels").innerHTML=`<div class="reels-container">${(posts||[]).map(p=>`<div class="reel-item"><img src="${p.image_url}"><div class="reel-overlay"><b>@${p.username}</b> ${p.caption||''}</div><div class="reel-actions"><div onclick="Posts.like('${p.id}')">❤️</div><div>💬</div><div>🔖</div></div></div>`).join('')}</div>`; }
}
