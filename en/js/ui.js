(function(){
const $=id=>document.getElementById(id),E=Engine,Q=new URLSearchParams(location.search),QA=Q.has("auto");
const ST=[["hea","Health","#e05c5c"],["hap","Joy","#ffcc4d"],["wis","Wisdom","#6ac7e0"],["soc","Network","#a07ae0"],["wea","Wealth rank","#d4af37"],["fam","Reputation","#7ad08a"]];
const store={get:()=>{try{return JSON.parse(localStorage.getItem("rebirth_en_lives")||"[]")}catch(e){return[]}},set:v=>{try{localStorage.setItem("rebirth_en_lives",JSON.stringify(v.slice(-50)))}catch(e){}}};
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const M=Meaning,LS=M.LS;const SET=Object.assign({reflect:true,contrast:true,gentle:false,sound:false,music:false},LS.get("rebirth_set",{}));
["reflect","contrast","gentle","sound","music"].forEach(k=>{const el=$("o-"+k);el.checked=SET[k];el.onchange=()=>{SET[k]=el.checked;LS.set("rebirth_set",SET);SFX.set(SET.sound,SET.music)}});
const G=t=>!SET.gentle?t:t.replace(/Died in infancy|Died of illness as a child/g,"Died young").replace(/died before turning five\. May they rest in peace\./g,"passed away before turning five.").replace(/Killed in battle|Killed in war/g,"Lost in the war").replace(/Died in a famine/g,"Lost in the famine").replace(/Died of plague/g,"Lost to the epidemic").replace(/buried alive|massacred|were killed|was killed/g,"lost their lives").replace(/a terrible massacre/g,"terrible loss of life").replace(/cannibalism/g,"extreme famine");
let NEXT={},reflecting=false;
let P=null,mult=+Q.get("speed")||2,timer=null,pending=null,autoDec=QA,cd=null,skipping=false;
const show=id=>{document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));$("ctrl").style.display=id==="s-life"?"flex":"none";scrollTo(0,0)};
const bar=(v,c)=>`<div class="bar"><i style="width:${v}%;--c:${c}"></i></div>`;
/* 主頁 */
World.build("hk",2020);
const yi=()=>+$("o-year").value,anc=()=>ANCHORS[yi()];
function yearUI(){const a=anc(),L=World.probs(a),tot=L.reduce((s,x)=>s+x.c.pop,0);$("year-lab").textContent=(a>=1800?World.ylab(a)+"s":"c. "+World.ylab(a));$("year-note").textContent=`World population then: about ${tot>=1000?(tot/1000).toFixed(1)+" billion":Math.round(tot)+" million"} (HYDE 3.x) · Most likely birthplaces: ${L.slice(0,3).map(x=>REGIONS[x.r].n+" "+pct(x.p)).join(", ")}`}
$("o-year").oninput=yearUI;$("b-randyear").onclick=()=>{$("o-year").value=Math.floor(Math.random()*ANCHORS.length);yearUI();SFX.click()};
if(Q.get("year")){const y=+Q.get("year");let bi=0;ANCHORS.forEach((a,i)=>{if(Math.abs(a-y)<Math.abs(ANCHORS[bi]-y))bi=i});$("o-year").value=bi}yearUI();
function home(){const L=store.get();$("n-past").textContent=L.length;const got=new Set(L.map(l=>l.reg||l.era)),ga=new Set(L.map(l=>l.anchor).filter(x=>x!=null));
 $("chips").innerHTML=Object.entries(REGIONS).map(([k,r])=>`<span class="${got.has(k)?"got":""}">${got.has(k)?"✓ ":"?"}${r.n}</span>`).join("")+`<p class="note">Regions born in: ${[...got].filter(k=>REGIONS[k]).length}/${Object.keys(REGIONS).length} · Eras: ${ga.size}/${ANCHORS.length}</p>`;
 $("past-list").innerHTML=L.slice().reverse().map(l=>`<div class="card"><small>${l.eraName} · ${l.place}</small>${l.name} (${l.cls}) died at ${l.age} · ${l.cause} · "${l.title}"</div>`).join("")||"No records yet";
 drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false});
 const dd=new Date(),dk=dd.getFullYear()*400+dd.getMonth()*31+dd.getDate(),da=ANCHORS[dk%ANCHORS.length],ks=Object.keys(CODEX),c=CODEX[ks[dk%ks.length]];$("daily").innerHTML=`<h2>Today's theme: ${World.ylab(da)}</h2><div class="codexnote"><b>📖 ${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div><button class="btn alt sm" id="b-daily">Be born in ${World.ylab(da)}</button>`;
 $("b-daily").onclick=()=>{NEXT={anchor:da};begin()}}
