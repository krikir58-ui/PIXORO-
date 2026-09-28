import { supabase } from '../supabase.js'
window.uploadPost = async () => {
  const file = fileInput.files[0]; if(!file) return alert('File select pannu da')
  const name = Date.now()+'-'+file.name
  const {error} = await supabase.storage.from('posts-images').upload(name, file)
  if(error) return alert(error.message)
  const {data} = supabase.storage.from('posts').getPublicUrl(name)
  await supabase.from('posts').insert({image_url:data.publicUrl, caption:caption.value})
  alert('Posted da!'); location.reload()
}
