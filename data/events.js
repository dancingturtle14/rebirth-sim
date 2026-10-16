/* 抉擇事件（模組化）：cond(p,era) 決定會否出現；choices 嘅 odds 會受階級/數值影響 */
window.DECISIONS = [
{id:"exam",age:[16,40],w:3,cond:(p,e)=>e.exam&&p.lit,t:"今年開科取士。你要唔要上京赴考？",
 c:[{t:"赴考",run:(p,R)=>{const o=.02+p.wis/600+(p.cls.rank>=3?.05:0);return R()<o?{t:"金榜題名！你中咗進士，入仕為官。",fx:{wea:30,fam:30,hap:15},flag:"official"}:{t:"名落孫山，盤纏用盡。",fx:{wea:-8,hap:-6}}}},{t:"安份守己",run:()=>({t:"你決定留喺家鄉。",fx:{hap:2}})}]},
{id:"school",age:[6,14],w:3,cond:(p,e)=>!p.lit,t:"有人願意教你識字。",
 c:[{t:"拜師學字",run:(p,R,e)=>R()<.35+e.lit+(p.cls.rank>0?.15:0)?{t:"你學識讀書寫字。",fx:{wis:12},lit:1}:{t:"屋企要你幫手，讀咗幾日就停。",fx:{hap:-2}}},{t:"留喺屋企幫手",run:()=>({t:"你幫屋企做嘢。",fx:{wea:2,hea:1}})}]},
{id:"army",age:[16,35],w:2,cond:(p,e)=>p.sex==="m"&&e.id!=="hk",t:"官府／軍隊徵兵。",
 c:[{t:"從軍",run:(p,R)=>R()<.08?{t:"你喺戰場上陣亡。",die:"戰死沙場"}:R()<.3?{t:"你立咗軍功。",fx:{fam:20,wea:10,hea:-10}}:{t:"捱過幾年兵役，帶住傷返鄉。",fx:{hea:-12,soc:5}}},{t:"設法避役",run:(p,R)=>R()<.6?{t:"你成功避過。",fx:{hap:-2}}:{t:"被捉返去受罰。",fx:{hea:-8,wea:-5}}}]},
{id:"trade",age:[18,50],w:2,cond:()=>true,t:"有人邀你夾份做買賣。",
 c:[{t:"落注經商",run:(p,R)=>R()<.35+p.soc/400+(p.cls.rank>=2?.1:0)?{t:"生意興隆！",fx:{wea:25,soc:5}}:{t:"血本無歸。",fx:{wea:-15,hap:-8}}},{t:"唔冒險",run:()=>({t:"你繼續做本行。",fx:{}})}]},
{id:"master",age:[10,18],w:2,cond:()=>true,t:"一位師傅肯收你做徒弟。",
 c:[{t:"拜師學藝",run:(p,R,e)=>({t:`你跟師傅學「${e.jobs[Math.floor(R()*e.jobs.length)]}」。`,fx:{wis:6,wea:5,soc:3}})},{t:"自己摸索",run:()=>({t:"你靠自己慢慢學。",fx:{wis:2}})}]},
{id:"marry",age:[15,30],w:4,cond:p=>!p.married,t:"媒人上門提親。",
 c:[{t:"答應婚事",run:(p,R)=>({t:R()<.6?"婚後生活和睦。":"婚姻平淡，各有心事。",fx:{hap:R()<.6?12:2,soc:6},married:1})},{t:"婉拒",run:()=>({t:"你決定再等等。",fx:{hap:-1}})}]},
{id:"child",age:[18,42],w:4,cond:p=>p.married,t:"家中添丁。",
 c:[{t:"好好照顧",run:(p,R,e)=>R()<e.mort.q0?{t:"孩子未滿週歲就夭折了。願安息。",fx:{hap:-15},kid:0}:{t:"孩子健康長大中。",fx:{hap:10,wea:-4},kid:1}}]},
{id:"flee",age:[5,70],w:0,cond:p=>p.danger,t:"戰亂逼近，你要點做？",
 c:[{t:"舉家逃難",run:(p,R)=>R()<.8?{t:"你哋逃到較安全嘅地方。",fx:{wea:-15,hea:-5},safe:1}:{t:"逃難途中遇上不測。",die:"死於逃難途中"}},{t:"留守家園",run:(p,R)=>R()<.75?{t:"你捱過咗。",fx:{hap:-8}}:{t:"兵禍波及你家。",die:"死於戰亂"}}]},
{id:"migrate",age:[18,45],w:1,cond:(p,e)=>["shanghai","hk","london","edo","song","mingqing"].includes(e.id),t:"有機會去海外搵生活。",
 c:[{t:"出洋",run:(p,R)=>R()<.5?{t:"你喺異鄉站穩陣腳。",fx:{wea:15,hap:5,soc:-5}}:{t:"異鄉生活艱難。",fx:{hap:-10,hea:-5}}},{t:"留低",run:()=>({t:"你留喺熟悉嘅地方。",fx:{soc:3}})}]},
{id:"sick",age:[1,90],w:3,cond:()=>true,t:"你染上重病。",
 c:[{t:"求醫",run:(p,R)=>R()<.55+p.hea/300+(p.wea>50?.1:0)?{t:"你康復了。",fx:{hea:-5,wea:-6}}:{t:"病情加重。",fx:{hea:-20}}},{t:"休養",run:(p,R)=>R()<.5+p.hea/250?{t:"慢慢好返。",fx:{hea:-8}}:{t:"拖咗好耐。",fx:{hea:-18,hap:-5}}}]}
];
