// PIXORO PLUS AD SYSTEM - GIRI MASS - CORRECT CODE DA!
import { useState, useEffect } from 'react';
export default function PlusAdSystem(){
  const [coins,setCoins]=useState(parseInt(localStorage.getItem('pixoro_coins')||'0'));
  const [adWatched,setAdWatched]=useState(0);
  const [showAd,setShowAd]=useState(false);
  const [countdown,setCountdown]=useState(30);
  const SAFE_ADS=[{title:'Kids Learning App 📚',reward:10},{title:'Game Fun Zone 🎮',reward:15}];
  const [currentAd,setCurrentAd]=useState(SAFE_ADS[0]);
  useEffect(()=>{if(showAd && countdown>0){const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);}if(showAd && countdown===0){let nc=coins+currentAd.reward;localStorage.setItem('pixoro_coins',nc);setCoins(nc);setShowAd(false);setCountdown(30);alert(`+${currentAd.reward} Coins Win da! 🪙`);}},[showAd,countdown]);
  function startAd(){setCurrentAd(SAFE_ADS[Math.floor(Math.random()*SAFE_ADS.length)]);setShowAd(true);setCountdown(30);}
  if(showAd){return(<div style={{position:'fixed',inset:0,zIndex:9999,background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}}><h2 style={{color:'#FFD600'}}>{currentAd.title}</h2><p style={{color:'#fff',marginTop:'10px'}}>{countdown}s ku apuram +{currentAd.reward} coins da!</p><div style={{width:'200px',height:'6px',background:'#222',marginTop:'10px'}}><div style={{height:'100%',background:'#FFD600',width:`${((30-countdown)/30)*100}%`}}></div></div></div>)}
  return(<div style={{background:'#111',border:'1px solid #222',borderRadius:'18px',padding:'14px',margin:'12px 0'}}><h3 style={{color:'#FFD600'}}>💰 PLUS AD SYSTEM - 🪙 {coins}</h3><button onClick={startAd} style={{background:'#FFD600',color:'#000',border:'none',padding:'12px',borderRadius:'12px',fontWeight:900,marginTop:'10px',width:'100%'}}>🎬 Video Ad Paaru +10 Coins</button></div>)
}
