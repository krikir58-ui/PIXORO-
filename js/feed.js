import { supabase } from '../supabase.js'
export async function loadFeed(){
  const {data} = await supabase.from('posts').select('*').order('created_at',{ascending:false})
  if(!data) return
  document.getElementById('feed').innerHTML = data.map(p=>`
    <div class="post-card"><img src="${p.image_url}"><p>${p.caption}</p>
    <button onclick="likePost('${p.id}')">❤️ Like</button></div>`).join('')
}
