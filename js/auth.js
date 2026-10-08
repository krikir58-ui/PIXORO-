export function clean(s){
  if(!s) return "Giri";
  s = String(s).trim();
  if(s.includes('{') || s.includes('"') || s.includes(':')) return "Giri";
  return s.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || "Giri";
}
export function getUser(){ return clean(localStorage.getItem('pixoro_user_clean')||'Giri'); }

export function initAuth(){
  window.login = ()=>{
    let safe = clean(document.getElementById('usernameInput').value);
    localStorage.setItem('pixoro_user_clean', safe);
    localStorage.setItem('pixoro_logged','true');
    document.getElementById('loginBox').style.display='none';
    document.getElementById('mainApp').style.display='block';
    document.getElementById('profileBtn').innerText = safe[0].toUpperCase();
    location.reload();
  };
  if(localStorage.getItem('pixoro_logged')==='true'){
    document.getElementById('loginBox').style.display='none';
    document.getElementById('mainApp').style.display='block';
    let u = getUser();
    document.getElementById('profileBtn').innerText = u[0].toUpperCase();
  }
}
