import { supabase } from './supabase.js'

export async function getFeed(){
  const { data, error } = await supabase.from('posts').select('*').order('created_at', {ascending:false})
  if(error) console.log(error)
  return data || []
}

export async function createPost(username, img, cap){
  const isGiri = username.toLowerCase() === 'giri' || username.toLowerCase() === 'pixoro'
  const { data, error } = await supabase.from('posts').insert({ username, img, cap, verified: isGiri }).select()
  if(error) alert(error.message)
  return data
}
