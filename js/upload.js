<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Upload - Pixoro</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
<style>body{background:#000;color:#fff;max-width:450px;margin:0 auto;padding:20px;font-family:sans-serif}input,textarea,select{width:100%;background:#111;border:1px solid #333;padding:12px;border-radius:10px;color:#fff;margin:10px 0;box-sizing:border-box}button{background:#0095f6;border:0;color:#fff;padding:12px;width:100%;border-radius:10px;font-weight:bold;font-size:16px;cursor:pointer}#bar{height:8px;background:#222;border-radius:10px;overflow:hidden;display:none;margin-top:10px}#fill{height:100%;width:0%;background:#0095f6;transition:width .3s}video,img{width:100%;border-radius:10px;display:none;margin-top:10px}</style>
</head><body>
<h2>📸 New Post / Reel 🔵</h2>

<!-- ✅ FIX - Photo + Video Rendum da -->
<select id="type">
  <option value="post">📸 Post - Photo</option>
  <option value="reel">🎬 Reel - Video</option>
</select>

<input type="file" id="file" accept="image/*,video/*">
<img id="imgPrev">
<video id="vidPrev" controls muted playsinline></video>
<textarea id="caption" placeholder="Caption eluthu da Giri... #hashtag"></textarea>
<button onclick="upload()">Share Post</button>
<button onclick="location.href='index.html'" style="background:#222;margin-top:10px">Cancel</button>
<p id="status" style="text-align:center;margin-top:10px;color:#aaa"></p>
<div id="bar"><div id="fill"></div></div>

<script>
const supa = window.supabase.createClient('https://yecpltndhlzfjplzhcpm.supabase.co','sb_publishable_byUfZPczrxfkYKTmUNco5w_oqabYQJ_');

// ✅ Preview - Photo na Photo - Video na Video da
document.getElementById('file').addEventListener('change', e=>{
  let f = e.target.files[0]; if(!f) return;
  let img = document.getElementById('imgPrev'), vid = document.getElementById('vidPrev');
  // ✅ Video Select Panna - Auto Reel aakidu da
  if(f.type.startsWith('video/')){ document.getElementById('type').value='reel'; }
  if(f.type.startsWith('image/')){ img.src = URL.createObjectURL(f); img.style.display='block'; vid.style.display='none'; }
  else { vid.src = URL.createObjectURL(f); vid.style.display='block'; img.style.display='none'; }
  // ✅ Size Check - 50MB ku Mela - Upload Aagathu da
  if(f.size > 50*1024*1024){ alert('Video Perusu da! 50MB ku Keela Mattum da'); e.target.value=''; }
});

async function upload(){
  let f = document.getElementById('file').files[0];
  if(!f) return alert('Photo / Video select pannu da!');
  let isReel = document.getElementById('type').value === 'reel' || f.type.startsWith('video/');
  let caption = document.getElementById('caption').value;
  document.getElementById('status').innerText = 'Uploading... ⏳';
  document.getElementById('bar').style.display = 'block';

  // ✅ User - Hardcode Giri Illa da - Login Panna User Thaan da
  let { data: { session } } = await supa.auth.getSession();
  let user = session?.user;
  if(!user){ alert('Login Pannitu Upload Pannu da'); location.href='login.html'; return; }
  let user_id = user.id;
  let username = user.user_metadata?.username || user.email?.split('@')[0] || 'Pixoro User';

  // ✅ File Name - Safe Name da - Space / Tamil Letter Irundha - Upload Fail Aagum da
  let safeName = f.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  let name = Date.now() + '_' + safeName;

  // ✅ Progress Bar - 0% la Stuck Aagathu da - Real Progress Kaatum da
  // Supabase JS la Progress Event Illa da - Fake Progress + Real Upload da
  let p = 0;
  let prog = setInterval(()=>{ p = Math.min(90, p + 10); document.getElementById('fill').style.width = p + '%'; }, 300);

  let { data, error } = await supa.storage.from('posts').upload(name, f, { upsert: true, contentType: f.type });
  clearInterval(prog);
  if(error){ document.getElementById('status').innerText = 'Error: ' + error.message; document.getElementById('bar').style.display='none'; return; }
  document.getElementById('fill').style.width = '100%';
  let { data: pub } = supa.storage.from('posts').getPublicUrl(name);
  let url = pub.publicUrl;

  // ✅ FIX - Reels ku Theva Columns Ellam Insert Pannu da
  let row = {
    user_id: user_id,
    username: username,
    caption: caption,
    media_url: url,
    image_url: url,
    video_url: isReel ? url : null,
    media_type: isReel ? 'video' : 'image',
    is_reel: isReel,
    likes_count: 0,
    comments_count: 0
  };
  let { error: dbErr } = await supa.from('posts').insert(row);
  if(dbErr){ document.getElementById('status').innerText = 'DB Error: ' + dbErr.message; return; }

  document.getElementById('status').innerText = isReel ? 'Reel Posted ✅🎬' : 'Posted ✅🔵';
  setTimeout(()=> location.href = isReel ? 'reels.html' : 'index.html', 1000);
}
</script></body></html>
