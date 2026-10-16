/* 遊戲引擎 v2：資料（data/*）同介面（js/ui.js）分開 */
(function(){
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=(a,R)=>a[Math.floor(R()*a.length)];
const wpick=(a,wf,R)=>{const tot=a.reduce((s,b)=>s+wf(b),0);let r=R()*tot;for(const v of a){r-=wf(v);if(r<=0)return v}return a[a.length-1]};
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const yr=y=>y<=0?`前${1-y}年`:`${y}年`;
const W=e=>Math.pow(e.pop,.6);
const eraProb=e=>W(e)/ERAS.reduce((s,x)=>s+W(x),0);
const INC={"-1":.6,0:1,1:1.5,2:2.5,3:4,4:8,5:15};
const CAUSE={inf:"嬰幼兒夭折",dis:"疾病",war:"戰亂",fam:"饑荒",plg:"瘟疫",acc:"意外",old:"衰老"};
function erf(x){const t=1/(1+.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x>=0?y:-y}
const wealthPct=(p)=>{const m=Math.max(p.money,.01*p.era.base);return clamp(50*(1+erf(Math.log(m/(1.5*p.era.base))/1.3/Math.SQRT2)))};
function incomeBand(era,cls){const cs=[...era.classes].sort((a,b)=>a[2]-b[2]);let lo=0;for(const c of cs){if(c[0]===cls.name)return[Math.round(lo*100),Math.round((lo+c[1])*100)];lo+=c[1]}return[0,100]}
function born(seed,eraId,heir,alt){
 const R=rng(seed);const era=eraId?ERAS.find(e=>e.id===eraId):wpick(ERAS,W,R);
 const y0=era.years[0]+Math.floor(R()*(era.years[1]-era.years[0]));
 let c=wpick(era.classes,c=>c[1],R);
 if(heir){const cp=.75*heir.pct+.25*R(),cs=[...era.classes].sort((a,b)=>a[2]-b[2]);let lo=0;for(const x of cs){lo+=x[1];if(cp<=lo){c=x;break}}}
 const cls={name:c[0],rank:c[2],mm:c[3]};
 const sex=R()<.5?"m":"f",N=era.names,name=(heir&&heir.sur&&N.sur.length?heir.sur:N.sur.length?pick(N.sur,R):"")+pick(N[sex],R);
 const urban=R()<era.urb,place=urban?pick(era.place,R):pick(era.place,R)+"附近鄉村";
 const p={seed,R,era,year:y0,birthYear:y0,age:0,place,urban,cls,sex,name,
  hea:clamp(55+R()*35),hap:clamp(50+R()*30),wis:clamp(25+R()*30+cls.rank*4),soc:clamp(25+R()*25+cls.rank*6),fam:clamp(Math.max(0,cls.rank)*10+R()*10),
  money:era.base*INC[cls.rank]*(.3+R()*.6),incMul:INC[cls.rank],
  lit:R()<Math.min(.98,era.lit*(1+Math.max(0,cls.rank)*.8)),married:0,kids:0,kidsAlive:0,kidsDead:0,parentsAlive:2,
  danger:0,flags:{},log:[],grid:[],hist:[],dead:null,cause:null,focus:"family",moneyHist:[],places:[place],
  father:{age:20+Math.floor(R()*15),job:cls.name},mother:{age:16+Math.floor(R()*12)}};
 if(heir){p.gen=heir.gen;p.family=heir.family;p.sur=heir.sur;if(heir.lit&&R()<.6)p.lit=true;p.money*=(.6+heir.pct)}else{p.gen=1;p.family=seed+"_"+Date.now()}
 p.ach=new Set();p.codex=[];p.contrast=[];p.reflect=[];p.choices=[];p.friends=[];
 p.heir=heir;if(alt)p.R=rng(alt);p.band=incomeBand(era,cls);p.wea=wealthPct(p);return p;
}
const FOCUS={study:{n:"讀書",h:"智慧↑ 快樂↓",fx:{wis:3,hap:-1}},friends:{n:"交朋友",h:"人脈↑ 快樂↑",fx:{soc:3,hap:1}},family:{n:"幫家計",h:"財富↑ 健康↓",fx:{hea:-1},inc:.25},sport:{n:"鍛鍊",h:"健康↑",fx:{hea:3,hap:1}},hobby:{n:"嗜好",h:"快樂↑ 智慧↑少",fx:{hap:3,wis:1}}};
function apply(p,fx){for(const k in fx||{})p[k]=clamp(p[k]+fx[k])}
function hazard(p){const m=p.era.mort,a=p.age,k=(window.CALIB?.[p.era.id]?.k)??1;
 let h=a<1?m.q0:a<5?m.c:a<15?m.bg*.6*k:(m.bg*(m.q0>.05?.8:1)+m.g*(m.q0>.05?.45:.8)*Math.exp(.085*(a-30)))*k;
 h*=p.cls.mm*(1.3-p.hea/200);if(p.wea<10&&a>=5)h*=1.2;return Math.min(.95,h)}
function S(p,key){return (window.STATS[p.era.id]||{})[key]}
function log(p,k,t,src,extra){p.log.push({k,t,src,age:p.age,year:p.year,...extra})}
function money(p){const e=p.era,b=e.base,R=p.R;
 const work=p.age<10?0:p.age<15?.3:p.age>65?.4:p.age>55?.75:1;
 const inc=b*p.incMul*work*(.8+R()*.4)*(p.focus==="family"&&p.age>=6?1.25:1)*(p.flags.vice?.9:1);
 const live=b*Math.max(.7,p.incMul*.8)*(p.age<15?0:1)*(.9+R()*.15);
 const kids=b*.08*p.kidsAlive,vice=p.flags.vice?b*.15:0;
 p.money=Math.max(0,p.money+inc-live-kids-vice);p.lastBreak={inc,live,kids,vice};p.moneyHist.push(p.money);p.wea=wealthPct(p)}
const TRAITS=[["勇敢","冒險選擇成功機會略高",{risk:.08}],["謹慎","冒險選擇成功機會略低，但健康穩陣",{risk:-.05,hea:1}],["好奇","智慧每年慢慢增長",{wis:1}],["溫和","人脈每年慢慢增長",{soc:1}],["樂天","快樂每年慢慢增長",{hap:1}]];
function chains(p){const R=p.R,e=p.era;
 if(p.age===2){const t=TRAITS[Math.floor(R()*TRAITS.length)];p.trait={n:t[0],h:t[1],...t[2]};log(p,"life",`你嘅性格漸漸顯露：${t[0]}（${t[1]}）。`)}
 if(p.trait&&p.age>2){const fx={};["wis","soc","hap","hea"].forEach(k=>{if(p.trait[k])fx[k]=p.trait[k]*(R()<.5?1:0)});apply(p,fx)}
 if(p.pet&&p.age>=p.pet.die){log(p,"fam",`陪伴你多年嘅${p.pet.k}「${p.pet.name}」離開咗。`);apply(p,{hap:-6});p.pet=null;p.petLost=1}
 if(p.married&&p.age>20&&R()<hazard({...p,age:p.age+(p.sex==="m"?-3:3),hea:60})*.9){p.married=0;p.widowed=1;log(p,"fam","你嘅伴侶因病離世。");apply(p,{hap:-15})}
 if(p.age>=8&&p.friends.length<3&&R()<.04+p.soc/1500+(p.focus==="friends"?.05:0)){const f=pick(e.names[R()<.5?"m":"f"],R);p.friends.push(f);log(p,"fam",`你同${f}成為好朋友。`);apply(p,{hap:4})}
 if(p.friends.length&&p.money<.3*e.base&&p.age>15&&R()<.15){log(p,"fam",`手頭緊嘅時候，好友${pick(p.friends,R)}借錢幫你渡過難關。`);p.money+=.4*e.base;p.ach.add("friend")}
 if(p.age>=12&&!p.rival&&R()<.015){p.rival=pick(e.names[p.sex],R);log(p,"fam",`你同${p.rival}結下樑子，成為對頭。`)}
 if(p.rival&&R()<.03){log(p,"fam",`對頭${p.rival}暗中搞你，令你蝕咗一筆。`);p.money=Math.max(0,p.money-.2*e.base);apply(p,{hap:-3})}
}
const MILE=[1,5,15,30,50,70,85];
function step(p){
 const R=p.R,e=p.era,ev=[];p.danger=0;let mark="";
 if(p.age>=6)apply(p,FOCUS[p.focus].fx);else apply(p,{hea:1});
 if(p.age>60)apply(p,{hea:-1});if(p.flags.vice)apply(p,{hea:-2});
 apply(p,{hap:(p.wea-50)/50});
 money(p);
 chains(p);
 if(p.parentsAlive&&R()<(p.age<15?.02:.05+p.age*.002)){p.parentsAlive--;log(p,"fam",p.parentsAlive?"你一位父母親離世。":"你另一位父母親都離開咗。");apply(p,{hap:-8})}
 if(p.pendingKidDeath&&p.age>=p.pendingKidDeath.at){p.pendingKidDeath=null;p.kidsAlive--;p.kidsDead++;const s=S(p,"tfr");log(p,"death","你一個孩子未滿五歲就夭折了。願安息。",s&&s[0]+" — "+s[1]);apply(p,{hap:-15})}
 e.events.forEach((v,vi)=>{if(p.year>=v.y[0]&&p.year<=v.y[1]){
  if(p.year===v.y[0]||p.age===0){const ck=e.id+":"+vi;ev.push({k:"hist",t:v.t,src:v.s||e.hsrc,codex:ck});if(!p.codex.includes(ck))p.codex.push(ck);if(v.fx)apply(p,v.fx);mark="h"}
  const safe=p.safeUntil>=p.year?.35:1;
  if(v.war||v.famine||(v.plague&&v.plague>.01)){p.danger=1;p.dangerEvt={t:v.t,war:v.war}}
  if(v.war&&R()<v.war*p.cls.mm*safe){p.dead="死於戰亂";p.cause="war"}
  if(!p.dead&&v.famine&&R()<v.famine*p.cls.mm*safe*(p.wea>70?.4:1)){p.dead="死於饑荒";p.cause="fam"}
  if(!p.dead&&v.plague&&R()<v.plague*(1.3-p.hea/200)*(p.safeUntil>=p.year?.6:1)){p.dead="死於瘟疫";p.cause="plg"}
 }});
 const C=window.CALIB?.[e.id];
 if(C&&MILE.includes(p.age)&&p.age>0){const pct=Math.round(C.l[p.age]*100);ev.push({k:"mile",t:`你活到 ${p.age} 歲。同年同地出生嘅人，估計約 ${pct}% 仲在世。`,src:`模型估算，按 ${e.leSrc} 校準`})}
 let dec=null;
 if(!p.dead){
  if(R()<hazard(p)){p.dead=p.age<1?"夭折於襁褓":p.age<5?"幼年病逝":p.age>=60?"壽終":"病逝";p.cause=p.age<5?"inf":p.age>=60?"old":"dis"}
  else{
   const ok=DECISIONS.filter(d=>p.age>=d.age[0]&&p.age<=d.age[1]&&(d.key==="*evt"||S(p,d.key))&&d.cond(p,e)&&!(p.flags["d_"+d.id]>=(d.once?1:d.max||9)));
   const fl=ok.find(d=>d.id==="flee");
   if(p.danger&&fl&&!(p.flags.fledYear>=p.year-3)&&R()<.6){dec=fl;p.flags.fledYear=p.year}
   else if(ok.length&&R()<(p.age<6?.06:.3))dec=wpick(ok.filter(d=>d.w),d=>d.w,R);
   if(dec)p.flags["d_"+dec.id]=(p.flags["d_"+dec.id]||0)+1;
   if(!dec&&p.age>=10&&R()<.18)ev.push({k:"life",t:`你今年主要${pick(e.jobs,R)}。`});
  }
 }
 if(p.dead&&!ev.some(x=>x.k==="death"))ev.push({k:"death",t:`${p.dead}。`});
 ev.forEach(x=>log(p,x.k,x.t,x.src,x.codex?{codex:x.codex}:{}));
 p.grid.push(p.dead?"d":mark||(dec?"c":"n"));p.hist.push(p.hap);
 return {ev,dec};
}
function odds(p,c){if(!c.odds)return null;let o=c.odds(p,p.era);if(c.risk&&p.trait?.risk)o+=p.trait.risk;return Math.max(.02,Math.min(.95,o))}
const hint=o=>o==null?"":o<.3?"偏低":o<.6?"中等":"偏高";
function gated(p,c){return c.gate&&!c.gate(p,p.era)}
function choose(p,dec,i){const c=dec.c[i],o=odds(p,c),ok=o==null?true:p.R()<o;const r=c.run(p,p.R,p.era,ok)||{};const b=p.era.base;
 apply(p,r.fx);if(r.money)p.money=Math.max(0,p.money+r.money*b);if(r.abs)p.money=Math.max(0,p.money+r.abs);if(r.income)p.incMul+=r.income;
 if(r.lit)p.lit=true;if(r.married===1){p.married=1;p.everMarried=1;if(p.R()<.3)p.marriageBad=1}if(r.married===-1)p.married=0;if(r.kid){p.kidsAlive++}
 if(r.flag)p.flags[r.flag]=1;if(r.unflag)delete p.flags[r.unflag];if(r.safe)p.safeUntil=p.year+3;if(r.flag==="migrant")p.places.push("異鄉");
 if(r.ach)p.ach.add(r.ach);if(r.divorced){p.divorced=1;p.marriageBad=0}if(r.fixed)p.marriageBad=0;if(r.retired)p.retired=1;if(p.incMul<.2)p.incMul=.2;
 p.choices.push({id:dec.id,i,ok,age:p.age});
 if(r.die){p.dead=r.die;p.cause=r.cause||"acc";p.grid[p.grid.length-1]="d"}
 p.wea=wealthPct(p);const s=dec.key==="*evt"?null:S(p,dec.key);
 log(p,r.die?"death":"choice",`${typeof dec.t==="function"?dec.t(p,p.era):dec.t} → ${c.t}：${r.t}`,s&&`${s[0]} — ${s[1]}`,{key:true});return r}
function advance(p){if(!p.dead){p.age++;p.year++}}
function title(p){if(p.flags.official)return"金榜之人";if(p.age<5)return"短暫嘅過客";if(p.flags.monk)return"方外之人";if(p.flags.migrant)return"遠行者";if(p.age>=20&&p.wea>90)return"富甲一方";if(p.wis>85)return"博學之人";if(p.hap>80)return"快活一生";if(p.age>=70)return"長壽之人";if(p.soc>80)return"交遊廣闊";return"平凡一生"}
function autoPick(p,dec){const ok=dec.c.map((c,i)=>i).filter(i=>!gated(p,dec.c[i]));return ok[Math.floor(p.R()*ok.length)]}
function quick(seed,eraId,cap=130){const p=born(seed,eraId);let n=0;while(!p.dead&&n++<cap){p.focus=pick(Object.keys(FOCUS),p.R);const {dec}=step(p);if(dec&&!p.dead)choose(p,dec,autoPick(p,dec));advance(p)}if(!p.dead){p.dead="壽終";p.cause="old"}return p}
function quickFrom(seed,eraId,heir,alt,cap=130){const p=born(seed,eraId,heir,alt);let n=0;while(!p.dead&&n++<cap){p.focus=pick(Object.keys(FOCUS),p.R);const {dec}=step(p);if(dec&&!p.dead)choose(p,dec,autoPick(p,dec));advance(p)}if(!p.dead){p.dead="壽終";p.cause="old"}return p}
function fmtMoney(e,v){let u=e.cur,x=v;if(u==="文"&&v>=1000){x=v/1000;u="貫"}if(u==="港元"&&v>=1e4){return`${(v/1e4).toFixed(v>=1e5?0:1)} 萬港元`}
 const n=x>=100?Math.round(x).toLocaleString():x>=10?x.toFixed(0):x.toFixed(1);return u==="£"?`£${n}`:`${n} ${u}`}
window.Engine={quickFrom,TRAITS,born,step,choose,advance,title,quick,FOCUS,yr,hazard,rng,eraProb,odds,hint,gated,autoPick,fmtMoney,wealthPct,CAUSE,S};
})();
