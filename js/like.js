// ===== PIXORO REELS BRIDGE V40 - V39 ku Reels ah Puriya Vaikkum Translator da =====
// ⚠️ V39 ah Thodatha da - Ithu Mattum Add Pannu da
(function(){
"use strict";
if(window.PIXORO_REELS_BRIDGE) return;
window.PIXORO_REELS_BRIDGE = true;

// ✅ Reels DOM ah - V39 ku Puriyura Mari Maathu da
function bridgeOneReel(reel){
  if(!reel || reel.dataset.bridged) return;
  reel.dataset.bridged = "1";
  let rawId = reel.dataset.id || reel.getAttribute("data-id") || "";
  let id = String(rawId||"");
  if(id.startsWith("reel-")) id = id.replace("reel-","");
  if(id){
    reel.dataset.postId = id;
    // ✅ Original data-id ah Azhikka Koodathu da - Reels.js ku Theva da
  }
  reel.classList.add("post", "post-card");
  let video = reel.querySelector("video.reel-main, video");
  if(video) video.classList.add("postMedia", "post-media");

  // ✅ Like Button - First .vBtn Thaan Like da
  let btns = reel.querySelectorAll(".vBar .vBtn");
  let likeBtn = btns[0];
  if(likeBtn){
    likeBtn.classList.add("like-btn", "like-button");
    likeBtn.setAttribute("data-like-btn", id);
    likeBtn.dataset.postId = id;
    likeBtn.dataset.likeBtn = id;
    let cnt = likeBtn.querySelector(".rCount");
    if(cnt){
      cnt.classList.add("like-count", "likes-count");
      cnt.setAttribute("data-like-count", id);
    }
  }
}

let _bridgeTimer = null;
let _paintTimer = null;
function bridgeAll(){
  // ✅ FIX 1 - Debounce da - Ella Mutation kum Oda Koodathu da - 120ms Wait Pannuvom da
  clearTimeout(_bridgeTimer);
  _bridgeTimer = setTimeout(()=>{
    document.querySelectorAll(".reel[data-id]").forEach(bridgeOneReel);
    // ✅ V39 Paint ah - Bridge Mudinja Apparam Mattum Koopdu da - Loop Varathu da
    clearTimeout(_paintTimer);
    _paintTimer = setTimeout(()=>{ try{ if(window.pixoroPaintAllLikes) window.pixoroPaintAllLikes(); }catch(_){} }, 50);
  }, 120);
}

window.addEventListener("pixoro-reels-rendered", ()=> setTimeout(bridgeAll, 50));

// ✅ FIX 1 - MutationObserver - Debounce oda Thaan da - Direct ah bridgeAll ah Koopda Koodathu da
let obs = new MutationObserver(()=>{ bridgeAll(); });
if(document.body) obs.observe(document.body, {childList:true, subtree:true});

// ✅ FIX 2 - likeReel - el.click() Panna Koodathu da - Thirumba likeReel ah Koopdum da - Recursion da
// ✅ Direct ah V39 Toggle ah Koopduvom da - Click ah Simulate Panna Venaam da
window.likeReel = function(id, el, e){
  if(e){ try{ e.stopPropagation(); e.preventDefault(); }catch(_){} }
  if(!el) return;
  let reel = el.closest(".reel");
  if(reel) bridgeOneReel(reel);
  let clean = String(id||"").replace("reel-","");
  // ✅ V39 Toggle da - Click Simulate Panna Venaam da
  if(window.pixoroToggleLike && reel){
    let liked = window.pixoroToggleLike(clean, reel, false);
    // ✅ Button Animation - V39 Button Animation Mariye da
    try{ el.animate([{transform:"scale(1)"},{transform:"scale(1.35)"},{transform:"scale(1)"}],{duration:280}); }catch(_){}
    // ✅ Heart Burst - Reels la Irukka HeartBurst ah Kaatu da
    let hb = reel?.querySelector(".heartBurst");
    if(hb && liked){
      hb.innerHTML = `<svg viewBox="0 0 24 24" fill="#ff3040" stroke="#fff" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
      hb.classList.remove("show"); void hb.offsetWidth; hb.classList.add("show");
    }
    return liked;
  }
  // ✅ V39 Illana - Pazhaya Style la Mattum Toggle Pannu da - Fallback da
  el.classList.toggle("liked");
};

// ✅ Follow Block Fix - V39 la Follow Illa da - Inga Mattum Fix Pannu da
window.toggleFollow = window.toggleFollow || function(btn){
  if(!btn) return;
  let f = btn.classList.contains("following");
  btn.classList.toggle("following", !f);
  btn.textContent = !f ? "Following" : "Follow";
  btn.style.opacity = "1";
  btn.style.pointerEvents = "auto";
};

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bridgeAll);
else bridgeAll();
setTimeout(bridgeAll, 500);
setTimeout(bridgeAll, 1500);

console.log("PIXORO REELS BRIDGE V40 LOADED - V39 + Reels Connected ❤️");
})();
