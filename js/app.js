import { loadRealFeed } from "./feed.js";
import { toggleLike } from "./likes.js";

const feedEl = document.getElementById("feed");
loadRealFeed((reels)=>{
  feedEl.innerHTML = "";
  reels.forEach(post=>{
    const div = document.createElement("div");
    div.innerHTML = `<div style="border:1px solid #333;padding:10px;margin:10px"><b>${post.email}</b> - ❤️ ${post.likes||0} <button onclick="like('${post.id}')">Like</button><br>${post.caption}</div>`;
    feedEl.appendChild(div);
  });
});
window.like = (id)=> toggleLike(id, "giri123");
