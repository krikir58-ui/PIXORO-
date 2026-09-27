// APP.JS - ELLA FILE AH CONNECT PANNURATHU DA GIRI - MAIN CONTROLLER DA!

const App = {
  init(){
    console.log("PIXORO Started da Giri 🔥");
    
    // Auth page ah first load pannu da
    if(typeof Auth !== 'undefined'){
      Auth.init();
    }

    // Upload box ah create pannu da
    const uploadBox = document.getElementById("uploadBox") || document.getElementById("upload-box") || document.body;
    
    // Index.html la uploadBox id irukka nu paaru da, illa na naama create pannuvom da
    if(document.getElementById("uploadBox")){
      document.getElementById("uploadBox").innerHTML = `
        <div class="card card-pad">
          <input type="file" id="fileInput" accept="image/*,video/*">
          <select id="postType">
            <option value="post">📸 Post ku</option>
            <option value="reel">🎬 Reels ku</option>
            <option value="story">🟢 Story ku (24hrs)</option>
          </select>
          <input id="capInput" placeholder="Caption da Giri...">
          <button onclick="Posts.upload()" class="btn-yellow" style="margin-top:5px;">UPLOAD PANNU DA 🚀</button>
        </div>
        <div id="zoomBox" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:100;align-items:center;justify-content:center;" onclick="this.style.display='none'">
          <img id="zoomImg" style="max-width:100%;max-height:100%">
        </div>
      `;
    }

    // Search page html set pannu da
    if(document.getElementById("page-search") && typeof Search !== 'undefined'){
      document.getElementById("page-search").innerHTML = Search.html || `<div class="card card-pad"><input id="searchInput" placeholder="Search..." oninput="Search.search(this.value)"><div id="searchResult"></div></div>`;
    }
  },

  show(page){
    // Ella page ah hide pannu da
    let home = document.getElementById("page-home") || document.getElementById("feed");
    let reels = document.getElementById("page-reels") || document.getElementById("reels-page");
    let search = document.getElementById("page-search") || document.getElementById("search-page");
    let profile = document.getElementById("page-profile") || document.getElementById("profile-page");

    if(home) home.style.display = page=='home'?'block':'none';
    if(reels) reels.style.display = page=='reels'?'block':'none';
    if(search) search.style.display = page=='search'?'block':'none';
    if(profile) profile.style.display = page=='profile'?'block':'none';

    // Page ku etha function ah call pannu da
    if(page=='home'){
      if(typeof Stories !== 'undefined' && Stories.load) Stories.load();
      if(typeof Posts !== 'undefined' && Posts.loadHome) Posts.loadHome();
      if(typeof Feed !== 'undefined' && Feed.load) Feed.load(); // Un feed.js ku da
    }
    if(page=='reels'){
      if(typeof Reels !== 'undefined' && Reels.load) Reels.load();
      else if(typeof Posts !== 'undefined') Posts.loadHome(); // Temporary da
    }
    if(page=='profile' && typeof Profile !== 'undefined'){
      Profile.load(currentUser.id);
    }
  },

  viewProfile(uid){
    this.show('profile');
    if(typeof Profile !== 'undefined') Profile.load(uid);
  },

  zoom(url){
    let box = document.getElementById("zoomBox");
    let img = document.getElementById("zoomImg");
    if(box && img){
      img.src = url;
      box.style.display = 'flex';
    } else {
      window.open(url, '_blank');
    }
  }
};

// App ah start pannu da Giri!
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Direct ah kooda call pannu da - DOM already loaded na
if(document.readyState !== 'loading'){
  App.init();
}
