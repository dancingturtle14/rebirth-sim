/* v4 世界抽籤：揀年代 → 按當年出生數（人口÷預期壽命）喺全球隨機投胎 */
window.World=(function(){
const SRC={gm:"Gapminder (CC BY 4.0)",gap:"Gapminder (CC BY 4.0)",owid:"Our World in Data: Riley / UN / HMD",riley:"Riley (2005) continental estimate (via OWID)",pre:"Pre-modern estimate",volk:"Volk & Atkinson (2013) pre-modern child mortality estimate (about 43%)",vz:"van Zanden et al. (2014), How Was Life? (via OWID)",unesco:"UNESCO UIS (via OWID)",world:"World average (van Zanden; no local data)",hyde:"HYDE 3.x (via OWID)",mad:"Maddison Project Database 2023 (via OWID)",madw:"Maddison world average (no local data)"};
const PRE={le:"Pre-modern estimate: Riley's 1770 continental level carried back (via OWID)",gdp:"Pre-modern estimate (near subsistence, after Maddison)",lit:"Pre-modern estimate (likely under 10%)",tfr:"Pre-modern estimate (typically about 5–7 births)",urb:"Pre-modern estimate (Bairoch 1988)"};
Object.assign(SRC,{popbc:"HYDE 3.x (via OWID); some countries back-projected from their parent region's population share before data begins",hydm:"HYDE 3.x / Gapminder (via OWID) + Maddison 2023 (Ireland)",vzi:"Long-range interpolation between van Zanden et al. / census / historians' estimates (via OWID)",bc:"Projected from the nearest real local observation using the world literacy (illiteracy) trend (van Zanden et al., via OWID)",
c_rus:"1897 Russian Empire census: about 21% literate nationwide (Great Soviet Encyclopedia, \"Грамотность\")",c_jpn:"Dore (1976): around 1870, about 40–50% of men and 15% of women could read and write (midpoint about 30%)",
c_chn:"Rawski (1979), Education and Popular Literacy in Ch'ing China: in the mid-to-late 19th century, 30–45% of men and 2–10% of women were literate (about 22% used)",c_ita:"1861 Kingdom of Italy census: about 78% illiterate",
c_usa:"US census (NCES, 120 Years of American Education, Table 6: 20% illiterate in 1870, 17% in 1880, 13.3% in 1890)",c_fra:"Maggiolo survey of marriage-register signatures (1786–90: men 47.4% / women 26.8%; 1816–20: men 54.4% / women 34.5%)",
c_gbr:"Schofield (1973), Dimensions of Illiteracy, 1750–1850: English marriage-register signatures (c. 1754: men 62% / women 37%; c. 1840: men 66% / women 51%)"});
// 冇同期本地數據嘅數字：pre＝假設值；volk/world/madw/riley/vzi/bc＝估計（借用其他地方／年代或者推算）
const ASSUME=new Set(["pre"]),ESTIM=new Set(["volk","world","madw","riley","vzi","bc","popbc"]);
const grade=code=>ASSUME.has(code)?"assumed value":ESTIM.has(code)?"estimate":"";
const tag=code=>{const g=grade(code);return g?`<span class="est est-${g==="assumed value"?"a":"e"}">${g}</span>`:""};
const src=(k,code)=>{const g=grade(code),t=code==="pre"?PRE[k]:SRC[code];return g?`[${g}]${t}`:t};
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const ylab=y=>y<0?`${-y} BCE`:y===1?"1 CE":`${y}`;
const W=c=>c.pop/c.le; // 出生數 ≈ 人口 ÷ 預期壽命（穩定人口近似）
function probs(anchor){const L=Object.keys(REGIONS).map(r=>({r,c:WDATA[r][anchor],w:W(WDATA[r][anchor])}));const t=L.reduce((s,x)=>s+x.w,0);L.forEach(x=>x.p=x.w/t);return L.sort((a,b)=>b.p-a.p)}
const pack=(reg,y)=>{const m=PACKMAP.find(x=>x[0]===reg&&y>=x[1]&&y<=x[2]);return m?ERAS.find(e=>e.id===m[3]):null};
const WEST=["britain","france","german","north","northam","oceania","italy","iberia"];
function classes(reg,y,c){
 if(y>=1950)return{cl:[["Bottom-fifth income family",.2,-1,1.25],["Lower-middle income family",.2,0,1.1],["Middle income family",.2,1,1],["Upper-middle income family",.2,2,.9],["Top-fifth income family",.2,4,.8]],s:["Income quintiles: each group is one fifth of the population (by definition)","Income quintile method"]};
 if(reg==="carib"&&y>=1650&&y<=1850)return{cl:[["Enslaved person",.8,-1,1.4],["Free person of colour",.08,0,1.1],["Smallholder / artisan",.07,1,1],["Planter",.05,4,.8]],s:["18th-century Caribbean sugar colonies: enslaved people made up roughly 80% or more of the population (estimate)","Eltis & Richardson, Atlas of the Transatlantic Slave Trade (2010)"]};
 if(reg==="northam"&&y>=1700&&y<=1860){const sl=y>=1850?.13:.18;return{cl:[["Enslaved person",sl,-1,1.35],["Peasant farmer",.55,0,1],["Artisan",.12,1,.95],["Merchant",.07,2,.9],["Urban worker",.13-(sl-.13),0,1.05],["Elite",.03,4,.8]].filter(x=>x[1]>0),s:[y>=1850?"1850 US census: enslaved people were about 13% of the population":"1800 US census: enslaved people were about 18% of the population","US Census Bureau, Historical Statistics"]}}
 if(reg==="brazil"&&y>=1600&&y<=1880)return{cl:[["Enslaved person",.3,-1,1.35],["Free poor",.4,0,1.05],["Smallholder / artisan",.2,1,1],["Merchant",.07,2,.9],["Estate owner",.03,4,.8]],s:["Colonial Brazil: enslaved people estimated at about 30% of the population (about 15% in the 1872 census)","Klein & Luna, Slavery in Brazil (2010)"]};
 if(y>=1850&&c.gdp>2500)return{cl:[["Factory worker",.4,0,1.1],["Peasant farmer",.3,0,1],["Clerk / shopkeeper",.15,1,.95],["Professional",.1,2,.85],["Wealthy family",.05,4,.75]],s:["Class shares in an industrial society (game estimate); income gaps after Lindert & Williamson","Lindert & Williamson, Unequal Gains (2016)"]};
 return{cl:[["Peasant farmer",.72,0,1],["Landless labourer / tenant",.1,-1,1.15],["Artisan",.08,1,.95],["Merchant",.05,2,.9],["Landlord / gentry",.04,3,.8],["Ruling class",.01,5,.7]],s:["Pre-industrial society: the vast majority farmed; the elite were only a few percent (estimate)","Milanovic, Lindert & Williamson (2011), \"Pre-Industrial Inequality\""]};}
function genStats(reg,y,c){const S={lit:[`Literacy about ${pct(c.lit)}`,src("lit",c.litS)],tfr:[`Average births per woman about ${c.tfr} births`,src("tfr",c.tfrS)],
 med:[`Life expectancy at birth: about ${c.le} yrs; about ${pct(c.u5)} of children did not live to five`,`${src("le",c.leS)}; ${src("u5",c.u5S)}`],
 trade:[`GDP per person about ${c.gdp.toLocaleString()} int'l $ (2011 PPP)`,src("gdp",c.gdpS)],unit:[`international dollars (2011 PPP); local GDP per person about ${c.gdp.toLocaleString()}`,src("gdp",c.gdpS)],
 marry:WEST.includes(reg)?["Northwest Europe's \"late marriage pattern\": women first married at about 23–27, and many never married","Hajnal (1965), \"European Marriage Patterns\""]:["Most societies outside Europe: early marriage, and nearly everyone married","Hajnal (1965); Lee & Wang (1999)"]};
 if(y>=1850&&y<1950&&["britain","german","italy","iberia","easteu","russia","china","india","japan","north","france"].includes(reg))S.migr=["1850–1914: an estimated 40 million Europeans and tens of millions of Asians migrated overseas","Hatton & Williamson, The Age of Mass Migration (1998); McKeown (2004)"];
 if(y>=1950)S.migr=["2020: about 280 million international migrants worldwide (about 3.6% of the population)","UN DESA, International Migrant Stock 2020"];
 if(y>=1975)S.vice=["2000: about 30% of people over 15 worldwide smoked, falling steadily since","WHO, Global Report on Trends in Prevalence of Tobacco Use"];
 if(y>=1925)S.invest=["Over the long run stock returns are positive, but markets can fall for years in a row","Dimson, Marsh & Staunton, Triumph of the Optimists (2002)"];
 if(y>=1950)S.school=S.lit;return S}
function build(reg,anchor){const c=WDATA[reg][anchor],F=REGIONS[reg],pk=pack(reg,anchor),id=`w_${reg}_${anchor}`;
 const cs=pk?{cl:pk.classes,s:["Uses the era pack's class shares (estimate)",pk.hsrc]}:classes(reg,anchor,c);
 const ev=[...(pk?pk.events.map((v,i)=>({...v,ck:pk.id+":"+i,s:v.s||pk.hsrc})):[]),...WEV.filter(w=>(w.r.includes(reg)||w.r.includes("*"))&&w.y[1]>=anchor&&w.y[0]<=anchor+110).map(w=>({y:w.y,t:w.t,war:w.war,famine:w.famine,plague:w.plague,captive:w.captive,fx:w.fx,ck:"w:"+w.id,s:w.c[2]}))];
 const u5=c.u5,q0=u5*.62,cc=1-Math.pow((1-u5)/(1-q0),.25);
 const era={id,reg,anchor,pack:pk?.id,name:`${ylab(anchor)} · ${F.n}`,rname:F.n,place:F.pl,pop:c.pop,years:[anchor,anchor+9],
  mort:{q0,c:cc,bg:.01,g:.0007,w:1},lit:c.lit,urb:c.urb,classes:cs.cl,clsSrc:cs.s,
  names:pk?pk.names:{sur:F.sur,m:F.m,f:F.f},jobs:pk?pk.jobs:F.jobs,scene:pk&&!["london","hk"].includes(pk.id)?pk.scene:F.sc(anchor),pal:pk?pk.pal:palette(reg,anchor),
  events:ev,le:[Math.round(c.le-2),Math.round(c.le+2)],leRef:c.le,leSrc:src("le",c.leS),u5Src:src("u5",c.u5S),cell:c,
  base:pk?pk.base:Math.max(300,c.gdp),cur:pk?pk.cur:"int'l $",hsrc:pk?pk.hsrc:"See each event's source",exam:pk?.exam};
 STATS[id]=Object.assign({},genStats(reg,anchor,c),pk?STATS[pk.id]:{});STATS[id].cls=cs.s;
 const k=`${reg}_${anchor}`,C=window.WCAL&&WCAL[k];if(C){const l=[];for(let a=0;a<=110;a++){const i=Math.floor(a/5),f=(a%5)/5;l.push(C.l[i]+((C.l[i+1]??0)-C.l[i])*f)}CALIB[id]={k:C.k,u5:C.u5,mean:C.mean,causes:C.causes,l};era.evMul=C.ev??1}else CALIB[id]=CALIB[id]||{k:1,u5:u5,l:Array(111).fill(.5),causes:{}};
 return era}
function palette(reg,y){const P={china:["#bcd4c4","#6f7a5a","#b0402a"],india:["#f4d27a","#a8763e","#d9480f"],wafrica:["#f2c46d","#b5793a","#2f7d4a"],cafrica:["#9fd0a0","#4f7a3a","#c46a1f"],eafrica:["#f0c987","#a56b3c","#3b6ea5"],safrica:["#e9c48a","#9a6a3a","#2f6f4a"],mideast:["#f1d39b","#c9a36a","#2f6fa5"],persia:["#e9d2a9","#b08a5a","#2a7f8f"],egypt:["#f4c86a","#c98b3b","#3b6ea5"],maghreb:["#f2cf94","#c48a4a","#2f7f6f"],turkey:["#d8c6a4","#8a7a5a","#b0302a"],andes:["#a9cfe8","#7a6a4a","#c0392b"],mexico:["#f0c88a","#8a6a3a","#2f8f5a"],carib:["#8fd3e8","#c8b06a","#2f8f5a"],brazil:["#9fd8b0","#5a8a3a","#e0b030"],northam:["#a9c9e8","#6a8a4a","#8b3a2a"],cone:["#b9d9f0","#8aa05a","#3a6aa5"],oceania:["#9fd0f0","#c9a86a","#2f7f8f"],russia:["#b8c4d0","#5a6a4a","#a5302a"],central:["#8ec3e6","#7ea24a","#c46a1f"]}[reg]||["#9ec5e8","#5f6e4a","#6b3fa0"];
 if(y>=1975)return{sky:"#4a6fa5",ground:"#2a2f45",accent:"#ff4f7a",ink:"#0d1020"};return{sky:P[0],ground:P[1],accent:P[2],ink:"#1a1612"}}
function draw(seed,anchor){const R=Engine.rng(seed*31+7),L=probs(anchor);let r=R(),pick=L[L.length-1];for(const x of L){r-=x.p;if(r<=0){pick=x;break}}return{reg:pick.r,list:L}}
function eraFor(seed,anchor,reg){return build(reg||draw(seed,anchor).reg,anchor)}
function nextAnchor(y){return ANCHORS.find(a=>a>=y+25)}
return{probs,draw,build,eraFor,nextAnchor,ylab,pct,src,SRC,tag,grade}})();
