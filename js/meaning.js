/* 意義層：古今對照、沉澱一下、史料卡、這一生教會我、如果、傳承、成就 */
window.Meaning=(function(){
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
/* 古今對照 */
function contrast(p,key,evt){const e=p.era,C=CALIB[e.id],S=STATS[e.id],M=MODERN[key];if(!M)return null;let then,src;
 if(key==="u5"){if(e.cell){then=`五歲前夭折機會約 ${pct(e.cell.u5)}`;src=e.u5Src}else{then=`五歲前夭折機會約 ${pct(C.u5)}（模型估算）`;src=e.leSrc}}
 else if(key==="le"){then=e.cell?`出生時預期壽命約 ${e.cell.le} 歲`:`出生時預期壽命約 ${e.le[0]}–${e.le[1]} 歲`;src=e.leSrc}
 else if(key==="lit"){if(!S.lit)return null;then=S.lit[0];src=S.lit[1]}
 else if(key==="tfr"){if(!S.tfr)return null;then=S.tfr[0];src=S.tfr[1]}
 else if(key==="hours"){if(e.id!=="london")return null;then="1833年《工廠法》先至限制 9–13 歲童工每日最多做 9 小時";src="《1833年工廠法》"}
 else{then=evt?evt.t:"";src=evt?evt.src:e.hsrc}
 return{key,then,hk:M.hk,w:M.w,src:`${src}；${M.src}`}}
const cHTML=c=>`<div class="now"><b>🕰 古今對照</b><div>當年：${c.then}</div>${c.hk?`<div>今日香港：${c.hk}</div>`:""}${c.w?`<div>今日全球：${c.w}</div>`:""}<span class="fn">📜 ${c.src}</span></div>`;
/* 沉澱一下 */
function question(p,trig){const e=p.era,C=CALIB[e.id],n=p.name;const T={
 5:`${n}捱過咗最危險嘅頭五年：喺呢個時代，大約 ${pct(C.u5)} 嘅細路做唔到（模型估算）。你細個嗰陣，有冇啲嘢係你以為理所當然嘅？`,
 15:`十五歲嘅${n}${p.lit?"識字":"唔識字"}，每日要${e.jobs[0]}。你十五歲嗰陣，最擔心嘅係咩？`,
 30:`三十歲。同年出生嘅人，大約仲有 ${pct(C.l[30])} 在世（模型估算）。如果你係${n}，下一步最想做咩？`,
 50:`五十歲，喺呢個時代已經算長壽。你想像自己五十歲嗰陣，身邊會有啲咩人？`,
 70:`七十歲。${n}回頭望呢一生，最大嘅遺憾可能係咩？你今日可唔可以避免？`,
 kid:`失去孩子喺當時好普遍，但痛唔會因為普遍而少咗。你會點樣記住一個好短嘅生命？`,
 exam:`考試幾乎決定咗一個人嘅命運。你人生入面，有冇一次考試或者評核改變咗你嘅路？`,
 migr:`${n}離開咗熟悉嘅地方。如果你今日要離開香港，你會帶走啲咩？`,
 moral:`面對呢個抉擇，${n}揀咗佢揀嘅路。如果係你，你會唔會揀一樣？點解？`,
 flee:`逃定留，往往冇好選擇。今日世界上仍然有好多人面對同一個問題。你會點做？`};return T[trig]}
function saveReflection(p,q,a,ag){ag=ag??p.age;const L=LS.get("rebirth_reflect",[]);L.push({q,a,name:p.name,era:p.era.name,age:ag,ts:Date.now()});LS.set("rebirth_reflect",L.slice(-200));p.reflect.push({q,a,age:ag})}
/* 史料卡 */
function unlock(keys){const s=new Set(LS.get("rebirth_codex",[]));const nu=keys.filter(k=>!s.has(k));keys.forEach(k=>s.add(k));LS.set("rebirth_codex",[...s]);return nu}
/* 反事實：出身 vs 抉擇 */
function counterfactual(p){const e=p.era,N=30;let ea=0,ew=0,sa=0,sw=0;
 for(let i=0;i<N;i++){const sd=p.seed*7+i*101+3,a=Engine.quick(sd,e.anchor!=null?World.eraFor(sd,e.anchor):e.id);ea+=a.age;ew+=a.wea;
  const b=Engine.quickFrom(p.seed,e,p.heir,p.seed+5000+i*17);sa+=b.age;sw+=b.wea}
 return{eraAge:ea/N,eraWea:ew/N,sbAge:sa/N,sbWea:sw/N}}
function lesson(p,cf){const e=p.era,f=Math.abs(cf.sbWea-cf.eraWea),c=Math.abs(p.wea-cf.sbWea),fs=Math.round(100*f/Math.max(1,f+c));
 const up=(a,b)=>a>=b?"高":"低";const out=[];
 out.push(`<p><b>出身</b>：你喺${e.name}出世，做${p.cls.name}。同一年代喺全世界隨機投胎嘅人，平均財富排名約 ${Math.round(cf.eraWea)}；同你一模一樣出身嘅人，平均約 ${Math.round(cf.sbWea)}。單係出身，已經令你${up(cf.sbWea,cf.eraWea)}咗 ${Math.round(f)} 分。</p>`);
 out.push(`<p><b>抉擇同際遇</b>：你做咗 ${p.choices.length} 個抉擇，最後財富排名係 ${p.wea}，比同出身嘅人${up(p.wea,cf.sbWea)} ${Math.round(c)} 分。壽命方面，同出身者平均活到約 ${Math.round(cf.sbAge)} 歲，你活到 ${p.age} 歲。</p>`);
 out.push(`<p class="ratio"><span style="width:${fs}%">出身 ${fs}%</span><span style="width:${100-fs}%">抉擇＋運氣 ${100-fs}%</span></p><p class="note" style="text-align:left">喺本模型入面，你一生財富嘅差距大約有 ${fs}% 係出身造成（比較同一出身嘅 30 次隨機人生，同埋同一年代全球 30 次隨機投胎）。</p>`);
 out.push(`<p><b>如果你今日喺香港出世</b>：預期壽命 ${MODERN.le.hk}（當年約 ${e.cell?e.cell.le:e.le[0]+"–"+e.le[1]} 歲），五歲前夭折機會 ${MODERN.u5.hk}（當年約 ${pct(e.cell?e.cell.u5:CALIB[e.id].u5)}），識字率 ${MODERN.lit.hk}。<span class="fn">📜 ${MODERN.le.src}；${MODERN.u5.src}；${e.leSrc}</span></p>`);
 if(p.reflect.length)out.push(`<p><b>你嘅沉澱</b></p>`+p.reflect.filter(r=>r.a).map(r=>`<blockquote>「${r.a}」<small>— ${r.age} 歲時</small></blockquote>`).join("")||"");
 const R=Engine.rng(p.seed+9),pk=a=>a[Math.floor(R()*a.length)];let t;
 if(p.kidsDead||p.age<5)t=pk(["今日香港，好少父母需要擔心孩子活唔過五歲。呢樣係幾代人用疫苗、清潔食水同醫療換返嚟嘅。今晚可以同屋企人講多句說話。","一個好短嘅生命都係一個完整嘅故事。可能值得去了解吓，今日世界邊度仍然有兒童因為可以預防嘅病而離開。"]);
 else if(p.ach.has("righteous")||p.ach.has("justice"))t=pk(["你喺最難嘅時候揀咗幫人。現實裡面，呢種選擇通常細細個、冇人睇見，例如聽人講完一段說話，或者幫人講一句公道說話。","勇氣唔一定係轟轟烈烈。下次見到不公平嘅事，你會揀點做？"]);
 else if(fs>=60)t=pk(["呢一世，好多嘢喺出世嗰刻已經決定咗。下次見到喺困難環境掙扎嘅人，可能值得多一分理解。","出身唔係我哋揀嘅。認清呢一點，可能會令我哋對自己同對人都寬容啲。"]);
 else t=pk(["喺咁窄嘅空間入面，你嘅選擇都改變到結局。今日你嘅選擇空間大好多，有冇一個你一直拖住未做嘅決定？","抉擇真係有用。揀一件你今個星期可以做嘅小事，當係同呢一世嘅自己打個招呼。"]);
 out.push(`<p class="thought">💭 ${t}</p>`);return out.join("")}
/* 傳承 */
function nextEras(p){const later=ERAS.filter(e=>e.years[1]>p.year+15&&e.id!==p.era.id).sort((a,b)=>a.years[0]-b.years[0]);return later.slice(0,3)}
function heirOf(p){return{pct:p.wea/100,lit:p.lit,sur:p.sur||(p.era.names.sur.length?p.name.slice(0,p.name.length>3?2:1):""),gen:(p.gen||1)+1,family:p.family}}
function saveLineage(p){const L=LS.get("rebirth_lineage",{});const f=L[p.family]||[];f.push({gen:p.gen||1,name:p.name,era:p.era.name,cls:p.cls.name,age:p.age,wea:p.wea});L[p.family]=f;LS.set("rebirth_lineage",L);return f}
/* 成就 */
const ACH=[["first","初入輪迴","完成第一世"],["old70","古稀","活過 70 歲"],["short","匆匆","5 歲前離世"],["official","金榜題名","考取功名／學位"],["rich","富甲一方","財富勝過 90% 人"],["poorup","白手興家","低下階層出身，財富排名超過 70"],["migrant","遠行者","移居他鄉"],["monk","方外","出家／投身宗教"],["pet","有伴","收養動物"],["filial","孝順","親自照顧父母"],["righteous","義人","冒險收留求助者"],["justice","敢言","挺身申訴不公"],["friend","患難見真情","得好友幫手渡過難關"],["kids5","兒孫滿堂","有 5 個或以上子女"],["gen3","三代","傳承到第 3 代"],["era5","四海為家","投胎過 5 個地區"],["eraAll","閱盡千年","投胎過全部 16 個年代"],["codex10","史料收藏家","收集 10 張史料卡"],["reflect","沉澱","寫低 3 段沉澱"],["whatif","如果","用同一出身重玩一次"]];
function checkAch(p,extra){const got=new Set(LS.get("rebirth_ach",[]));const lives=LS.get("rebirth_lives",[]);const eras=new Set(lives.map(l=>l.reg).filter(Boolean)),ancs=new Set(lives.map(l=>l.anchor).filter(x=>x!=null));const nu=[];
 const has=k=>{if(!got.has(k)){got.add(k);nu.push(k)}};has("first");if(p.age>=70)has("old70");if(p.age<5)has("short");if(p.flags.official)has("official");if(p.age>=20&&p.wea>90)has("rich");if(p.cls.rank<=0&&p.wea>70)has("poorup");
 if(p.flags.migrant)has("migrant");if(p.flags.monk)has("monk");p.ach.forEach(a=>ACH.find(x=>x[0]===a)&&has(a));if(p.kids>=5)has("kids5");if((p.gen||1)>=3)has("gen3");if(eras.size>=5)has("era5");if(ancs.size>=ANCHORS.length)has("eraAll");
 if(LS.get("rebirth_codex",[]).length>=10)has("codex10");if(LS.get("rebirth_reflect",[]).filter(r=>r.a).length>=3)has("reflect");if(extra?.whatif)has("whatif");LS.set("rebirth_ach",[...got]);return nu}
/* 每日主題 */
function daily(){const d=new Date(),k=d.getFullYear()*1000+d.getMonth()*40+d.getDate();const e=ERAS[k%ERAS.length];const keys=Object.keys(CODEX).filter(x=>x.startsWith(e.id+":"));return{era:e,card:keys[k%keys.length]}}
return{contrast,cHTML,question,saveReflection,unlock,counterfactual,lesson,nextEras,heirOf,saveLineage,ACH,checkAch,daily,LS,pct}})();
