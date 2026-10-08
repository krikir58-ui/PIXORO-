import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export async function uploadRealPost(file, caption, email){
  let username = "Giri";
  if(email && email.includes('@')){
    username = email.split('@')[0];
  }
  const stored = localStorage.getItem('username') || localStorage.getItem('pixoro_user');
  if(stored &&!stored.includes('{') &&!stored.includes('"')){
    username = stored;
  }
  if(!username || username.includes('{')) username = "Giri";
  const url = URL.createObjectURL(file);
  await addDoc(collection(db, "reels"), {
    videoUrl: url,
    caption: caption,
    email: email || "",
    username: username,
    likes: 0,
    comments: 0,
    views: 0,
    createdAt: serverTimestamp()
  });
  alert("Post ayiduchu da Giri! Username: " + username);
}
