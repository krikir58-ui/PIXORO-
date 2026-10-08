export function initScreenshotAlert(){
  document.addEventListener('keydown', e=>{
    if((e.ctrlKey && e.key==='s') || e.key==='PrintScreen'){
      alert('🔒 Pixoro Safety: Screenshot not allowed da!');
    }
  });
  document.addEventListener('contextmenu', e=>{
    e.preventDefault();
    alert('🔒 Right click disabled - Girls safety ON!');
  });
}
