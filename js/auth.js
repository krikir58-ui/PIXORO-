import { supabase } from './supabase.js'

export async function signup(email, password, username){
  const { data, error } = await supabase.auth.signUp({ email, password })
  if(error) { alert(error.message); return }
  
  // Username - Lowercase la - Save Pannu da
  const cleanName = username.toLowerCase().trim()
  await supabase.from('profiles').insert({ 
    id: data.user.id, 
    username: cleanName, 
    verified: cleanName === 'giri' // giri na Mattum Gold Tick da - Friend ku Varaathu da
  })
  alert('Signup Success da Giri! 🔵')
  location.href = 'feed.html'
}

export async function login(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if(error) { alert(error.message); return }
  location.href = 'feed.html'
}

// === ITHU THAAN DA - MAIN - APP.JS KU THEVA DA ===
export async function getRealProfile(){
  const { data:{user} } = await supabase.auth.getUser()
  if(!user){ location.href='login.html'; return null }
  const { data:profile } = await supabase.from('profiles').select('*').eq('id',user.id).single()
  return { user, profile }
}

export async function initAuth(){
  const { data:{user} } = await supabase.auth.getUser()
  if(!user){ location.href='login.html'; return null }
  return user
}

export async function getUser(){
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function logout(){
  await supabase.auth.signOut()
  location.href = 'index.html' // '../' Vendaam da - Root la Thaan da
}
