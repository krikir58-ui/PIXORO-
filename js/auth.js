import { supabase } from './supabase.js'

export async function signup(email, password, username){
  const { data, error } = await supabase.auth.signUp({ email, password })
  if(error) { alert(error.message); return }
  await supabase.from('profiles').insert({ id: data.user.id, username, verified: username==='Giri' })
  alert('Signup Success da Giri! 🔵')
  location.href = 'feed.html'
}

export async function login(email, password){
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if(error) { alert(error.message); return }
  location.href = 'feed.html'
}

export async function getUser(){
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function logout(){
  await supabase.auth.signOut()
  location.href = '../index.html'
}
