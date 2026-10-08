// V2 SAFETY - AUTO CLEAN LEAK
export function autoCleanLeak(){
  try{
    let keys = ['pixoro_user','pixoro_world_posts','username'];
    keys.forEach(k=>{
      let v = localStorage.getItem(k);
      if(v && (v.includes('"u"') || v.includes('"p"') || v.includes('{"u"'))){
        console.log('LEAK FOUND & REMOVED:', k, v);
        localStorage.removeItem(k);
      }
    });
    // Force V2 user
    let v2 = localStorage.getItem('pixoro_v2_user');
    if(!v2 || v2.includes('{')){
      localStorage.setItem('pixoro_v2_user','Giri');
    }
  }catch(e){}
}
autoCleanLeak();
window.autoCleanLeak = autoCleanLeak;
