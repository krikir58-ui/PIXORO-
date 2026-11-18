// pixoro-store.js - Instagram Mariye - Safe Storage da!
function pixoroSave(type, blob){
  sessionStorage.setItem('pixoro_type', type);
  let req = indexedDB.open('pixoro_db', 1);
  req.onupgradeneeded = function(e){
    if(!e.target.result.objectStoreNames.contains('media')){
      e.target.result.createObjectStore('media');
    }
  };
  req.onsuccess = function(e){
    let db = e.target.result;
    db.transaction('media','readwrite').objectStore('media').put(blob, 'current');
  };
}
function pixoroGet(cb){
  let req = indexedDB.open('pixoro_db', 1);
  req.onupgradeneeded = function(e){
    if(!e.target.result.objectStoreNames.contains('media')){
      e.target.result.createObjectStore('media');
    }
  };
  req.onsuccess = function(e){
    let db = e.target.result;
    let getReq = db.transaction('media').objectStore('media').get('current');
    getReq.onsuccess = function(ev){ cb(ev.target.result); };
    getReq.onerror = function(){ cb(null); };
  };
  req.onerror = function(){ cb(null); };
}
function pixoroClear(){
  sessionStorage.removeItem('pixoro_type');
  sessionStorage.removeItem('pixoro_text');
  sessionStorage.removeItem('pixoro_filter');
  let req = indexedDB.open('pixoro_db', 1);
  req.onsuccess = function(e){
    e.target.result.transaction('media','readwrite').objectStore('media').delete('current');
  };
}
