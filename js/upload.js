async function uploadPost(){
const file = document.getElementById('fileInput').files[0];
if(!file) return alert("Photo select pannu da Giri!");
document.getElementById('status').innerText = "Uploading...";
document.getElementById('postBtn').disabled = true;
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", UPLOAD_PRESET);
try{
const res = await fetch("https://api.cloudinary.com/v1_1/"+CLOUD_NAME+"/image/upload", { method: "POST", body: formData});
const data = await res.json();
let posts = JSON.parse(localStorage.getItem("pixoro_posts") || "[]");
posts.unshift(data.secure_url);
localStorage.setItem("pixoro_posts", JSON.stringify(posts));
document.getElementById('status').innerText = "Semma da Giri! Post Ready!";
showPosts();
}catch(e){ alert(e.message); }
document.getElementById('postBtn').disabled = false;
}
