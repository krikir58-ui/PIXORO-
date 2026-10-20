// PIXORO ONE TICK FILE - Ella Edathukum Orey Link da Giri 🔥
const VERIFIED_USERS = ['giri_office']; // Itha list la Yaar Irukkaro Avangalukku mattum Tick Varum da

function isVerified(username){
  return VERIFIED_USERS.includes(username);
}

function applyTickEverywhere(){
  // Post, Reels, DM, Comment - Ella Username um Edu da
  document.querySelectorAll('.username, .post-username, .reel-username, .dm-username, .comment-username, .profile-username').forEach(el => {
    const name = el.textContent.trim().replace('✔️','').trim();
    if(isVerified(name) && !el.querySelector('.pixoro-blue-tick')){
      el.innerHTML += ` <svg class="pixoro-blue-tick" width="14" height="14" viewBox="0 0 24 24" fill="#0095F6"><path d="M12 1.8l2.4 2.1 3.2-.5 1 3 3 1.2 1 3-1 3-1.2 3-3 1.2-1 3-3.2-.5L12 22.2l-2.4-2.1-3.2.5-1-3-3-1.2-1-3 1-3 1.2-3 3-1.2 1-3 3.2.5z"/><path d="M10.5 15.5l-3-3 1.4-1.4 1.6 1.6 4.5-4.5 1.4 1.4z" fill="white"/></svg>`;
    }
  });
  // Display Name, Notes, Audio la Tick Vara Koodathu - Auto Delete da
  document.querySelectorAll('.my-name, #displayName, .display-name, .note, .audio').forEach(el => {
    const tick = el.querySelector('.pixoro-blue-tick');
    if(tick) tick.remove();
  });
}

// Page Load Aana Odane Tick Varum da
setInterval(applyTickEverywhere, 500);
