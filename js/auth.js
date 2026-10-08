// V2 SECURE AUTH - NO PASSWORD LEAK
function cleanUsername(raw){
  if(!raw) return "Giri";
  let s = String(raw).trim();
  try{
    if(s.includes('"u"') || (s.startsWith('{') && s.includes('u'))){
      let j = JSON.parse(s);
      if(j.u) return j.u.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || "Giri";
      if(j.username) return String(j.username).slice(0,20);
    }
  }catch(e){}
  let m = s.match(/"u"\s*:\s*"([^"]+)"/);
  if(m) return m[1];
  if(s.includes('{') || s.includes('"')) return "Giri";
  if(s.includes('@')) s = s.split('@')[0];
  return s.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20) || "Giri";
}
export function initAuth(){
  try{
    let old = localStorage.getItem('pixoro_user');
    if(old && old.includes('"u"')){
      let safe = cleanUsername(old);
      localStorage.setItem('pixoro_v2_user', safe);
      localStorage.removeItem('pixoro_user');
    }
  }catch(e){}
}
export function secureLogin(username){
  let safe = cleanUsername(username);
  localStorage.setItem('pixoro_v2_user', safe);
  localStorage.setItem('pixoro_v2_logged','true');
  localStorage.removeItem('pixoro_user');
  return safe;
}
export function getCurrentUser(){
  return cleanUsername(localStorage.getItem('pixoro_v2_user') || localStorage.getItem('username') || 'Giri');
}
window.cleanUsername = cleanUsername;
window.secureLogin = secureLogin;
window.getCurrentUser = getCurrentUser;
