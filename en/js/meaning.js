/* 意義層：古今對照、沉澱一下、史料卡、這一生教會我、如果、傳承、成就 */
window.Meaning=(function(){
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* 古今對照 */
function contrast(p,key,evt){const e=p.era,C=CALIB[e.id],S=STATS[e.id],M=MODERN[key];if(!M)return null;let then,src;
 if(key==="u5"){if(e.cell){then=`Chance of dying before age five: about ${pct(e.cell.u5)}`;src=e.u5Src}else{then=`Chance of dying before age five: about ${pct(C.u5)} (model estimate)`;src=e.leSrc}}
 else if(key==="le"){then=e.cell?`Life expectancy at birth: about ${e.cell.le} yrs`:`Life expectancy at birth: about ${e.le[0]}–${e.le[1]} yrs`;src=e.leSrc}
 else if(key==="lit"){if(!S.lit)return null;then=S.lit[0];src=S.lit[1]}
 else if(key==="tfr"){if(!S.tfr)return null;then=S.tfr[0];src=S.tfr[1]}
 else if(key==="hours"){if(e.id!=="london")return null;then="Only the 1833 Factory Act limited child workers aged 9–13 to 9 hours a day";src="Factory Act 1833"}
 else{then=evt?evt.t:"";src=evt?evt.src:e.hsrc}
 return{key,then,hk:M.hk,w:M.w,src:`${src}; ${M.src}`}}
const cHTML=c=>`<div class="now"><b>🕰 Then & Now</b><div>Then: ${c.then}</div>${c.hk?`<div>Hong Kong today: ${c.hk}</div>`:""}${c.w?`<div>World today: ${c.w}</div>`:""}<span class="fn">📜 ${c.src}</span></div>`;
/* 沉澱一下 */
function question(p,trig){const e=p.era,C=CALIB[e.id],n=p.name;const T={
 5:`${n}You survived the most dangerous first five years. In this era, about ${pct(C.u5)} of children didn't (model estimate). When you were little, was there anything you took for granted?`,
 15:`Fifteen years old, ${n}${p.lit?"literate":"unable to read"}, spending every day ${e.jobs[0]}. What worried you most when you were fifteen?`,
 30:`Thirty. Of the people born the same year, about ${pct(C.l[30])} are still alive (model estimate). If you were ${n}, what would you most want to do next?`,
 50:`Fifty, which counts as a long life in this era. When you picture yourself at fifty, who's around you?`,
 70:`Seventy. ${n}Looking back on this life, what might the biggest regret be? Could you avoid it today?`,
 kid:`Losing a child was common back then, but being common doesn't make the pain any smaller. How would you remember a very short life?`,
 exam:`An exam almost decided a person's fate. Has a test or assessment ever changed the path of your life?`,
 migr:`${n}You left the place you knew. If you had to leave your home today, what would you take?`,
 moral:`Facing this choice, ${n} took the path they took. Would you choose the same? Why?`,
 flee:`Flee or stay: there's rarely a good option. Many people in the world still face this today. What would you do?`};return T[trig]}
function saveReflection(p,q,a,ag){ag=ag??p.age;const L=LS.get("rebirth_en_reflect",[]);L.push({q,a,name:p.name,era:p.era.name,age:ag,ts:Date.now()});LS.set("rebirth_en_reflect",L.slice(-200));p.reflect.push({q,a,age:ag})}
/* 史料卡 */
function unlock(keys){const s=new Set(LS.get("rebirth_en_codex",[]));const nu=keys.filter(k=>!s.has(k));keys.forEach(k=>s.add(k));LS.set("rebirth_en_codex",[...s]);return nu}
/* 反事實：出身 vs 抉擇 */
function counterfactual(p){const e=p.era,N=30;let ea=0,ew=0,sa=0,sw=0;
 for(let i=0;i<N;i++){const sd=p.seed*7+i*101+3,a=Engine.quick(sd,e.anchor!=null?World.eraFor(sd,e.anchor):e.id);ea+=a.age;ew+=a.wea;
  const b=Engine.quickFrom(p.seed,e,p.heir,p.seed+5000+i*17);sa+=b.age;sw+=b.wea}
 return{eraAge:ea/N,eraWea:ew/N,sbAge:sa/N,sbWea:sw/N}}
function lesson(p,cf){const e=p.era,f=Math.abs(cf.sbWea-cf.eraWea),c=Math.abs(p.wea-cf.sbWea),fs=Math.round(100*f/Math.max(1,f+c));
 const up=(a,b)=>a>=b?"higher":"lower";const out=[];
 out.push(`<p><b>Birth</b>: You were born in ${e.name} as ${p.cls.name}. People born at random anywhere in the world in the same era averaged a wealth rank of about ${Math.round(cf.eraWea)}; people born exactly where you were averaged about ${Math.round(cf.sbWea)}. Your birth alone put you ${up(cf.sbWea,cf.eraWea)} by ${Math.round(f)} points.</p>`);
 out.push(`<p><b>Choices & luck</b>: You made ${p.choices.length} choices and ended with a wealth rank of ${p.wea}, which is ${Math.round(c)} points ${up(p.wea,cf.sbWea)} than others of your birth. Others born like you lived to about ${Math.round(cf.sbAge)} on average; you lived to ${p.age}.</p>`);
 out.push(`<p class="ratio"><span style="width:${fs}%">Birth ${fs}%</span><span style="width:${100-fs}%">Choices + luck ${100-fs}%</span></p><p class="note" style="text-align:left">In this model, about ${fs}% of the gap in your lifetime wealth comes from birth (comparing 30 random lives from the same birth with 30 random births worldwide in the same era).</p>`);
 out.push(`<p><b>If you were born in Hong Kong today</b>: life expectancy ${MODERN.le.hk} (then: about ${e.cell?e.cell.le:e.le[0]+"–"+e.le[1]}), chance of dying before five ${MODERN.u5.hk} (then: about ${pct(e.cell?e.cell.u5:CALIB[e.id].u5)}), literacy ${MODERN.lit.hk}. <span class="fn">📜 ${MODERN.le.src}; ${MODERN.u5.src}; ${e.leSrc}</span></p>`);
 if(p.reflect.length)out.push(`<p><b>Your reflections</b></p>`+p.reflect.filter(r=>r.a).map(r=>`<blockquote>"${r.a}"<small>— at age ${r.age}</small></blockquote>`).join("")||"");
 const R=Engine.rng(p.seed+9),pk=a=>a[Math.floor(R()*a.length)];let t;
 if(p.kidsDead||p.age<5)t=pk(["In Hong Kong today, few parents have to worry that their child won't live to five. That was won by generations of vaccines, clean water and medicine. Maybe say a few extra words to your family tonight.","A very short life is still a whole story. It might be worth learning where in today's world children still die of preventable diseases."]);
 else if(p.ach.has("righteous")||p.ach.has("justice"))t=pk(["In the hardest moment, you chose to help. In real life, choices like that are usually small and unseen: listening to someone all the way through, or speaking up for them.","Courage doesn't have to be dramatic. Next time you see something unfair, what will you do?"]);
 else if(fs>=60)t=pk(["In this life, a lot was decided the moment you were born. Next time you see someone struggling in hard circumstances, it may be worth a little more understanding.","We don't choose where we're born. Seeing that clearly might make us a little kinder to ourselves and to others."]);
 else t=pk(["Even with so little room, your choices changed the ending. You have much more room today. Is there a decision you've been putting off?","Choices really do matter. Pick one small thing you can do this week, as a nod to the you of this life."]);
 out.push(`<p class="thought">💭 ${t}</p>`);return out.join("")}
/* 傳承 */
function nextEras(p){const later=ERAS.filter(e=>e.years[1]>p.year+15&&e.id!==p.era.id).sort((a,b)=>a.years[0]-b.years[0]);return later.slice(0,3)}
function heirOf(p){return{pct:p.wea/100,lit:p.lit,sur:p.sur||(p.era.names.sur.length?p.name.slice(0,p.name.length>3?2:1):""),gen:(p.gen||1)+1,family:p.family}}
function saveLineage(p){const L=LS.get("rebirth_en_lineage",{});const f=L[p.family]||[];f.push({gen:p.gen||1,name:p.name,era:p.era.name,cls:p.cls.name,age:p.age,wea:p.wea});L[p.family]=f;LS.set("rebirth_en_lineage",L);return f}
/* 成就 */
const ACH=[["first","First Rebirth","Finish your first life"],["old70","Threescore and Ten","Live past 70"],["short","Fleeting","Die before age 5"],["official","Top of the Exam","Earn an official degree or title"],["rich","The Magnate","Wealthier than 90% of people"],["poorup","Self-Made","Born poor, finish above the 70th wealth percentile"],["migrant","The Wanderer","Emigrant"],["monk","Renunciant","Become a monk, nun or cleric"],["pet","Companion","Adopt an animal"],["filial","Devoted Child","Care for your parents yourself"],["righteous","Righteous","Risk sheltering someone in need"],["justice","Outspoken","Stand up against injustice"],["friend","A Friend in Need","Get through hard times with a friend's help"],["kids5","Big Family","Have 5 or more children"],["gen3","Three Generations","Reach generation 3"],["era5","Citizen of the World","Be born in 5 regions"],["eraAll","A Thousand Years","Be born in all 16 eras"],["codex10","Archivist","Collect 10 history cards"],["reflect","Reflective","Write 3 reflections"],["whatif","What If","Replay from the same birth"]];
function checkAch(p,extra){const got=new Set(LS.get("rebirth_en_ach",[]));const lives=LS.get("rebirth_en_lives",[]);const eras=new Set(lives.map(l=>l.reg).filter(Boolean)),ancs=new Set(lives.map(l=>l.anchor).filter(x=>x!=null));const nu=[];
 const has=k=>{if(!got.has(k)){got.add(k);nu.push(k)}};has("first");if(p.age>=70)has("old70");if(p.age<5)has("short");if(p.flags.official)has("official");if(p.age>=20&&p.wea>90)has("rich");if(p.cls.rank<=0&&p.wea>70)has("poorup");
 if(p.flags.migrant)has("migrant");if(p.flags.monk)has("monk");p.ach.forEach(a=>ACH.find(x=>x[0]===a)&&has(a));if(p.kids>=5)has("kids5");if((p.gen||1)>=3)has("gen3");if(eras.size>=5)has("era5");if(ancs.size>=ANCHORS.length)has("eraAll");
 if(LS.get("rebirth_en_codex",[]).length>=10)has("codex10");if(LS.get("rebirth_en_reflect",[]).filter(r=>r.a).length>=3)has("reflect");if(extra?.whatif)has("whatif");LS.set("rebirth_en_ach",[...got]);return nu}
/* 每日主題 */
function daily(){const d=new Date(),k=d.getFullYear()*1000+d.getMonth()*40+d.getDate();const e=ERAS[k%ERAS.length];const keys=Object.keys(CODEX).filter(x=>x.startsWith(e.id+":"));return{era:e,card:keys[k%keys.length]}}
return{contrast,cHTML,question,saveReflection,unlock,counterfactual,lesson,nextEras,heirOf,saveLineage,ACH,checkAch,daily,LS,pct}})();
