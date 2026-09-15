function showPosts(){
 let p=JSON.parse(localStorage.getItem("pixoro_posts")||"[]");
 let feed = document.getElementById("feed");
 if(!feed) return;
 feed.innerHTML = p.map(u=>`<div style="margin:15px 0"><img src="${u}" style="width:100%;border-radius:12px;display:block"></div>`).join("");
}
showPosts();
