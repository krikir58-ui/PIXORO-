import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export function loadRealFeed(callback){
  const q = query(collection(db, "reels"), orderBy("createdAt","desc"));
  return onSnapshot(q, (snap)=>{
    const reels = snap.docs.map(d=>{
      const data = d.data();
      let cleanUser = data.username || data.user || data.email || "pixoro";
      try {
        if(typeof cleanUser === 'string' && cleanUser.includes('"u"')){
          const parsed = JSON.parse(cleanUser);
          cleanUser = parsed.u || parsed.username || "";
          if(!cleanUser && data.email) cleanUser = data.email.split('@')[0];
          if(!cleanUser) cleanUser = "Giri";
        }
      } catch(e){}
      if(!cleanUser || cleanUser.includes('{') || cleanUser.includes('"')) cleanUser = "Giri";
      if(cleanUser.includes('@')) cleanUser = cleanUser.split('@')[0];
      return {id:d.id,...data, username: cleanUser};
    });
    if(callback) callback(reels);
    else window.renderReels && window.renderReels(reels);
  });
}
export const loadFeed = loadRealFeed;
