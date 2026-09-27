// auth.js - FINAL FIXED - Case problem solved da
async function signupUser(){
  let u = document.getElementById('su_user').value.trim().toLowerCase();
  let p = document.getElementById('su_pass').value.trim();
  if(!u || !p) return alert("Username & Password podu da!");
  console.log("Signup trying:", u);
  let {data, error} = await sb.from('users').insert([{username: u, password: p, bio: 'PIXORO V1 user da'}]).select();
  if(error){ 
    console.log(error);
    return alert("Signup Error da: " + error.message + " - Table irukka nu check pannu da!"); 
  }
  localStorage.setItem('pix_user', u);
  alert("Signup MASS da Giri! 👑 Ippo Feed ku porom da!");
  location.reload();
}

async function loginUser(){
  let u = document.getElementById('li_user').value.trim().toLowerCase();
  if(!u) return alert("Username podu da!");
  console.log("Login trying:", u);
  let {data, error} = await sb.from('users').select('*').eq('username', u).single();
  if(error || !data){
    console.log(error);
    return alert("User illa da - Mela Signup pannu da! Username: " + u + " - Error: " + (error?.message||'not found'));
  }
  localStorage.setItem('pix_user', u);
  alert("Login Vera Level da 🔥");
  location.reload();
}

function logoutUser(){
  localStorage.removeItem('pix_user');
  location.reload();
}
