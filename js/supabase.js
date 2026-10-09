// Supabase Connection - Pixoro 🔵
const SUPA_URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const SUPA_KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';
if(!window.supa){
  window.supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
}
console.log('Supabase connected 🔵');
