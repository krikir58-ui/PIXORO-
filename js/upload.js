function handlePost(){
 let input=document.getElementById("fileInput");
 if(!input||!input.files[0]){ alert("Photo select pannu da Giri!"); return; }
 let reader=new FileReader();
 reader.onload=function(e){
   let url=e.target.result;
   let posts=JSON.parse(localStorage.getItem("pixoro_posts")||"[]");
   posts.unshift(url);
   localStorage.setItem("pixoro_posts",JSON.stringify(posts));
   showPosts();
   let msg=document.getElementById("msg");
   if(msg){msg.innerText="Semma da Giri! Post Ready!"; msg.style.color="lightgreen";}
 };
 reader.readAsDataURL(input.files[0]);
}
let btn=document.getElementById("postBtn");
if(btn) btn.onclick=handlePost;
