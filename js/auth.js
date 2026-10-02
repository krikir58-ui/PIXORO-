import { supabase } from '../supabase.js'

export async function signup() {
  const emailVal = document.getElementById('email').value
  const passVal = document.getElementById('password').value
  
  if(!emailVal || !passVal){
    alert('Email & Password podu da Giri!')
    return
  }
  
  const { data, error } = await supabase.auth.signUp({ email: emailVal, password: passVal })
  
  if(error){
    alert(error.message)
  } else {
    alert('Account create aayiduchu da Giri! ✅')
    location.reload()
  }
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

export function initAuth() {
  document.getElementById('signupBtn')?.addEventListener('click', signup)
  document.getElementById('loginBtn')?.addEventListener('click', login)
  document.getElementById('logoutBtn')?.addEventListener('click', logout)
  window.signup = signup
  window.login = login
  window.logout = logout
}

// AUTO START DA - ITHAAN MAIN FIX DA!
document.addEventListener('DOMContentLoaded', () => {
  initAuth()
})
initAuth()
