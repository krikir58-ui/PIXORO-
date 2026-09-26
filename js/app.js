import { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000); // 3 sec mass
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh", background: "black",
        display: "flex", justifyContent: "center", alignItems: "center",
        flexDirection: "column"
      }}>
        <h1 style={{
          color: "white", fontSize: "50px", fontWeight: "900",
          letterSpacing: "5px",
          animation: "zoom 1s infinite alternate"
        }}>PIXORO</h1>
        <p style={{color: "#FFD600", marginTop: "10px"}}>WORLD NO.1 SAFE APP</p>
        <style>{`@keyframes zoom { from{transform:scale(1)} to{transform:scale(1.2)} }`}</style>
      </div>
    )
  }

  return <YourMainApp /> // un main app
}
