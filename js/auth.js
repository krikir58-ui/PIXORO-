import { supabase } from '../supabase.js'
window.signup = async () => { const {error} = await supabase.auth.signUp({email:email.value, password:password.value}); alert(error?error.message:'Check mail da!') }
window.login = async () => { const {error} = await supabase.auth.signInWithPassword({email:email.value, password:password.value}); if(!error) location.reload(); else alert(error.message) }
window.logout = async () => { await supabase.auth.signOut(); location.reload() }
