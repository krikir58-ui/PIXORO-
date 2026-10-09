(function(){
  const splash=document.getElementById('splash');
  if(!splash) return;
  if(navigator.vibrate) navigator.vibrate([100,50,100]);
  setTimeout(()=>{
    splash.style.animation='splashOut 0.6s forwards';
    setTimeout(()=>splash.remove(),600);
  },2500);
})();
