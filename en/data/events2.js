/* v3 抉擇：寵物、離婚、養老、退休、投資、道德抉擇 */
(function(){
const B=(p,e,x)=>p.money>=x*e.base,cl=v=>Math.max(.02,Math.min(.95,v)),V=(e,m,d)=>m[e.id]||d;
const PET={egypt:"cat",qinhan:"ox",rome:"dog",tang:"horse",song:"cat",blackdeath:"dog",mongol:"horse",mingqing:"ox",edo:"dog",london:"dog",shanghai:"cat",ww2:"dog",hk:"cat"};
const PETLIFE={貓:15,狗:12,馬:22,牛:15};
DECISIONS.push(
{id:"pet",key:"pet",age:[5,50],w:2,once:1,cond:p=>!p.pet,
 t:(p,e)=>`A ${PET[e.id]} seems to want to follow you.`,
 c:[{t:"Take it in",h:"Joy↑ Wealth↓ (a little)",run:(p,R,e)=>{const k=PET[e.id];p.pet={k,name:["Lucky","Blackie","Ohana","Snowy","Bean"][Math.floor(R()*5)],die:p.age+3+Math.floor(R()*PETLIFE[k])};return{t:`You take in ${k}"${p.pet.name}".`,fx:{hap:8},money:-.05,ach:"pet"}}},
    {t:"Let it go",h:"",run:()=>({t:"It slowly wanders off."})}]},
{id:"divorce",key:"divorce",age:[22,60],w:2,once:1,cond:p=>p.married&&p.marriageBad,
 t:()=>"The rift between you and your spouse keeps growing.",
 c:[{t:"Separate",h:"Joy? Network↓ Wealth↓",gate:(p,e)=>!(["blackdeath"].includes(e.id)),gt:"The church didn't allow divorce at the time",odds:(p,e)=>cl(e.id==="mingqing"&&p.sex==="f"?.1:.6),run:(p,R,e,ok)=>ok?{t:"You separate and start over.",fx:{hap:6,soc:-5},money:-.3,married:-1,divorced:1}:{t:"You can't get a divorce, and things get worse.",fx:{hap:-10}}},
    {t:"Endure it",h:"Joy↓",run:()=>({t:"You choose to keep the marriage going.",fx:{hap:-4}})},
    {t:"Try to mend it",h:"",odds:p=>cl(.35+p.soc/300),soc:1,run:(p,R,e,ok)=>ok?{t:"You talk it through, and things get better.",fx:{hap:8},fixed:1}:{t:"You try, but nothing changes.",fx:{hap:-3}}}]},
{id:"care",key:"elder",age:[25,55],w:3,once:1,cond:p=>p.parentsAlive>0,
 t:()=>"Your parents are getting old and frail and need looking after.",
 c:[{t:"Care for them yourself",h:"Network↑ Wealth↓ Health↓ (a little)",run:()=>({t:"You stay with your parents through their final years.",fx:{soc:6,hap:3,hea:-3},money:-.3,ach:"filial"})},
    {t:"Pay for help / leave it to siblings",h:"Wealth↓",gate:(p,e)=>B(p,e,.5),gt:"Costs about 0.5 years' income",run:()=>({t:"You pay to arrange their care.",money:-.5,fx:{soc:-1}})},
    {t:"You can barely cope yourself",h:"Joy↓",run:()=>({t:"You can't manage it, and you feel guilty.",fx:{hap:-6}})}]},
{id:"retire",key:"elder",age:[55,75],w:3,once:1,cond:p=>!p.retired,
 t:(p,e)=>V(e,{hk:"You've reached retirement age and can draw your MPF.",edo:"It's time to consider retiring and handing the household to the next generation.",london:"You can't do heavy work any more, and you worry about old age."},"You're getting older. Is it time to put down your work?"),
 c:[{t:"Retire / hand over",h:"Health↑ Income↓",run:p=>({t:"You slow down and enjoy your later years.",fx:{hea:5,hap:5},income:-p.incMul*.5,retired:1})},
    {t:"Keep working",h:"Wealth↑ Health↓",run:()=>({t:"You keep working.",fx:{hea:-4}})}]},
{id:"invest",key:"invest",age:[22,65],w:2,max:2,cond:()=>true,
 t:(p,e)=>V(e,{hk:"The stock market is red-hot, and a friend urges you to buy in.",edo:"People are speculating on rice prices at the Dōjima rice market.",london:"Everyone's talking about railway shares.",song:"Someone is buying up jiaozi paper money, saying it will rise in value.",shanghai:"Everyone is scrambling to buy rubber shares.",ww2:"Your broker says the market can only go up.",rome:"A merchant wants a loan and will pay high interest.",mingqing:"The money shop invites you to lend at interest."},"Someone pitches you an investment."),
 c:[{t:"Put in 30% of your wealth",h:"Wealth↑ or ↓",gate:(p,e)=>B(p,e,.5),gt:"Needs at least 0.5 years' income",risk:1,odds:p=>cl(.45+p.wis/500),run:(p,R,e,ok)=>{const s=p.money*.3;return ok?{t:"You make a tidy profit.",abs:s*.6}:{t:"The market crashes, and you lose most of it.",abs:-s*.8,fx:{hap:-6}}}},
    {t:"Pass",h:"",run:()=>({t:"You stay out of it."})}]},
{id:"refugee",key:"refugee",age:[18,70],w:2,once:1,cond:p=>p.danger,
 t:(p,e)=>V(e,{ww2:"Late at night there's a knock: a family on the run from a search party begs you to hide them.",shanghai:"A family of refugees begs you for somewhere to shelter.",mingqing:"A fugitive begs you to take them in.",blackdeath:"Someone outside the walls wants to get into the city, but the guards say they may be sick."},"Someone begs you to take them in."),
 c:[{t:"Take them in",h:"Network↑ Reputation↑, risky",risk:1,odds:()=>.75,run:(p,R,e,ok)=>ok?{t:"You risk sheltering them, and in the end they leave safely.",fx:{fam:10,hap:6,soc:6},ach:"righteous"}:{t:"You're found out and punished.",fx:{hea:-15,fam:5},money:-.5,ach:"righteous"}},
    {t:"Point them somewhere else",h:"",run:()=>({t:"You give them a little food and point the way.",fx:{hap:-2}})},
    {t:"Shut the door",h:"Safe",run:()=>({t:"You shut the door. For many nights afterwards, you can't sleep.",fx:{hap:-6}})}]},
{id:"injustice",key:"injustice",age:[18,70],w:2,once:1,cond:()=>true,
 t:(p,e)=>V(e,{hk:"You find out your boss is taking bribes.",london:"You see child workers being abused at the factory."},"You see local officials bullying your neighbours."),
 c:[{t:"Speak up and complain",h:"Reputation↑ or retaliation",risk:1,odds:(p,e)=>cl((e.id==="hk"?.6:.3)+p.fam/300+p.soc/400),run:(p,R,e,ok)=>ok?{t:"Your complaint is heard, and your neighbours are grateful.",fx:{fam:12,soc:8},ach:"justice"}:{t:"You face retaliation.",fx:{hea:-8,hap:-6},money:-.3}},
    {t:"Quietly help the victims",h:"Network↑",run:()=>({t:"You quietly help the people who were wronged.",fx:{soc:5,hap:2}})},
    {t:"Keep your head down",h:"",run:()=>({t:"You choose to stay silent.",fx:{hap:-3}})}]}
);
window.PET=PET;
})();
