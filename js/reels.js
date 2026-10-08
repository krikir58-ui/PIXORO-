import { getUser } from './auth.js';

export function loadReels(){
  // 3 sec ku mela paatha than view count erum
  let observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        let img=entry.target;
        let key=img.src;
        setTimeout(()=>{
          let views=JSON.parse(localStorage.getItem('pixoro_view_'+key)||'[]');
          let u=getUser();
          let last=views.find(v=>v.user===u);
          if(last && (Date.now()-last.time < 3600000)) return;
          views.push({user:u, time:Date.now()});
          localStorage.setItem('pixoro_view_'+key, JSON.stringify(views));
        }, 3000);
      }
    });
  }, {threshold:0.7});
  
  setTimeout(()=>{
    document.querySelectorAll('.post-img').forEach(img=>observer.observe(img));
  }, 1000);
}
