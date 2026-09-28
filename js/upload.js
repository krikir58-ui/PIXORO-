import { supabase } from '../supabase.js'
export async function uploadPost(){
  const fileInput = document.getElementById('fileInput')
  const file = fileInput.files[0]
  if(!file) return alert('File select pannu da!')
  const name = Date.now()+'-'+file.name
  const {error} = await supabase.storage.from('posts-images').upload(name,file)
  if(error) return alert(error.message)
  const {data} = supabase.storage.from('posts-images').getPublicUrl(name)
  await supabase.from('posts').insert({image_url:data.publicUrl, caption:'PIXORO Post'})
  alert('Posted da! 🔥'); location.reload()
}
export function initUpload(){
  document.getElementById('uploadBtn')?.addEventListener('click',uploadPost)
  window.uploadPost = uploadPost
}
