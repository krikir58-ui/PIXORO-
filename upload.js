// upload.js - Instagram maathiri upload da
import { supabase } from './supabase.js'

export async function uploadPost(file, caption) {
  // 1. Storage la photo poda
  const fileName = Date.now() + '-' + file.name
  const { data, error } = await supabase.storage
    .from('posts') // Supabase la bucket name 'posts' nu create pannanum da
    .upload(fileName, file)
  
  if(error) { alert('Upload fail da: ' + error.message); return }

  // 2. URL eduthu database la save panna
  const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName)
  
  const { error: dbError } = await supabase.from('posts').insert({
    image_url: publicUrl,
    caption: caption,
    user_id: (await supabase.auth.getUser()).data.user.id
  })
  
  if(dbError) alert(dbError.message)
  else { alert('Post success da Giri! 🔥'); location.reload() }
}
