let currentTab = 'post';
let currentFile = null;

function showTab(type){
  currentTab = type;
  document.getElementById('btn-post').classList.remove('active');
  document.getElementById('btn-reel').classList.remove('active');
  document.getElementById('btn-story').classList.remove('active');
  document.getElementById('btn-' + type).classList.add('active');
  document.getElementById('musicRow').style.display = type === 'reel' ? 'block' : 'none';
  document.getElementById('storyTools').style.display = type === 'story' ? 'flex' : 'none';
  if(type === 'post') document.getElementById('placeholderText').innerText = 'Photo Select Pannu da';
  if(type === 'reel') document.getElementById('placeholderText').innerText = 'Video Select Pannu da - Reels ku';
  if(type === 'story') document.getElementById('placeholderText').innerText = 'Story ku Photo / Video Select Pannu da';
  if(type === 'post') document.getElementById('fileInput').accept = 'image/*';
  if(type === 'reel') document.getElementById('fileInput').accept = 'video/*';
  if(type === 'story') document.getElementById('fileInput').accept = 'image/*,video/*';
}

function onFile(input){
  let file = input.files[0];
  if(!file) return;
  currentFile = file;
  let url = URL.createObjectURL(file);
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('editBar').style.display = 'flex';
  if(file.type.startsWith('video')){
    let v = document.getElementById('previewVideo');
    v.src = url; v.style.display = 'block';
    document.getElementById('previewImg').style.display = 'none';
    v.play();
  } else {
    let img = document.getElementById('previewImg');
    img.src = url; img.style.display = 'block';
    document.getElementById('previewVideo').style.display = 'none';
  }
}

function applyFilter(filter, btn){
  document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('previewImg').style.filter = filter;
  document.getElementById('previewVideo').style.filter = filter;
}

function setEdit(type){
  document.querySelectorAll('.edit-bar button').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
  if(type === 'text') addStoryText();
  if(type === 'bright') applyFilter('brightness(1.3)', document.querySelector('.filters button'));
  if(type === 'crop') alert('Crop: Photo ah - Pinch panni - Crop pannu da!');
}

function addStoryText(){
  let t = prompt('Story la enna Text venum da?');
  if(t){
    let o = document.getElementById('storyTextOverlay');
    o.innerText = t; o.style.display = 'block';
  }
}
function addSticker(){ alert('Sticker Added da 😍'); }
function addMusicStory(){ alert('Music Added da 🎵'); }

function shareNow(){
  if(!currentFile){ alert('Mudhal la Photo / Video Select pannu da!'); return; }
  alert(currentTab.toUpperCase() + ' Upload Aaguthu da... ✅\nCaption: ' + document.getElementById('caption').value);
}
