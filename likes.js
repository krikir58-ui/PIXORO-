// likes.js
import { supabase } from './supabase.js'

window.likePost = async (postId) => {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  alert('Liked da Giri! ❤️')
}
