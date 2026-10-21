import { supabase } from './supabase.js'

// Login - Server la Thaan da
export async function login(email,password){
  const {data,error} = await supabase.auth.signInWithPassword({email,password})
  if(error) return alert(error.message)
  location.href='feed.html'
}

// Profile - Server la Thaan da
export async function getRealProfile(){
  const {data:{user}} = await supabase.auth.getUser()
  if(!user){ location.href='login.html'; return null }
  const {data:profile} = await supabase.from('profiles').select('*').eq('id',user.id).single()
  return {user, profile} // username, verified, name - Ellam Server la Irundhu da
}

// Logout - Server Token Delete da
export async function logout(){
  await supabase.auth.signOut()
  location.href='login.html'
}
