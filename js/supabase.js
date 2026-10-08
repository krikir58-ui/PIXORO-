import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const URL = 'https://yecpltndhlzfjplzhcpm.supabase.co';
const KEY = 'sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_';

export const supabase = createClient(URL, KEY);
console.log('Pixoro Real DB Connected 🔥 Tiruchuli to World LIVE!');
