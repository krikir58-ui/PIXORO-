// 🔵 PIXORO SPLASH.JS - MASS ENTRY LOGIC - THANI FILE!
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  
  // Mass vibration da!
  if(navigator.vibrate) navigator.vibrate([100,50,100]);
  
  // 2.5 sec ku aprom splash close
  setTimeout(()=>{
    splash.style.animation='splashOut 0.6s forwards';
    setTimeout(()=>{ splash.remove(); document.body.style.overflow='auto'; },600);
  },2500);
  
  console.log('🔵 Pixoro Mass Entry Activated - Trichy da! 🔥');
})();
