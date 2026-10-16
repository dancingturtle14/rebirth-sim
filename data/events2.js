/* v3 抉擇：寵物、離婚、養老、退休、投資、道德抉擇 */
(function(){
const B=(p,e,x)=>p.money>=x*e.base,cl=v=>Math.max(.02,Math.min(.95,v)),V=(e,m,d)=>m[e.id]||d;
const PET={egypt:"貓",qinhan:"牛",rome:"狗",tang:"馬",song:"貓",blackdeath:"狗",mongol:"馬",mingqing:"牛",edo:"狗",london:"狗",shanghai:"貓",ww2:"狗",hk:"貓"};
const PETLIFE={貓:15,狗:12,馬:22,牛:15};
DECISIONS.push(
{id:"pet",key:"pet",age:[5,50],w:2,once:1,cond:p=>!p.pet,
 t:(p,e)=>`有隻${PET[e.id]}好似想跟住你。`,
 c:[{t:"收留佢",h:"快樂↑ 財富↓少",run:(p,R,e)=>{const k=PET[e.id];p.pet={k,name:["阿福","小黑","阿花","大白","豆豆"][Math.floor(R()*5)],die:p.age+3+Math.floor(R()*PETLIFE[k])};return{t:`你收留咗${k}「${p.pet.name}」。`,fx:{hap:8},money:-.05,ach:"pet"}}},
    {t:"由佢走",h:"",run:()=>({t:"佢慢慢行開咗。"})}]},
{id:"divorce",key:"divorce",age:[22,60],w:2,once:1,cond:p=>p.married&&p.marriageBad,
 t:()=>"夫妻之間嘅矛盾越來越深。",
 c:[{t:"分開",h:"快樂? 人脈↓ 財富↓",gate:(p,e)=>!(["blackdeath"].includes(e.id)),gt:"當時教會唔准離婚",odds:(p,e)=>cl(e.id==="mingqing"&&p.sex==="f"?.1:.6),run:(p,R,e,ok)=>ok?{t:"你哋分開咗，你重新開始。",fx:{hap:6,soc:-5},money:-.3,married:-1,divorced:1}:{t:"離唔成，關係更差。",fx:{hap:-10}}},
    {t:"忍耐維持",h:"快樂↓",run:()=>({t:"你選擇維持呢段婚姻。",fx:{hap:-4}})},
    {t:"嘗試修補",h:"",odds:p=>cl(.35+p.soc/300),soc:1,run:(p,R,e,ok)=>ok?{t:"你哋傾開咗，關係好返。",fx:{hap:8},fixed:1}:{t:"努力過，但改變唔到。",fx:{hap:-3}}}]},
{id:"care",key:"elder",age:[25,55],w:3,once:1,cond:p=>p.parentsAlive>0,
 t:()=>"父母年紀大，身體轉差，需要人照顧。",
 c:[{t:"親自照顧",h:"人脈↑ 財富↓ 健康↓少",run:()=>({t:"你陪伴父母走過晚年。",fx:{soc:6,hap:3,hea:-3},money:-.3,ach:"filial"})},
    {t:"出錢請人／交兄弟姊妹",h:"財富↓",gate:(p,e)=>B(p,e,.5),gt:"需要約0.5年收入",run:()=>({t:"你出錢安排照顧。",money:-.5,fx:{soc:-1}})},
    {t:"自己都顧唔掂",h:"快樂↓",run:()=>({t:"你力不從心，心裡內疚。",fx:{hap:-6}})}]},
{id:"retire",key:"elder",age:[55,75],w:3,once:1,cond:p=>!p.retired,
 t:(p,e)=>V(e,{hk:"到咗退休年齡，強積金可以提取。",edo:"係時候考慮「隱居」，交家督俾下一代。",london:"你做唔郁粗重嘢，擔心晚年。"},"你年紀漸大，係咪要放低工作？"),
 c:[{t:"退休／交棒",h:"健康↑ 收入↓",run:p=>({t:"你放慢腳步，享受晚年。",fx:{hea:5,hap:5},income:-p.incMul*.5,retired:1})},
    {t:"繼續做",h:"財富↑ 健康↓",run:()=>({t:"你繼續工作。",fx:{hea:-4}})}]},
{id:"invest",key:"invest",age:[22,65],w:2,max:2,cond:()=>true,
 t:(p,e)=>V(e,{hk:"股市氣氛熾熱，朋友叫你入市。",edo:"堂島米市有人炒米價。",london:"人人都講鐵路股。",song:"有人收購交子，話會升值。",shanghai:"橡皮股票人人搶購。",ww2:"經紀話股市只會升。",rome:"有商人想借錢，願付高息。",mingqing:"錢莊邀你放債收息。"},"有人介紹投資。"),
 c:[{t:"投入三成家財",h:"財富↑ 或 ↓",gate:(p,e)=>B(p,e,.5),gt:"需要至少0.5年收入",risk:1,odds:p=>cl(.45+p.wis/500),run:(p,R,e,ok)=>{const s=p.money*.3;return ok?{t:"賺咗一筆。",abs:s*.6}:{t:"遇上大跌，蝕咗大半。",abs:-s*.8,fx:{hap:-6}}}},
    {t:"唔掂",h:"",run:()=>({t:"你冇參與。"})}]},
{id:"refugee",key:"refugee",age:[18,70],w:2,once:1,cond:p=>p.danger,
 t:(p,e)=>V(e,{ww2:"深夜有人拍門，係一家逃避搜捕嘅人，求你收留。",shanghai:"一家逃難嘅人求你俾地方佢哋避一避。",mingqing:"有個逃人求你收留。",blackdeath:"城外有人想入城，但守衛話佢可能帶病。"},"有人求你收留。"),
 c:[{t:"收留佢哋",h:"人脈↑ 聲望↑ 有風險",risk:1,odds:()=>.75,run:(p,R,e,ok)=>ok?{t:"你冒險收留咗佢哋，佢哋最終平安離開。",fx:{fam:10,hap:6,soc:6},ach:"righteous"}:{t:"事情敗露，你受到懲罰。",fx:{hea:-15,fam:5},money:-.5,ach:"righteous"}},
    {t:"指路俾佢哋去別處",h:"",run:()=>({t:"你俾咗少少食物，指路俾佢哋。",fx:{hap:-2}})},
    {t:"閂門",h:"安全",run:()=>({t:"你閂上門。之後好多晚都瞓唔著。",fx:{hap:-6}})}]},
{id:"injustice",key:"injustice",age:[18,70],w:2,once:1,cond:()=>true,
 t:(p,e)=>V(e,{hk:"你發現上司收受利益。",london:"你見到工廠虐待童工。"},"你見到地方官吏欺壓鄰里。"),
 c:[{t:"挺身申訴",h:"聲望↑ 或 被報復",risk:1,odds:(p,e)=>cl((e.id==="hk"?.6:.3)+p.fam/300+p.soc/400),run:(p,R,e,ok)=>ok?{t:"你嘅申訴得到受理，鄰里感激你。",fx:{fam:12,soc:8},ach:"justice"}:{t:"你被打擊報復。",fx:{hea:-8,hap:-6},money:-.3}},
    {t:"暗中幫受害者",h:"人脈↑",run:()=>({t:"你暗中幫咗受害嘅人。",fx:{soc:5,hap:2}})},
    {t:"明哲保身",h:"",run:()=>({t:"你選擇唔出聲。",fx:{hap:-3}})}]}
);
window.PET=PET;
})();
