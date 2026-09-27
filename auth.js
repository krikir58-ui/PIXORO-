// auth.js - FIXED - Pokka problem solved da
async function signupUser(){
  let u = document.getElementById('su_user').value.trim();
  let p = document.getElementById('su_pass').value.trim();
  if(!u || !p) return alert("Username & Password rendu podu da!");
  let {data, error} = await sb.from('users').insert([{username: u, password: p}]).select();
  if(error){ return alert("Error da: " + error.message); }
  localStorage.setItem('pix_user', u);
  alert("Signup Super da Giri! 👑 Login aaguthu da!");
  location.reload();
}

async function loginUser(){
  let u = document.getElementById('li_user').value.trim();
  if(!u) return alert("Username podu da!");
  let {data, error} = await sb.from('users').select('*').eq('username', u).single();
  if(error || !data){
    return alert("User illa da - Mela Signup pannu da! Username: " + u);
  }
  localStorage.setItem('pix_user', u);
  alert("Login OK da 🔥 Feed ku poguthu da!");
  location.reload();
}

function logoutUser(){
  localStorage.removeItem('pix_user');
  location.reload();
}
