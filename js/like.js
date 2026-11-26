// ===== PIXORO REELS BRIDGE - V39 ku Reels ah Puriya Vaikkum Translator da =====
// ⚠️ V39 ah Thodatha da - Ithu Mattum Add Pannu da
(function(){
"use strict";
if(window.PIXORO_REELS_BRIDGE) return;
window.PIXORO_REELS_BRIDGE = true;

// ✅ Reels DOM ah - V39 ku Puriyura Mari Maathu da
// .reel -> data-post-id + .post
// .vBtn (Like) -> .like-btn + data-like-btn
// .rCount -> .like-count + data-like-count
// video.reel-main -> .postMedia
function bridgeOneReel(reel){
  if(!reel || reel.dataset.bridged) return;
  reel.dataset.bridged = "1";
  // ✅ V39 getPostId() - data-post-id ah Paakkum da
  let id = reel.dataset.id || reel.getAttribute("data-id") || "";
  if(id){
    if(id.startsWith("reel-")) id = id.replace("reel-","");
    reel.dataset.postId = id;
    reel.dataset.id = reel.getAttribute("data-id"); // Original ah Vaichuko da
  }
  reel.classList.add("post", "post-card");
  let video = reel.querySelector("video.reel-main");
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
  // ✅ Comment Count - V39 ku Theva Illa da - Aana Count Correct ah Varum da
}

// ✅ Ellam Reels ah Bridge Pannu da
function bridgeAll(){
  document.querySelectorAll(".reel[data-id]").forEach(bridgeOneReel);
  // ✅ V39 Paint ah Thirumba Koopdu da - Reels Like Red Aagum da
  if(window.pixoroPaintAllLikes) window.pixoroPaintAllLikes();
}

// ✅ Reels Render Aana Odane Bridge Pannu da
window.addEventListener("pixoro-reels-rendered", ()=> setTimeout(bridgeAll, 50));

// ✅ Dynamic ah Reels Vantha kooda Bridge Pannu da
let obs = new MutationObserver(()=> bridgeAll());
if(document.body) obs.observe(document.body, {childList:true, subtree:true});

// ✅ Reels la Irukka Pazhaya likeReel / openComments ah - V39 ku Connect Pannu da
// reels.js la Irukka likeReel ah Override Pannatha da - V39 Button Click ah Thaan Use Pannu da
window.likeReel = function(id, el, e){
  if(e) e.stopPropagation();
  // ✅ V39 Button Click Mariye - Button ah Click Panna Mari Seiyu da
  // El irundha - Athu Thaan Button da - Atha V39 ku Kudu da
  if(el){
    // V39 - Click Listener la Irukku da - Manual ah Toggle Pannu da
    let reel = el.closest(".reel");
    if(reel) bridgeOneReel(reel);
    // Button ah Click Panna - V39 Click Handler Odum da
    el.click();
    // Click Handler Block Aana - Direct ah Paint Pannu da
    setTimeout(()=>{
      let clean = String(id||"").replace("reel-","");
      let liked = window.FEED_LIKES ? window.FEED_LIKES.has(clean) : el.classList.contains("liked");
      // Heart Burst - Reels la Irukka HeartBurst ah Kaatu da
      let hb = reel?.querySelector(".heartBurst");
      if(hb && liked){
        hb.innerHTML = `<svg viewBox="0 0 24 24" fill="#ff3040" stroke="#fff" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
        hb.classList.remove("show"); void hb.offsetWidth; hb.classList.add("show");
      }
    }, 60);
  }
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

// ✅ Start
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bridgeAll);
else bridgeAll();
setTimeout(bridgeAll, 500);
setTimeout(bridgeAll, 1500);

console.log("PIXORO REELS BRIDGE LOADED - V39 + Reels Connected ❤️");
})();
