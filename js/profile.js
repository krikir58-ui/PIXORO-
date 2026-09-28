import { supabase } from '../supabase.js'
export async function loadProfile(){
  const {data:{user}} = await supabase.auth.getUser()
  if(user) document.getElementById('authBox').style.display='none'
}
loadProfile()
