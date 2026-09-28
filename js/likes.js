import { supabase } from '../supabase.js'
window.likePost = async (id) => {
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) return alert('Login pannu da')
  await supabase.from('likes').insert({post_id:id, user_id:user.id})
  alert('Liked ❤️')
}
