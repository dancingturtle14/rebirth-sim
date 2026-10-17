// 校準每個「地區×年代」：調整成人死亡率倍數 k，令模擬平均壽命（包括事件死亡）≈ 數據預期壽命
global.window=global;["eras","stats","era-extra","stats2","events","events2","modern","codex","world-data","regions","world-events"].forEach(f=>require("../data/"+f+".js"));
global.CALIB={};require("../js/engine.js");require("../js/world.js");
const N=+process.argv[2]||300,out={},rows=[];
function e0(era,k){CALIB[era.id].k=k;let l=1,s=0;for(let a=0;a<110;a++){const h=Engine.hazard({era,age:a,cls:{mm:1},hea:60,wea:50});s+=l*(1-h/2);l*=1-h}return s}
function solve(era,t){let lo=.001,hi=20;for(let i=0;i<30;i++){const m=Math.sqrt(lo*hi);if(e0(era,m)>t)lo=m;else hi=m}return Math.sqrt(lo*hi)}
function sim(era,n,seed0){let s=0;const ps=[];for(let i=0;i<n;i++){const p=Engine.quick(((seed0*2654435761)^(i*40503+era.anchor*7919+era.reg.length*104729))>>>0,era);s+=p.age;ps.push(p)}return{m:s/n,ps}}
for(const reg of Object.keys(REGIONS))for(const a of ANCHORS){const era=World.build(reg,a);const t=era.leRef;CALIB[era.id]={k:1,u5:era.cell.u5,l:[]};
 let tt=t,k=solve(era,tt);CALIB[era.id].k=k;era.evMul=1;let r=sim(era,N,11+a);
 for(let it=0;it<7&&Math.abs(r.m-t)>1;it++){if(r.m<t-1.5&&k<=.003)era.evMul*=.55;else tt=Math.max(1,Math.min(t*2.5,tt+(t-r.m)*.9));k=solve(era,tt);CALIB[era.id].k=k;r=sim(era,N,11+it*7777)}
 const v=sim(era,N*2,555555+a);const l=[];for(let x=0;x<=110;x+=5)l.push(+(v.ps.filter(p=>p.age>=x).length/v.ps.length).toFixed(3));
 const causes={};v.ps.forEach(p=>causes[p.cause]=(causes[p.cause]||0)+1);for(const c in causes)causes[c]=+(causes[c]/v.ps.length).toFixed(3);
 out[`${reg}_${a}`]={k:+k.toFixed(5),ev:+era.evMul.toFixed(3),mean:+v.m.toFixed(1),ref:t,u5:+(1-v.ps.filter(p=>p.age>=5).length/v.ps.length).toFixed(3),l,causes};
 if([1800,1900,1950,2000].includes(a)&&["china","india","britain","wafrica","japan"].includes(reg))rows.push([reg,a,t,v.m.toFixed(1),era.cell.u5,out[`${reg}_${a}`].u5]);}
require("fs").writeFileSync(__dirname+"/../data/calib-world.js","/* tools/calibrate_world.js 產生 */\nwindow.WCAL="+JSON.stringify(out)+";\n");
const all=Object.values(out),bad=all.filter(x=>Math.abs(x.mean-x.ref)>3);console.table(rows);console.log("cells",all.length,"|diff|>3:",bad.length,JSON.stringify(Object.entries(out).filter(([k,x])=>Math.abs(x.mean-x.ref)>3).map(([k,x])=>[k,x.ref,x.mean])));
