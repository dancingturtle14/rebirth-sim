/* v4 世界抽籤：揀年代 → 按當年出生數（人口÷預期壽命）喺全球隨機投胎 */
window.World=(function(){
const SRC={gm:"Gapminder（CC BY 4.0）",gap:"Gapminder（CC BY 4.0）",owid:"Our World in Data：Riley／UN／HMD",riley:"Riley (2005) 洲際估算（經 OWID）",pre:"前現代估算",volk:"Volk & Atkinson (2013) 前現代兒童死亡率估算（約43%）",vz:"van Zanden 等 (2014)《How Was Life?》（經 OWID）",unesco:"UNESCO UIS（經 OWID）",world:"世界平均（van Zanden，本地冇數據）",hyde:"HYDE 3.x（經 OWID）",mad:"Maddison Project Database 2023（經 OWID）",madw:"Maddison 世界平均（本地冇數據）"};
const PRE={le:"前現代估算：沿用 Riley 1770 年洲際水平（經 OWID）",gdp:"前現代估算（接近生存水平，參考 Maddison）",lit:"前現代估算（估計低過一成）",tfr:"前現代估算（一般約 5–7 胎）",urb:"前現代估算（Bairoch 1988）"};
const src=(k,code)=>code==="pre"?PRE[k]:SRC[code];
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const ylab=y=>y<0?`前${-y}年`:y===1?"公元1年":`${y}年`;
const W=c=>c.pop/c.le; // 出生數 ≈ 人口 ÷ 預期壽命（穩定人口近似）
function probs(anchor){const L=Object.keys(REGIONS).map(r=>({r,c:WDATA[r][anchor],w:W(WDATA[r][anchor])}));const t=L.reduce((s,x)=>s+x.w,0);L.forEach(x=>x.p=x.w/t);return L.sort((a,b)=>b.p-a.p)}
const pack=(reg,y)=>{const m=PACKMAP.find(x=>x[0]===reg&&y>=x[1]&&y<=x[2]);return m?ERAS.find(e=>e.id===m[3]):null};
const WEST=["britain","france","german","north","northam","oceania","italy","iberia"];
function classes(reg,y,c){
 if(y>=1950)return{cl:[["收入最低兩成家庭",.2,-1,1.25],["中下收入家庭",.2,0,1.1],["中等收入家庭",.2,1,1],["中上收入家庭",.2,2,.9],["收入最高兩成家庭",.2,4,.8]],s:["按收入五等分：每組各佔兩成人口（定義）","收入五等分法"]};
 if(reg==="carib"&&y>=1650&&y<=1850)return{cl:[["被奴役者",.8,-1,1.4],["自由有色人",.08,0,1.1],["小農／工匠",.07,1,1],["種植園主",.05,4,.8]],s:["18世紀加勒比甘蔗殖民地，被奴役者佔人口大約八成或以上（估算）","Eltis & Richardson《Atlas of the Transatlantic Slave Trade》(2010)"]};
 if(reg==="northam"&&y>=1700&&y<=1860){const sl=y>=1850?.13:.18;return{cl:[["被奴役者",sl,-1,1.35],["農民",.55,0,1],["工匠",.12,1,.95],["商人",.07,2,.9],["城市工人",.13-(sl-.13),0,1.05],["精英",.03,4,.8]].filter(x=>x[1]>0),s:[y>=1850?"1850年美國人口普查：被奴役者約佔人口13%":"1800年美國人口普查：被奴役者約佔人口18%","美國人口普查局歷史統計"]}}
 if(reg==="brazil"&&y>=1600&&y<=1880)return{cl:[["被奴役者",.3,-1,1.35],["自由貧民",.4,0,1.05],["小農／工匠",.2,1,1],["商人",.07,2,.9],["莊園主",.03,4,.8]],s:["殖民時期巴西被奴役者估計約佔人口三成（1872年普查約15%）","Klein & Luna《Slavery in Brazil》(2010)"]};
 if(y>=1850&&c.gdp>2500)return{cl:[["工廠工人",.4,0,1.1],["農民",.3,0,1],["文員／小商人",.15,1,.95],["專業人士",.1,2,.85],["富裕家庭",.05,4,.75]],s:["工業化社會階級比例（遊戲估算），收入差距參考 Lindert & Williamson","Lindert & Williamson《Unequal Gains》(2016)"]};
 return{cl:[["農民",.72,0,1],["無地勞工／佃農",.1,-1,1.15],["工匠",.08,1,.95],["商人",.05,2,.9],["地主／士紳",.04,3,.8],["統治階層",.01,5,.7]],s:["前工業社會：絕大部分人務農，精英大約只佔幾個百分點（估算）","Milanovic, Lindert & Williamson (2011)〈Pre-Industrial Inequality〉"]};}
function genStats(reg,y,c){const S={lit:[`識字率約 ${pct(c.lit)}`,src("lit",c.litS)],tfr:[`每名婦女平均生育約 ${c.tfr} 胎`,src("tfr",c.tfrS)],
 med:[`出生時預期壽命約 ${c.le} 歲；約 ${pct(c.u5)} 嘅兒童活唔過五歲`,`${src("le",c.leS)}；${src("u5",c.u5S)}`],
 trade:[`人均GDP約 ${c.gdp.toLocaleString()} 國際元（2011年購買力）`,src("gdp",c.gdpS)],unit:[`國際元（2011年購買力平價）；當地人均GDP約 ${c.gdp.toLocaleString()}`,src("gdp",c.gdpS)],
 marry:WEST.includes(reg)?["西北歐「晚婚模式」：女性初婚約 23–27 歲，好多人終身唔結婚","Hajnal (1965)〈European Marriage Patterns〉"]:["歐洲以外大部分社會：早婚而且幾乎人人結婚","Hajnal (1965)；Lee & Wang (1999)"]};
 if(y>=1850&&y<1950&&["britain","german","italy","iberia","easteu","russia","china","india","japan","north","france"].includes(reg))S.migr=["1850–1914年，估計有約四千萬歐洲人同數千萬亞洲人跨洋移民","Hatton & Williamson《The Age of Mass Migration》(1998)；McKeown (2004)"];
 if(y>=1950)S.migr=["2020年全球約有2.8億國際移民（約佔人口3.6%）","UN DESA《International Migrant Stock 2020》"];
 if(y>=1975)S.vice=["2000年全球15歲以上人口吸煙率約三成，之後持續下降","WHO《Global Report on Trends in Prevalence of Tobacco Use》"];
 if(y>=1925)S.invest=["長期嚟講股市回報係正數，但可以連續多年大跌","Dimson, Marsh & Staunton《Triumph of the Optimists》(2002)"];
 if(y>=1950)S.school=S.lit;return S}
function build(reg,anchor){const c=WDATA[reg][anchor],F=REGIONS[reg],pk=pack(reg,anchor),id=`w_${reg}_${anchor}`;
 const cs=pk?{cl:pk.classes,s:["沿用時代包階級比例（估算）",pk.hsrc]}:classes(reg,anchor,c);
 const ev=[...(pk?pk.events.map((v,i)=>({...v,ck:pk.id+":"+i,s:v.s||pk.hsrc})):[]),...WEV.filter(w=>(w.r.includes(reg)||w.r.includes("*"))&&w.y[1]>=anchor&&w.y[0]<=anchor+110).map(w=>({y:w.y,t:w.t,war:w.war,famine:w.famine,plague:w.plague,captive:w.captive,fx:w.fx,ck:"w:"+w.id,s:w.c[2]}))];
 const u5=c.u5,q0=u5*.62,cc=1-Math.pow((1-u5)/(1-q0),.25);
 const era={id,reg,anchor,pack:pk?.id,name:`${ylab(anchor)} · ${F.n}`,rname:F.n,place:F.pl,pop:c.pop,years:[anchor,anchor+9],
  mort:{q0,c:cc,bg:.01,g:.0007,w:1},lit:c.lit,urb:c.urb,classes:cs.cl,clsSrc:cs.s,
  names:pk?pk.names:{sur:F.sur,m:F.m,f:F.f},jobs:pk?pk.jobs:F.jobs,scene:pk&&!["london","hk"].includes(pk.id)?pk.scene:F.sc(anchor),pal:pk?pk.pal:palette(reg,anchor),
  events:ev,le:[Math.round(c.le-2),Math.round(c.le+2)],leRef:c.le,leSrc:src("le",c.leS),u5Src:src("u5",c.u5S),cell:c,
  base:pk?pk.base:Math.max(300,c.gdp),cur:pk?pk.cur:"國際元",hsrc:pk?pk.hsrc:"見各事件出處",exam:pk?.exam};
 STATS[id]=Object.assign({},genStats(reg,anchor,c),pk?STATS[pk.id]:{});STATS[id].cls=cs.s;
 const k=`${reg}_${anchor}`,C=window.WCAL&&WCAL[k];if(C){const l=[];for(let a=0;a<=110;a++){const i=Math.floor(a/5),f=(a%5)/5;l.push(C.l[i]+((C.l[i+1]??0)-C.l[i])*f)}CALIB[id]={k:C.k,u5:C.u5,mean:C.mean,causes:C.causes,l};era.evMul=C.ev??1}else CALIB[id]=CALIB[id]||{k:1,u5:u5,l:Array(111).fill(.5),causes:{}};
 return era}
function palette(reg,y){const P={china:["#bcd4c4","#6f7a5a","#b0402a"],india:["#f4d27a","#a8763e","#d9480f"],wafrica:["#f2c46d","#b5793a","#2f7d4a"],cafrica:["#9fd0a0","#4f7a3a","#c46a1f"],eafrica:["#f0c987","#a56b3c","#3b6ea5"],safrica:["#e9c48a","#9a6a3a","#2f6f4a"],mideast:["#f1d39b","#c9a36a","#2f6fa5"],persia:["#e9d2a9","#b08a5a","#2a7f8f"],egypt:["#f4c86a","#c98b3b","#3b6ea5"],maghreb:["#f2cf94","#c48a4a","#2f7f6f"],turkey:["#d8c6a4","#8a7a5a","#b0302a"],andes:["#a9cfe8","#7a6a4a","#c0392b"],mexico:["#f0c88a","#8a6a3a","#2f8f5a"],carib:["#8fd3e8","#c8b06a","#2f8f5a"],brazil:["#9fd8b0","#5a8a3a","#e0b030"],northam:["#a9c9e8","#6a8a4a","#8b3a2a"],cone:["#b9d9f0","#8aa05a","#3a6aa5"],oceania:["#9fd0f0","#c9a86a","#2f7f8f"],russia:["#b8c4d0","#5a6a4a","#a5302a"],central:["#8ec3e6","#7ea24a","#c46a1f"]}[reg]||["#9ec5e8","#5f6e4a","#6b3fa0"];
 if(y>=1975)return{sky:"#4a6fa5",ground:"#2a2f45",accent:"#ff4f7a",ink:"#0d1020"};return{sky:P[0],ground:P[1],accent:P[2],ink:"#1a1612"}}
function draw(seed,anchor){const R=Engine.rng(seed*31+7),L=probs(anchor);let r=R(),pick=L[L.length-1];for(const x of L){r-=x.p;if(r<=0){pick=x;break}}return{reg:pick.r,list:L}}
function eraFor(seed,anchor,reg){return build(reg||draw(seed,anchor).reg,anchor)}
function nextAnchor(y){return ANCHORS.find(a=>a>=y+25)}
return{probs,draw,build,eraFor,nextAnchor,ylab,pct,src,SRC}})();
