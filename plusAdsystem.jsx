export default function PlusButton() {
  const [showAd, setShowAd] = useState(false);

  const handlePlusClick = () => {
    setShowAd(true);
    // 5 sec aprom close pannu da
    setTimeout(() => setShowAd(false), 5000);
  }

  return (
    <>
      <button onClick={handlePlusClick}
        style={{
          position: "fixed", bottom: "20px", right: "20px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "#FFD600", fontSize: "30px", border: "none",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}>
        +
      </button>

      {showAd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.9)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{background: "white", padding: "20px", borderRadius: "15px", textAlign: "center"}}>
            <p style={{fontSize: "10px"}}>Ad • Sponsored</p>
            <h2>🔥 PIXORO Premium</h2>
            <p>Ad illaama Reels paarkanum na Premium vaangu da!</p>
            <button style={{background: "black", color: "white", padding: "10px 20px", borderRadius: "20px"}}>
              ₹99 / Month
            </button>
            <p onClick={() => setShowAd(false)} style={{marginTop: "10px", color: "gray"}}>Skip Ad (5s)</p>
          </div>
        </div>
      )}
    </>
  )
}
