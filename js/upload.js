import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export async function uploadRealPost(file, caption, email){
  // Username ah email la irunthu edukkrom - password kidayathu!
  const username = email? email.split('@')[0] : "Giri";
  const url = URL.createObjectURL(file);
  await addDoc(collection(db, "reels"), {
    videoUrl: url,
    caption: caption,
    email: email,
    username: username,
    likes: 0,
    comments: 0,
    views: 0,
    createdAt: serverTimestamp()
  });
  alert("Real ah post ayiduchu da Giri! 🔥");
}
