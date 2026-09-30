import { doc, updateDoc, increment, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

// REAL LIKE LOGIC DA GIRI
export async function toggleLike(postId, userId){
  const likeRef = doc(db, "reels", postId, "likes", userId);
  const postRef = doc(db, "reels", postId);
  const snap = await getDoc(likeRef);
  if(snap.exists()){
    await updateDoc(postRef, { likes: increment(-1) });
    // delete logic - simple ah count mattum kuraiyuthu
    return false;
  } else {
    await setDoc(likeRef, { userId, createdAt: new Date() });
    await updateDoc(postRef, { likes: increment(1) });
    return true;
  }
}
