import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export function loadRealFeed(callback){
  const q = query(collection(db, "reels"), orderBy("createdAt","desc"));
  return onSnapshot(q, (snap)=>{
    const reels = snap.docs.map(d=>{
      const data = d.data();
      // Giri secret fix - Password ah hide pannu!
      let cleanUser = data.username || data.user || "pixoro";
      try {
        if (typeof cleanUser === 'string' && cleanUser.includes('"u"')) {
          const parsed = JSON.parse(cleanUser);
          cleanUser = parsed.u; // Giri mattum, password illa!
        }
      } catch(e){}
      
      return {id:d.id, ...data, username: cleanUser};
    });
    if(callback) callback(reels);
    else {
      // Direct render if no callback
      window.renderReels && window.renderReels(reels);
    }
  });
}

// Old name ku support
export const loadFeed = loadRealFeed;
