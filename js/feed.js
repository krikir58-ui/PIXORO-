function showPosts(){
let p=JSON.parse(localStorage.getItem("pixoro_posts")||"[]");
document.getElementById('feed').innerHTML=p.map(u=>`<img src="${u}" style="width:100%;border-radius:12px;margin-top:10px">`).join("");
}