setInterval(()=>{if($("s-start").classList.contains("on"))drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false})},4000);
function codex(tab){show("s-codex");document.querySelectorAll("#cx-tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.t===tab);b.onclick=()=>codex(b.dataset.t)});const B=$("cx-body");
 if(tab==="cards"){const got=new Set(LS.get("rebirth_en_codex",[]));const keys=Object.keys(CODEX);B.innerHTML=`<p class="dim small">Collected: ${got.size}/${keys.length}. Unlock more by living through major historical events.</p><div class="cx">${keys.map(k=>{const e=ERAS.find(x=>x.id===k.split(":")[0]),en=e?e.name:"World history",c=CODEX[k];return got.has(k)?`<div data-k="${k}"><b>${c[0]}</b>${en}</div>`:`<div class="lock">???<br>${en}</div>`}).join("")}</div><div id="cx-read"></div>`;
  B.querySelectorAll(".cx div[data-k]").forEach(d=>d.onclick=()=>{const c=CODEX[d.dataset.k];$("cx-read").innerHTML=`<div class="codexnote" style="margin-top:10px"><b>📖 ${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div>`;SFX.card()})}
 if(tab==="ach"){const got=new Set(LS.get("rebirth_en_ach",[]));B.innerHTML=`<p class="dim small">${got.size}/${M.ACH.length}</p><div class="achl">${M.ACH.map(a=>`<div class="${got.has(a[0])?"":"no"}">${got.has(a[0])?"🏆":"🔒"} <span><b>${a[1]}</b><br><span class="dim">${a[2]}</span></span></div>`).join("")}</div>`}
 if(tab==="refl"){const L=LS.get("rebirth_en_reflect",[]).filter(r=>r.a).reverse();B.innerHTML=L.map(r=>`<blockquote>"${r.a.replace(/</g,"&lt;")}"<small>${r.era} · ${r.name} ${r.age} yrs — ${r.q}</small></blockquote>`).join("")||"<p class='dim'>No reflections written yet.</p>"}
 if(tab==="line"){const L=LS.get("rebirth_en_lineage",{});B.innerHTML=Object.values(L).filter(f=>f.length>1).reverse().map(f=>`<div class="tree">${f.map(g=>`<div style="--g:${g.gen-1}">Gen ${g.gen} · ${g.name} · ${g.era} · ${g.cls} · ${g.age} yrs · Wealth rank ${g.wea}</div>`).join("")}</div>`).join("<hr>")||"<p class='dim'>After finishing a life, choose \"Legacy\" to continue as your descendant.</p>"}}
$("b-codex").onclick=()=>codex("cards");$("b-cx-back").onclick=()=>{show("s-start");home()};
$("b-past").onclick=()=>{const p=$("past");p.style.display=p.style.display==="none"?"block":"none"};
/* 投胎抽籤 */
function spin(items,target,done){const box=$("draw");box.innerHTML=items.map(i=>`<div><span>${i[0]}</span><span>${i[1]}</span></div>`).join("");
 const rows=[...box.children],ti=items.findIndex(i=>i[2]===target),total=items.length*2+ti;let k=0;
 const tick=()=>{rows.forEach(r=>r.classList.remove("hi"));rows[k%rows.length].classList.add("hi");if(k>=total)return setTimeout(done,QA?0:600);k++;setTimeout(tick,QA?0:40+Math.pow(k/total,3)*260)};tick()}
function begin(){SFX.set(SET.sound,SET.music);SFX.click();const seed=NEXT.seed||+Q.get("seed")||Math.floor(Math.random()*1e9);const anchor=NEXT.anchor??anc();const era=World.eraFor(seed,anchor,NEXT.reg||Q.get("reg")||null);P=E.born(seed,era,NEXT.heir||null);P.anchor=anchor;P.whatif=NEXT.whatif||null;P.rDone={};P.rq=[];NEXT={};
 mult=+$("o-speed").value||mult;autoDec=QA||$("o-auto").checked;show("s-birth");$("reg").style.display="none";const e=P.era;
 const L=World.probs(P.anchor);let top=L.slice(0,9);if(!top.some(x=>x.r===e.reg))top=[...top.slice(0,8),L.find(x=>x.r===e.reg)];const oth=1-top.reduce((s,x)=>s+x.p,0);
 $("draw-h").textContent=`${World.ylab(P.anchor)}: Drawing a birthplace (weighted by estimated births that year)`;
 spin([...top.map(x=>[REGIONS[x.r].n,pct(x.p),x.r]),["Elsewhere",pct(oth),"_o"]],e.reg,()=>{
  $("draw-h").textContent=`${e.rname}: City or countryside? (HYDE urbanisation estimate)`;
  spin([["City",pct(e.urb),"u"],["Countryside",pct(1-e.urb),"r"]],P.urban?"u":"r",()=>{
   $("draw-h").textContent=`${e.rname}: Which family?`;spin(e.classes.map(c=>[c[0],pct(c[1]),c[0]]),P.cls.name,reg)})})}
function reg(){const e=P.era,C=CALIB[e.id],S=STATS[e.id];$("draw-h").textContent="You've been born";$("reg").style.display="block";drawScene($("cv-birth"),e,{px:29});
 const lines=[["Name",`<span class="big">${P.name}</span>`],["Born",`${E.yr(P.year)} · ${P.sex==="m"?"Male":"Female"}`],["Place",P.place+(P.urban?" (city)":"")],["Era",e.name],["Family",`${P.cls.name}; income percentile ${P.band[0]}–${P.band[1]} of the time (estimated from class shares)`],
  ["Father",`${P.father.age} yrs · ${P.father.job}`],["Mother",`${P.mother.age} yrs · ${P.cls.rank>=3?"Homemaker":"Homemaker and helper"}`],["Chance to learn to read",P.lit?"Yes":"None"],["Family wealth",E.fmtMoney(e,P.money)],
  ];const c=e.cell;if(c)lines.push(["Life expectancy at birth",`${c.le} yrs${World.tag(c.leS)}<span class="fn">📜 ${World.src("le",c.leS)}</span>`],["Chance of dying before 5",`${pct(c.u5)}${World.tag(c.u5S)}<span class="fn">📜 ${World.src("u5",c.u5S)}</span>`],["Literacy rate",`${pct(c.lit)}${World.tag(c.litS)}<span class="fn">📜 ${World.src("lit",c.litS)}</span>`],["GDP per person",`${c.gdp.toLocaleString()} int'l $ (2011)${World.tag(c.gdpS)}<span class="fn">📜 ${World.src("gdp",c.gdpS)}</span>`],["Fertility rate",`${c.tfr} births${World.tag(c.tfrS)}<span class="fn">📜 ${World.src("tfr",c.tfrS)}</span>`],["Urban population",`${pct(c.urb)}${World.tag(c.urbS)}<span class="fn">📜 ${World.src("urb",c.urbS)}</span>`],["Share of families like yours",`${P.cls.name} about ${pct(e.classes.find(x=>x[0]===P.cls.name)?.[1]||0)}<span class="fn">📜 ${e.clsSrc[0]} — ${e.clsSrc[1]}</span>`]);
 $("reg-card").innerHTML=`<h2>Birth Record</h2><div class="kv">${lines.map(l=>`<b>${l[0]}</b><span>${l[1]}</span>`).join("")}</div>
 <div class="ctx">Around ${World.ylab(P.anchor)}, out of every 100 newborns worldwide, about ${(World.probs(P.anchor).find(x=>x.r===e.reg).p*100).toFixed(1)} were born in ${e.rname}. Local population about ${e.pop>=1?Math.round(e.pop):e.pop} million${World.tag(e.cell?.popS||"hyde")} (${World.src("pop",e.cell?.popS||"hyde")}); births estimated as "population ÷ life expectancy" (stationary-population approximation).${e.pack?`<br>This place and era also has a detailed era pack: "${ERAS.find(x=>x.id===e.pack).name}".`:""}${S.unit?`<br>Currency: ${S.unit[0]} — ${S.unit[1]}`:""}</div>`;
 if(P.heir){const m=STATS._mobility;$("reg-card").insertAdjacentHTML("afterbegin",`<div class="statbox"><b>🌱 Legacy · Generation ${P.gen}</b>You are the descendant of the previous generation (wealth rank ${Math.round(P.heir.pct*100)}). Your birth partly carries on their status.<br>${m[0]}<i>— ${m[1]}</i></div>`)}
 if(QA)setTimeout(live,10)}
$("b-live").onclick=()=>live();$("b-go").onclick=begin;$("b-again").onclick=()=>{["seed","era","reg"].forEach(k=>Q.delete(k));NEXT={anchor:P.anchor};begin()};
/* 生活 */
function focusUI(){if(P.age<6){$("focus").innerHTML=`<p class="dim small" style="grid-column:1/-1">Family looks after you from 0 to 5. From age 6 you can choose.</p>`;return}
 $("focus").innerHTML=Object.entries(E.FOCUS).map(([k,v])=>`<button data-f="${k}" class="${P.focus===k?"on":""}">${v.n}<small>${v.h}</small></button>`).join("");
 $("focus").querySelectorAll("button").forEach(b=>b.onclick=()=>{P.focus=b.dataset.f;focusUI()})}
function moneyUI(){const e=P.era,b=P.lastBreak;$("money").innerHTML=`<div class="money"><span class="big">${E.fmtMoney(e,P.money)}</span> <span class="dim small">Wealthier than about ${P.wea}% of people then (estimate)</span></div>
 <div class="dim small">Family: ${P.cls.name} (income percentile ${P.band[0]}–${P.band[1]})</div>${b?`<div class="brk"><span>Income this year</span><span>+${E.fmtMoney(e,b.inc)}</span>${b.live?`<span>Living costs</span><span>−${E.fmtMoney(e,b.live)}</span>`:`<span>Living costs</span><span>Covered by family</span>`}${b.kids?`<span>Raising children</span><span>−${E.fmtMoney(e,b.kids)}</span>`:""}${b.vice?`<span>Hobbies / vices</span><span>−${E.fmtMoney(e,b.vice)}</span>`:""}</div>`:""}<p class="note" style="text-align:left">Amounts are game-converted estimates; ${(STATS[e.id].unit||["",""])[1]}</p>`}
function gridHTML(p){const avg=Math.round((p.era.le[0]+p.era.le[1])/2),n=Math.max(p.grid.length,avg+1);let h="";
 for(let i=0;i<n;i++){const g=p.grid[i],hp=p.hist[i];const st=g&&g==="n"?`style="background:hsl(260,${20+hp*.4}%,${15+hp*.45}%)"`:"";h+=`<i class="${g||""} ${i===avg?"out":""}" ${st}>${i%10===0?i:""}</i>`}return h}
function hud(){$("h-age").textContent=P.age;$("h-year").textContent=E.yr(P.year)+" · "+P.place;$("h-who").textContent=`${P.name} · ${P.era.name} · ${P.cls.name}${P.married?" · Married":""}${P.kidsAlive?" · Children "+P.kidsAlive:""}`;
 $("stats").innerHTML=ST.map(([k,n,c])=>`<div class="stat"><span>${n.slice(0,2)}</span>${bar(P[k],c)}<span>${P[k]}</span></div>`).join("");
 if(!skipping){drawScene($("cv-life"),P.era,{px:4+Math.min(50,P.age*.6),night:!!P.dead});moneyUI();$("l-grid").innerHTML=gridHTML(P)}}
function nowCard(c){if(!c||skipping&&false)return;const d=document.createElement("div");d.className="card now";d.innerHTML=M.cHTML(c);$("feed").prepend(d)}
function card(e){const d=document.createElement("div");d.className="card "+e.k;let extra="";
 if(e.codex){const c=CODEX[e.codex];const nu=M.unlock([e.codex]);if(c)extra+=`<div class="codexnote"><b>📖 History card${nu.length?" (new)":""}: ${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div>`;SFX.hist();
  const v=P.era.events.find((x,i)=>(x.ck||P.era.id+":"+i)===e.codex)||{};const key=v.famine?"hunger":v.war?"war":v.plague?"plague":null;
  if(key&&SET.contrast&&!P.contrast.some(x=>x.key===key)){const c2=M.contrast(P,key,{t:v.t,src:v.s||P.era.hsrc});P.contrast.push(c2);extra+=M.cHTML(c2)}}
 if(e.k==="death")SFX.death();
 d.innerHTML=`<small>${e.age} yrs · ${E.yr(e.year)}</small>${G(e.t)}${e.src?`<span class="fn">📜 ${e.src}</span>`:""}${extra}`;$("feed").prepend(d);
 if(/before turning five/.test(e.t)&&e.k==="death"&&P.age>0&&!P.dead)P.rq.push("kid")}
function live(){show("s-life");$("feed").innerHTML="";focusUI();hud();card({k:"life",t:`${P.name}In ${P.place}, born.`,age:0,year:P.year});if(SET.contrast){const c=M.contrast(P,"u5");P.contrast.push(c);nowCard(c)}setSpeed(QA?64:mult)}
function setSpeed(m){if(reflecting)return;if(m)mult=m;const run=m!==0;document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.classList.toggle("on",+b.dataset.s===(run?mult:0)));$("c-auto").classList.toggle("on",autoDec);clearInterval(timer);if(run&&!pending)timer=setInterval(tick,QA?5:1000/mult)}
document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
$("c-auto").onclick=()=>{autoDec=!autoDec;$("c-auto").classList.toggle("on",autoDec);if(pending&&autoDec)countdown()};
$("c-skip").onclick=()=>{if(pending||reflecting||!P||P.dead)return;clearInterval(timer);skipping=true;let n=0;while(!pending&&!P.dead&&n++<150)tick(true);skipping=false;hud();if(!pending&&!P.dead)setSpeed(mult)};
function tick(sync){if(!P||P.dead||pending||reflecting)return;const prevAge=P.age;const n=P.log.length;const {dec}=E.step(P);P.log.slice(n).forEach(card);hud();if(prevAge===5)focusUI();
 if(P.dead)return finish();
 if(dec){clearInterval(timer);pending=dec;SFX.decide();ask(dec)}else{if([5,15,30,50,70].includes(P.age)&&!P.rDone[P.age]){P.rDone[P.age]=1;P.rq.push(P.age)}E.advance(P);if(P.rq.length&&SET.reflect&&!sync)reflect(P.rq.shift());else if(!SET.reflect)P.rq=[]}}
