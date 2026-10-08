// V2 SECURE SUPABASE - NO PASSWORD
function cleanUsername(raw){
  if(!raw) return "Giri";
  let s = String(raw); try{ if(s.includes('"u"')){ let j=JSON.parse(s); if(j.u) return j.u; } }catch(e){}
  if(s.includes('{')) return "Giri";
  if(s.includes('@')) s=s.split('@')[0];
  return s;
}
export function getSafeUser(){ return cleanUsername(localStorage.getItem('pixoro_v2_user') || localStorage.getItem('username') || 'Giri'); }
export function uploadToSupabase(file, caption){
  let user = getSafeUser();
  // Only username, no password!
  let post = { username: user, caption: caption, created_at: new Date().toISOString() };
  console.log('V2 Secure upload:', post);
  return post;
}
