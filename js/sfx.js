/* 8-bit 音效同背景音樂（WebAudio 即時合成，無音檔） */
window.SFX=(function(){let ctx=null,on=false,music=false,mt=null,step=0;
const ac=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
function tone(f,d=.08,type="square",v=.05,t0=0){if(!on&&!music)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(c.destination);const t=c.currentTime+t0;o.start(t);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.stop(t+d+.02)}catch(e){}}
const S={click:()=>on&&tone(660,.05),event:()=>on&&[523,659].forEach((f,i)=>tone(f,.08,"square",.04,i*.07)),decide:()=>on&&[392,523,659,784].forEach((f,i)=>tone(f,.07,"square",.04,i*.06)),
 hist:()=>on&&[220,196,175].forEach((f,i)=>tone(f,.15,"triangle",.06,i*.12)),death:()=>on&&[392,330,262,196].forEach((f,i)=>tone(f,.3,"triangle",.06,i*.25)),card:()=>on&&[784,988,1319].forEach((f,i)=>tone(f,.06,"square",.03,i*.05))};
const SC=[262,294,330,392,440,523,440,392];
function loop(){if(!music)return;const f=SC[step%8]*(step%16<8?1:.75);tone(f/2,.25,"triangle",.025);if(step%2===0)tone(f,.1,"square",.012);step++}
return{...S,set(o,m){on=o;if(m!==music){music=m;clearInterval(mt);if(m){ac().resume?.();mt=setInterval(loop,300)}}if(o)ac().resume?.()},get on(){return on},get music(){return music}}})();