function reflect(trig){const q=M.question(P,trig);if(!q)return;clearInterval(timer);reflecting=true;$("r-age").textContent=`${P.name} · ${P.age} yrs`;$("r-q").textContent=q;$("r-a").value="";$("rmodal").classList.add("on");
 const done=a=>{clearInterval(cd);$("rmodal").classList.remove("on");reflecting=false;M.saveReflection(P,q,a,typeof trig==="number"?trig:P.age);setSpeed(mult)};
 $("r-save").onclick=()=>done($("r-a").value.trim().slice(0,120));$("r-skip").onclick=()=>done("");
 if(autoDec){let n=QA?0:10;$("r-cd").textContent=`🤖 ${n}s until auto-skip`;clearInterval(cd);cd=setInterval(()=>{n--;$("r-cd").textContent=`🤖 ${n}s until auto-skip`;if(n<=0){if(QA)$("r-a").value=Q.has("ra")?"I'll treasure the people around me.":"";done($("r-a").value.trim())}},QA?1:1000)}else $("r-cd").textContent="Saved only on your device (localStorage)"}
function ask(d){const e=P.era;$("m-age").textContent=`${P.age} yrs · ${E.yr(P.year)} · ${E.fmtMoney(e,P.money)}`;$("m-t").textContent=typeof d.t==="function"?d.t(P,e):d.t;
 const s=d.key==="*evt"?null:STATS[e.id][d.key],src=d.key==="*evt"?P.log.slice().reverse().find(l=>l.k==="hist"):null;
 $("m-stat").innerHTML=s?`<b>📊 Era data (estimates)</b>${s[0]}<i>— ${s[1]}</i>`:src?`<b>📜 Historical background</b>${src.t}<i>— ${src.src}</i>`:`<b>📜 Historical background</b>${P.dangerEvt?.t||""}<i>— ${e.hsrc}</i>`;
 $("m-c").innerHTML="";d.c.forEach((c,i)=>{const g=E.gated(P,c),o=E.odds(P,c);const w=document.createElement("div");w.className="opt";
  w.innerHTML=`<button class="btn${i?" alt":""}" ${g?"disabled":""}>${o!=null?`<span class="odds">Chance of success: ${E.hint(o)}</span>`:""}${c.t}<small>${g?"🔒 "+c.gt:c.h||""}</small></button>`;
  w.firstChild.onclick=()=>answer(i);$("m-c").append(w)});$("modal").classList.add("on");$("m-cd").textContent="";if(autoDec)countdown()}
