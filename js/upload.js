import { getCurrentUser } from "./auth.js";
export async function uploadPost(file, caption){
  let safeUser = getCurrentUser(); if(!safeUser || safeUser.includes('{')) safeUser = "Giri";
  let url = URL.createObjectURL(file);
  let post = { id: Date.now(), username: safeUser, user: safeUser, cap: caption, img: url, likes: 1, location: 'Tiruchuli • V2 SECURE' };
  let posts = []; try{ posts = JSON.parse(localStorage.getItem('pixoro_v2_posts')||'[]'); }catch(e){}
  posts.unshift(post);
  localStorage.setItem('pixoro_v2_posts', JSON.stringify(posts.slice(0,50)));
  alert('✅ V2 Secure Upload @'+safeUser);
  return post;
}
window.uploadPost = uploadPost;
window.uploadWorldPost = uploadPost;
