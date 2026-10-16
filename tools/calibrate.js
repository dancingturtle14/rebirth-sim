// 校準：每個時代調整成人死亡率倍數 k，令模擬平均壽命（包括事件死亡）接近參考範圍中位數
global.window=global;require("../data/eras.js");require("../data/stats.js");require("../data/era-extra.js");require("../data/events.js");require("../js/engine.js");
const N=+process.argv[2]||3000;const out={};window.CALIB={};const rows=[];
for(const e of ERAS){const tgt=(e.le[0]+e.le[1])/2;let lo=.03,hi=4,k=1,mean;
 const run=k=>{CALIB[e.id]={k,u5:.3,l:[]};let s=0;const ages=[];for(let i=0;i<N;i++){const p=Engine.quick(i*13+7,e.id);s+=p.age;ages.push(p)}return{m:s/N,ages}};
 for(let it=0;it<14;it++){k=(lo+hi)/2;mean=run(k).m;if(mean>tgt)lo=k;else hi=k}
 const {m,ages}=run(k);const l=[];for(let a=0;a<=110;a++)l.push(+(ages.filter(p=>p.age>=a).length/N).toFixed(4));
 const causes={};ages.forEach(p=>causes[p.cause]=(causes[p.cause]||0)+1);for(const c in causes)causes[c]=+(causes[c]/N).toFixed(3);
 out[e.id]={k:+k.toFixed(4),mean:+m.toFixed(1),u5:+(1-l[5]).toFixed(3),l,causes};rows.push([e.name,e.le.join("–"),m.toFixed(1),(100*(1-l[5])).toFixed(0)+"%"]);}
require("fs").writeFileSync(__dirname+"/../data/calib.js","/* 由 tools/calibrate.js 產生：k=成人死亡率倍數；l=存活曲線；causes=死因比例（模型） */\nwindow.CALIB="+JSON.stringify(out)+";\n");
console.table(rows);
