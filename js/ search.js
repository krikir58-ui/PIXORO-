import { supabase } from '../supabase.js'
window.searchUser = async () => {
  const q = searchInput.value; if(q.length<2) return
  const {data} = await supabase.from('posts').select('*').ilike('caption',`%${q}%`)
  console.log(data)
}
