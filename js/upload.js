<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Upload - Pixoro</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
<style>body{background:#000;color:#fff;max-width:450px;margin:0 auto;padding:20px;font-family:sans-serif}input,textarea{width:100%;background:#111;border:1px solid #333;padding:12px;border-radius:10px;color:#fff;margin:10px 0}button{background:#0095f6;border:0;color:#fff;padding:12px;width:100%;border-radius:10px;font-weight:bold;font-size:16px;cursor:pointer}</style>
</head><body>
<h2>📸 New Post 🔵</h2>
<input type="file" id="file" accept="image/*">
<textarea id="caption" placeholder="Caption eluthu da Giri... #hashtag"></textarea>
<button onclick="upload()">Share Post</button>
<button onclick="location.href='index.html'" style="background:#222;margin-top:10px">Cancel</button>
<p id="status" style="text-align:center;margin-top:10px;color:#aaa"></p>
<script>
const supa = window.supabase.createClient('https://yecpltndhlzfjplzhcpm.supabase.co','sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_')
async function upload(){
 let f=document.getElementById('file').files[0]; if(!f) return alert('Photo select pannu da!')
 document.getElementById('status').innerText='Uploading... ⏳'
 let name=Date.now()+'_'+f.name
 let {data,error}=await supa.storage.from('posts').upload(name,f)
 if(error){document.getElementById('status').innerText='Error: '+error.message; return}
 let {data:pub}=supa.storage.from('posts').getPublicUrl(name)
 await supa.from('posts').insert({username:'Giri',image_url:pub.publicUrl,caption:document.getElementById('caption').value})
 document.getElementById('status').innerText='Posted ✅🔵'; setTimeout(()=>location.href='index.html',1000)
}
</script></body></html>
