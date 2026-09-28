import { supabase } from '../supabase.js'

// Instagram style - export da!
export async function signup() {
  const emailVal = document.getElementById('email').value
  const passVal = document.getElementById('password').value
  const { error } = await supabase.auth.signUp({ email: emailVal, password: passVal })
  alert(error ? error.message : 'Check mail da Giri! 📧')
}

export async function login() {
  const emailVal = document.getElementById('email').value
  const passVal = document.getElementById('password').value
  const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passVal })
  if(!error) location.reload()
  else alert(error.message)
}

export async function logout() {
  await supabase.auth.signOut()
  location.reload()
}

// Ella button ah connect pannura function da - Instagram method!
export function initAuth() {
  document.getElementById('signupBtn')?.addEventListener('click', signup)
  document.getElementById('loginBtn')?.addEventListener('click', login)
  document.getElementById('logoutBtn')?.addEventListener('click', logout)

  // Old window method kooda backup ku vechuren da - ippo work aagum!
  window.signup = signup
  window.login = login
  window.logout = logout
}
