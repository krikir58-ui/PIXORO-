import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
export function loadRealFeed(callback){
  const q = query(collection(db, "reels"), orderBy("createdAt","desc"));
  return onSnapshot(q, (snap)=>{
    const reels = snap.docs.map(d=>({id:d.id, ...d.data()}));
    callback(reels);
  });
}