function countdown(){clearInterval(cd);if(Q.has("hold"))return;let n=QA?0:5;$("m-cd").textContent=n?`🤖 ${n}s until auto-choice`:"";cd=setInterval(()=>{n--;$("m-cd").textContent=`🤖 ${n}s until auto-choice`;if(n<=0){clearInterval(cd);if(pending)answer(E.autoPick(P,pending))}},QA?1:1000)}
function answer(i){clearInterval(cd);SFX.click();const d=pending;pending=null;$("modal").classList.remove("on");const r=E.choose(P,d,i);card(P.log[P.log.length-1]);hud();
 if(SET.contrast){const ck=d.id==="school"?"lit":d.id==="child"&&i===0&&!P.contrast.some(x=>x.key==="tfr")?"tfr":d.id==="appr"&&P.era.id==="london"?"hours":null;if(ck&&!P.contrast.some(x=>x.key===ck)){const c=M.contrast(P,ck);if(c){P.contrast.push(c);nowCard(c)}}}
 const tr={exam:"exam",migr:i===0?"migr":null,refugee:"moral",injustice:"moral",flee:"flee"}[d.id];if(tr&&!P.rDone[tr]){P.rDone[tr]=1;P.rq.push(tr)}
 if(P.dead)return finish();E.advance(P);if(P.rq.length&&SET.reflect)return reflect(P.rq.shift());setSpeed(mult)}
