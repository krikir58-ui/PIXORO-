function showPosts(){
 let p=JSON.parse(localStorage.getItem("pixoro_posts")||"[]");
 p=p.filter(u=>u&&u.startsWith("https://"));
 localStorage.setItem("pixoro_posts",JSON.stringify(p));
 document.getElementById("feed").innerHTML=p.map(u=>`<img src="${u}" style="width:100%;border-radius:12px;margin-top:10px">`).join("");
}
showPosts();
