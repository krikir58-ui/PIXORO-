import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://yecpltndhlzfjplzhcpm.supabase.co";
const supabaseKey = "sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_";

export const supabase = createClient(supabaseUrl, supabaseKey);