/* 終局 */
function finish(){clearInterval(timer);hud();const ok=P.cause==="old"||P.age>=60;
 show("s-final");$("f-age").textContent=`${P.age} yrs`;$("f-cause").textContent=`${E.yr(P.year)} · ${P.place} · ${P.dead}`;drawScene($("cv-final"),P.era,{px:29,night:1,dead:1});
 const moments=[{t:`${E.yr(P.birthYear)}, ${P.name}In ${P.place}, born.`,a:0},...P.log.filter(l=>l.key||l.k==="hist").slice(0,10).map(l=>({t:`${l.age}, age ${l.t}`,a:l.age})),{t:`${P.age}, age ${P.dead}.`,a:P.age,d:1}];
 let i=0;const rp=()=>{if(!$("s-final").classList.contains("on"))return;const m=moments[i%moments.length];drawScene($("cv-replay"),P.era,{px:4+Math.min(50,m.a*.6),night:m.d,dead:m.d});$("replay-t").textContent=m.t;i++;if(i<moments.length)setTimeout(rp,QA?5:1800)};rp();
 if(QA)setTimeout(ending,30)}
$("b-record").onclick=()=>ending();
function chart(cv,series,opt){const W=160,H=80,x=cv.getContext("2d");cv.width=W;cv.height=H;x.fillStyle="#120f1c";x.fillRect(0,0,W,H);x.fillStyle="#2a2340";for(let i=0;i<=4;i++)x.fillRect(0,Math.round(i*(H-1)/4),W,1);
 const maxX=opt.maxX,maxY=opt.maxY||1;series.forEach(s=>{x.fillStyle=s.c;s.d.forEach((v,i)=>{const px=Math.round(i/maxX*(W-1)),py=Math.round((1-v/maxY)*(H-4))+1;x.fillRect(px,py,2,2)})});
 if(opt.mark!=null){x.fillStyle="#ff4f7a";const px=Math.round(opt.mark/maxX*(W-1));x.fillRect(px,0,1,H);x.fillRect(px-2,opt.my-2,5,5)}}
