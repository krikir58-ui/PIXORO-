import { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (loading) {
    return (
      <div style={{height:"100vh",background:"black",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
        <h1 style={{color:"white",fontSize:"50px",fontWeight:"900",letterSpacing:"5px"}}>PIXORO</h1>
        <p style={{color:"#FFD600",marginTop:"10px"}}>WORLD NO.1 SAFE APP</p>
      </div>
    );
  }

  return (
    <div>
      {/* UN OLD PIXORO CODE INGA VARUM DA - posts, reels ellam */}
      <h1>PIXORO Feed</h1>

      {/* + BUTTON AD SYSTEM DA */}
      <button onClick={() => setShowAd(true)} style={{
        position:"fixed",bottom:"20px",right:"20px",width:"60px",height:"60px",
        borderRadius:"50%",background:"#FFD600",fontSize:"30px",border:"none"
      }}>+</button>

      {showAd && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.9)",zIndex:9999,display:"flex",justifyContent:"center",alignItems:"center"}}>
          <div style={{background:"white",padding:"20px",borderRadius:"15px",textAlign:"center"}}>
            <h2>🔥 PIXORO Premium</h2>
            <button onClick={()=>setShowAd(false)} style={{background:"black",color:"white",padding:"10px 20px",borderRadius:"20px"}}>Close Ad</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
