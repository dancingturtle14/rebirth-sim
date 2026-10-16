/* 遊戲引擎：同 UI 分開，方便之後換機制 */
(function(){
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=(arr,R)=>arr[Math.floor(R()*arr.length)];
const wpick=(arr,wf,R)=>{const tot=arr.reduce((a,b)=>a+wf(b),0);let r=R()*tot;for(const v of arr){r-=wf(v);if(r<=0)return v}return arr[arr.length-1]};
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const yr=y=>y<0?`前${-y}年`:`${y}年`;
function born(seed,eraId){
 const R=rng(seed),E=window.ERAS;
 const era=eraId?E.find(e=>e.id===eraId):wpick(E,e=>Math.pow(e.pop,.6),R);
 const y0=era.years[0]+Math.floor(R()*(era.years[1]-era.years[0]));
 const c=wpick(era.classes,c=>c[1],R),cls={name:c[0],rank:c[2],mm:c[3]};
 const sex=R()<.5?"m":"f",N=era.names;
 const name=(N.sur.length?pick(N.sur,R):"")+pick(N[sex],R);
 const b=40+cls.rank*8;
 const p={seed,R,era,year:y0,birthYear:y0,age:0,place:pick(era.place,R),cls,sex,name,
  hea:clamp(55+R()*35),hap:clamp(50+R()*30),wis:clamp(30+R()*30+cls.rank*4),soc:clamp(25+R()*25+cls.rank*6),wea:clamp(b*.6+R()*20),fam:clamp(cls.rank*10+R()*10),
  lit:R()<Math.min(.98,era.lit*(1+cls.rank*.8)),married:0,kids:0,danger:0,flags:{},log:[],grid:[],dead:null,focus:"work"};
 return p;
}
const FOCUS={study:{n:"讀書",fx:{wis:3,hap:-1}},work:{n:"勞作",fx:{wea:3,hea:-1}},social:{n:"交際",fx:{soc:3,hap:1,wea:-1}},rest:{n:"休養",fx:{hea:3,hap:2,wea:-1}}};
function apply(p,fx){for(const k in fx)p[k]=clamp(p[k]+fx[k])}
function hazard(p){const m=p.era.mort,a=p.age;let h=a<1?m.q0:a<5?m.c:m.bg*(m.q0>.05?.8:1)+m.g*(m.q0>.05?.45:.8)*Math.exp(.085*(a-30));
 if(a>=5&&a<15)h=m.bg*.6;
 h*=p.cls.mm*(1.3-p.hea/200);if(p.wea<15&&a>=5)h*=1.25;return Math.min(.95,h)}
/* 行一年：返回 {events:[], decision} */
function step(p,F){
 const R=p.R,ev=[];p.danger=0;let mark="";
 if(p.age>=6)apply(p,FOCUS[p.focus].fx);else apply(p,{hea:1});
 if(p.age>60)apply(p,{hea:-1});
 for(const e of p.era.events){if(p.year>=e.y[0]&&p.year<=e.y[1]){
  const first=p.year===e.y[0]||p.age===0;if(first){ev.push({k:"hist",t:e.t});if(e.fx)apply(p,e.fx);mark="h"}
  if(e.war){p.danger=1;if(R()<e.war*p.cls.mm){p.dead="死於戰亂";ev.push({k:"death",t:"戰火燒到你身邊……"});}}
  if(!p.dead&&e.famine&&R()<e.famine*p.cls.mm*(p.wea>60?.4:1)){p.dead="死於饑荒";ev.push({k:"death",t:"糧食斷絕。"})}
  if(!p.dead&&e.plague&&R()<e.plague*(1.3-p.hea/200)){p.dead="死於瘟疫";ev.push({k:"death",t:"瘟疫找上了你。"})}
 }}
 let dec=null;
 if(!p.dead){
  if(R()<hazard(p)){p.dead=p.age<1?"夭折於襁褓":p.age<5?"幼年病逝":p.age>60?"壽終":"病逝";}
  else{
   const ok=window.DECISIONS.filter(d=>p.age>=d.age[0]&&p.age<=d.age[1]&&d.cond(p,p.era)&&!(p.flags["d_"+d.id]>=(d.id==="child"?6:d.id==="sick"?9:1)));
   if(p.danger&&ok.find(d=>d.id==="flee")&&R()<.5)dec=ok.find(d=>d.id==="flee");
   else if(ok.length&&R()<.28)dec=wpick(ok,d=>d.w||.01,R);
   if(dec)p.flags["d_"+dec.id]=(p.flags["d_"+dec.id]||0)+1;
   if(!dec&&p.age>=10&&R()<.25)ev.push({k:"life",t:`你今年主要${pick(p.era.jobs,R)}。`});
  }
 }
 p.log.push(...ev.map(e=>({...e,age:p.age,year:p.year})));
 p.grid.push(p.dead?"d":mark||(dec?"c":ev.length?"e":"n"));
 return {ev,dec};
}
function choose(p,dec,i){const r=dec.c[i].run(p,p.R,p.era);if(r.fx)apply(p,r.fx);if(r.lit)p.lit=true;if(r.married)p.married=1;if(r.kid)p.kids++;if(r.flag)p.flags[r.flag]=1;if(r.die)p.dead=r.die;
 p.log.push({k:r.die?"death":"choice",t:`${dec.t} → ${dec.c[i].t}：${r.t}`,age:p.age,year:p.year});if(r.die)p.grid[p.grid.length-1]="d";return r}
function advance(p){if(!p.dead){p.age++;p.year++;if(p.year===0)p.year=1}}
function title(p){const s=p.wea+p.fam;if(p.flags.official)return"一代名臣";if(p.age<5)return"短暫嘅過客";if(s>140)return"顯赫一時";if(p.wis>85)return"博學之人";if(p.hap>80)return"快活一生";if(p.age>70)return"長壽之人";if(p.soc>80)return"交遊廣闊";return"平凡一生"}
function quick(seed,eraId){const p=born(seed,eraId);let n=0;while(!p.dead&&n++<120){p.focus=pick(Object.keys(FOCUS),p.R);const {dec}=step(p);if(dec&&!p.dead)choose(p,dec,Math.floor(p.R()*dec.c.length));advance(p)}if(!p.dead)p.dead="壽終";return p}
window.Engine={born,step,choose,advance,title,quick,FOCUS,yr,hazard,rng};
})();