function ending(){show("s-end");const e=P.era,C=CALIB[e.id],t=E.title(P),avg=(e.le[0]+e.le[1])/2;drawScene($("cv-end"),e,{px:29,night:1});
 const died=1-(C.l[P.age+1]??0),cs=C.causes[P.cause]||0,happy=P.hist.indexOf(Math.max(...P.hist));
 $("e-title").textContent=`"${t}" ${P.name}`;
 const rows=[["Era",`${e.name} · ${P.places.join(" → ")}`],["A life",`${E.yr(P.birthYear)} – ${E.yr(P.year)}`],["Family",P.cls.name],["Died at",`<span class="big">${P.age}</span>`],["Cause of death",P.dead],
  ["Peers",`Outlived about ${pct(Math.min(.999,died-(C.l[P.age]-C.l[P.age+1])/2))} of people born the same year (model estimate)`],["vs. average",`${P.age>=avg?"longer":"shorter"} by about ${Math.abs(Math.round(P.age-avg))} yrs (average about ${e.le[0]}–${e.le[1]})`],
  ["Same cause",`In this era, about ${pct(cs)} of people died of "${E.CAUSE[P.cause]}" (model estimate)`],["Education",P.flags.official?"Earn an official degree or title":P.lit?"literate":"Illiterate"],["Marriage",P.married?"Married":"Single"+(P.flags.monk?" (religious life)":"")],
  ["Children",P.kids?`${P.kids} (${P.kidsDead} died young)`:"None"],["Happiest year",P.hist.length?`${happy} yrs`:"—"],["Estate",E.fmtMoney(e,P.money)+` (wealthier than about ${P.wea}% of people)`]];
 $("e-sum").innerHTML=`<div class="kv">${rows.map(r=>`<b>${r[0]}</b><span>${r[1]}</span>`).join("")}</div>`+ST.map(([k,n,c])=>`<div class="stat"><span>${n.slice(0,2)}</span>${bar(P[k],c)}<span>${P[k]}</span></div>`).join("");
 $("e-grid").innerHTML=gridHTML(P);
 const S=[];for(let i=0;i<5;i++){const sd=P.seed+i*7919+1;S.push(E.quick(sd,World.eraFor(sd,P.anchor)))}
 const all=[...S,P].sort((a,b)=>b.age-a.age);$("e-souls").innerHTML="";
 all.forEach(s=>{const d=document.createElement("div");d.className="soulrow"+(s===P?" me":"");const c=document.createElement("canvas");drawScene(c,s.era,{px:28,dead:1});d.append(c);
  d.insertAdjacentHTML("beforeend",`<div><b>${s===P?"You: ":""}${s.name}</b><br><span class="dim">${s.era.rname||s.era.name} · ${s.place.replace(" (countryside)"," (countryside)")} · ${s.cls.name}</span></div><div style="text-align:right">${s.age}<br><span class="dim">${s.dead}</span></div>`);$("e-souls").append(d)});
 chart($("cv-surv"),[{c:"#6ac7e0",d:C.l.slice(0,101)},{c:"#3a5a3a",d:CALIB.w_hk_2020.l.slice(0,101)}],{maxX:100,mark:P.age,my:Math.round((1-(C.l[P.age]||0))*76)+1});
 $("surv-note").textContent=`Blue = share still alive among people born the same year in ${e.name}; dark green = Hong Kong in the 2020s; red line = your age at death. Model estimate, calibrated to ${e.leSrc}.`;
 const mx=Math.max(...P.moneyHist,1);chart($("cv-money"),[{c:"#d4af37",d:P.moneyHist}],{maxX:Math.max(10,P.moneyHist.length),maxY:mx});
 const imp=P.log.filter(l=>l.k!=="life");$("e-log").innerHTML=imp.map(l=>`<div class="card ${l.k}" style="margin:6px 0"><small>${l.age}</small>${l.t}${l.src?`<span class="fn">📜 ${l.src}</span>`:""}</div>`).join("")||"A quiet, ordinary life.";
 const L=store.get();L.push({era:e.id,reg:e.reg,anchor:P.anchor,eraName:e.name,place:P.place,name:P.name,cls:P.cls.name,age:P.age,cause:P.dead,title:t,ts:Date.now()});store.set(L);

 const cf=M.counterfactual(P);P.cf=cf;$("e-lesson").innerHTML=M.lesson(P,cf);
 const nowL=[M.contrast(P,"le"),M.contrast(P,"u5"),M.contrast(P,"lit"),...P.contrast.filter(c=>c&&!["le","u5","lit"].includes(c.key))].filter(Boolean);$("e-now").innerHTML=nowL.map(M.cHTML).join("");
 const fam=P.whatif?[{gen:P.gen||1,name:P.name,era:P.era.name,cls:P.cls.name,age:P.age,wea:P.wea}]:M.saveLineage(P);const na=World.nextAnchor(P.birthYear),nx=na!=null?[{id:na,name:`One generation later: ${World.ylab(na)} · ${e.rname}`}]:[];
 $("e-line").innerHTML=`<div class="tree">${fam.map(g=>`<div style="--g:${g.gen-1}">Gen ${g.gen} · ${g.name} · ${g.era} · ${g.cls} · ${g.age} · Wealth ${g.wea}</div>`).join("")}</div>`+
  (P.kidsAlive>0&&nx.length?`<div class="statbox"><b>📊 Mobility across generations (estimate)</b>${STATS._mobility[0]}<i>— ${STATS._mobility[1]}</i></div><p class="small">You have ${P.kidsAlive} living children. Continue as a descendant in:</p>${nx.map(x=>`<button class="btn alt sm" data-lin="${x.id}">🌱 ${x.name}</button>`).join("")}`:`<p class="dim small">${P.kidsAlive>0?"There is no later era to continue into.":"No children survived this life. The family line ends here."}</p>`);
 $("e-line").querySelectorAll("[data-lin]").forEach(b=>b.onclick=()=>{NEXT={anchor:+b.dataset.lin,reg:e.reg,heir:M.heirOf(P)};begin()});
 if(P.whatif){const w=P.whatif,row=(n,a,b)=>`<tr><td>${n}</td><td>${a}</td><td>${b}</td></tr>`;let div=w.choices.findIndex((c,i)=>!P.choices[i]||P.choices[i].id!==c.id||P.choices[i].i!==c.i);
  $("e-diff").style.display="block";$("e-diff").innerHTML=`<h2>🔁 What If… Compared</h2><div class="diff"><table><tr><td></td><td class="dim">Last time</td><td class="dim">This time</td></tr>${row("Died at",w.age+" yrs",P.age+" yrs")}${row("Ending",G(w.dead),G(P.dead))}${row("Wealth rank",w.wea,P.wea)}${row("Children",w.kids,P.kids)}${row("Title",w.title,t)}</table></div>
  <p class="small" style="margin-top:6px">${div<0?"Both runs made exactly the same choices: the difference is pure luck.":`The two paths split at the choice made at age ${w.choices[div]?.age??"?"}. Birth, era and everything before the split were identical; what came after is the result of choices and luck.`}</p>`}else $("e-diff").style.display="none";
 const nu=M.checkAch(P,{whatif:!!P.whatif});const got=new Set(LS.get("rebirth_en_ach",[]));$("e-ach").innerHTML=`<div class="achl">${M.ACH.filter(a=>got.has(a[0])).map(a=>`<div>🏆 <span class="${nu.includes(a[0])?"new":""}">${a[1]}${nu.includes(a[0])?" (new)":""}</span></div>`).join("")}</div><p class="note">${got.size}/${M.ACH.length}</p>`;
 $("b-whatif").onclick=()=>{NEXT={seed:P.seed,anchor:P.anchor,reg:e.reg,heir:P.heir,whatif:{age:P.age,dead:P.dead,wea:P.wea,kids:P.kids,title:t,choices:P.choices}};begin()};
 shareCard(t,all);window.__done=true}
