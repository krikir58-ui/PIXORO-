// ===== PIXORO SHARE - v1013 - THANI FILE DA =====
function sharePost(id){
  let u = location.origin + '/index.html?id=' + id;
  if(navigator.share){ navigator.share({title:'Pixoro', url:u}); }
  else { navigator.clipboard.writeText(u); if(window.showToast) window.showToast('Link Copy Aachu da'); }
}
window.sharePost = sharePost;
function showToast(m){ let t = document.getElementById('toast'); if(!t) return; t.innerText = m; t.style.display = 'block'; setTimeout(()=> t.style.display = 'none', 1500); }
window.showToast = showToast;
