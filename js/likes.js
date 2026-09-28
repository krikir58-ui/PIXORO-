import { supabase } from '../supabase.js'
export async function likePost(id){
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) return alert('Login pannu da Giri!')
  await supabase.from('likes').insert({post_id:id, user_id:user.id})
  alert('Liked da ❤️')
}
export function initLikes(){
  window.likePost = likePost // Feed la button ku thevai da
}