function shareCard(t,all){const c=document.createElement("canvas"),W=360,H=560,x=c.getContext("2d");c.width=W;c.height=H;x.imageSmoothingEnabled=false;
 x.fillStyle="#1a1626";x.fillRect(0,0,W,H);const sc=document.createElement("canvas");drawScene(sc,P.era,{px:29,night:1});x.drawImage(sc,20,20,320,200);
 x.fillStyle="#0b0912";[[16,16,328,4],[16,220,328,4],[16,16,4,208],[340,16,4,208]].forEach(r=>x.fillRect(...r));
 x.fillStyle="#ffcc4d";x.font="24px 'Pixelify Sans',Cubic";x.fillText("Rebirth Roulette",20,256);x.font="11px 'Pixelify Sans',Cubic";x.fillStyle="#a99fc0";void 0;
 x.fillStyle="#f3ead2";x.font="20px 'Pixelify Sans',Cubic";x.fillText(`"${t}" ${P.name}`,20,290);x.font="15px 'Pixelify Sans',Cubic";
 [`${P.era.name} · ${P.place}`,`${E.yr(P.birthYear)} – ${E.yr(P.year)} · ${P.cls.name}`,`Died at ${P.age} yrs · ${P.dead}`].forEach((s,i)=>x.fillText(s,20,318+i*22));
 ST.forEach(([k,n,col],i)=>{const y=392+Math.floor(i/2)*22,X=20+(i%2)*170;x.fillStyle="#a99fc0";x.font="13px 'Pixelify Sans',Cubic";x.fillText((n==="Reputation"?"Rep.":n.slice(0,7)),X,y);x.fillStyle="#120f1c";x.fillRect(X+58,y-10,100,9);x.fillStyle=col;for(let j=0;j<P[k];j+=8)x.fillRect(X+58+j,y-10,6,9)});
 x.fillStyle="#a99fc0";x.fillText("Born at the same moment: ",20,462);all.filter(s=>s!==P).slice(0,4).forEach((s,i)=>x.fillText(`${(s.era.rname||s.era.name).replace(/^The /,"").slice(0,15)} ${s.age} yrs`,20+(i%2)*170,480+Math.floor(i/2)*16));
 if(P.cf){const f=Math.abs(P.cf.sbWea-P.cf.eraWea),c=Math.abs(P.wea-P.cf.sbWea),fs=Math.round(100*f/Math.max(1,f+c));x.fillStyle="#a3322b";x.fillRect(20,516,fs*3.2,8);x.fillStyle="#2f5f7a";x.fillRect(20+fs*3.2,516,320-fs*3.2,8);x.fillStyle="#f3ead2";x.font="12px 'Pixelify Sans',Cubic";x.fillText(`Birth ${fs}% | Choices + luck ${100-fs}%${P.gen>1?` | Gen ${P.gen}`:""}`,20,510)}
 x.font="13px 'Pixelify Sans',Cubic";x.fillStyle="#ffcc4d";x.fillText(`dancingturtle14.github.io/rebirth-sim/en/?seed=${P.seed}`,20,546);
 const url=c.toDataURL("image/png");$("e-card").src=url;$("b-dl").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=`rebirth-${P.name}.png`;a.click()}}
document.fonts&&document.fonts.load("16px 'Pixelify Sans',Cubic");home();if(QA||Q.has("seed"))begin();
})();
