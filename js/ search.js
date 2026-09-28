import { supabase } from '../supabase.js'
export function initSearch(){
  const input = document.getElementById('searchInput')
  if(!input) return
  input.addEventListener('input', async ()=>{
    const q = input.value
    if(q.length<2) return
    const {data} = await supabase.from('posts').select('*').ilike('caption','%'+q+'%')
    console.log(data)
  })
}
