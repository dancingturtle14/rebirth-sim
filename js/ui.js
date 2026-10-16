(function(){
const $=id=>document.getElementById(id),E=Engine,Q=new URLSearchParams(location.search),QA=Q.has("auto");
const ST=[["hea","健康","#e05c5c"],["hap","快樂","#ffcc4d"],["wis","智慧","#6ac7e0"],["soc","人脈","#a07ae0"],["wea","財富排名","#d4af37"],["fam","聲望","#7ad08a"]];
const store={get:()=>{try{return JSON.parse(localStorage.getItem("rebirth_lives")||"[]")}catch(e){return[]}},set:v=>localStorage.setItem("rebirth_lives",JSON.stringify(v.slice(-50)))};
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
const M=Meaning,LS=M.LS;const SET=Object.assign({reflect:true,contrast:true,gentle:false,sound:false,music:false},LS.get("rebirth_set",{}));
["reflect","contrast","gentle","sound","music"].forEach(k=>{const el=$("o-"+k);el.checked=SET[k];el.onchange=()=>{SET[k]=el.checked;LS.set("rebirth_set",SET);SFX.set(SET.sound,SET.music)}});
const G=t=>!SET.gentle?t:t.replace(/夭折於襁褓|幼年病逝/g,"幼年離世").replace(/夭折了。願安息。/g,"離開咗。").replace(/戰死沙場|死於戰亂/g,"喺戰亂中離開").replace(/死於饑荒/g,"喺饑荒中離開").replace(/死於瘟疫/g,"因疫病離開").replace(/坑殺|屠殺|遇害|被殺/g,"喪生").replace(/人相食/g,"極度饑荒");
let NEXT={},reflecting=false;
let P=null,mult=+Q.get("speed")||2,timer=null,pending=null,autoDec=QA,cd=null,skipping=false;
const show=id=>{document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));$("ctrl").style.display=id==="s-life"?"flex":"none";scrollTo(0,0)};
const bar=(v,c)=>`<div class="bar"><i style="width:${v}%;--c:${c}"></i></div>`;
/* 主頁 */
ERAS.forEach(e=>$("o-era").insertAdjacentHTML("beforeend",`<option value="${e.id}">${e.name}（${pct(E.eraProb(e))}）</option>`));
function home(){const L=store.get();$("n-past").textContent=L.length;const got=new Set(L.map(l=>l.era));
 $("chips").innerHTML=ERAS.map(e=>`<span class="${got.has(e.id)?"got":""}">${got.has(e.id)?"✓ ":"？"}${e.name}</span>`).join("")+`<p class="note">已解鎖 ${got.size}/${ERAS.length}</p>`;
 $("past-list").innerHTML=L.slice().reverse().map(l=>`<div class="card"><small>${l.eraName} · ${l.place}</small>${l.name}（${l.cls}）享年 ${l.age} · ${l.cause} · 「${l.title}」</div>`).join("")||"未有紀錄";
 drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false});
 const d=M.daily(),c=CODEX[d.card];$("daily").innerHTML=`<h2>今日主題：${d.era.name}</h2><div class="codexnote"><b>📖 ${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div><button class="btn alt sm" id="b-daily">投胎去${d.era.name}</button>`;
 $("b-daily").onclick=()=>{NEXT={era:d.era.id};begin()}}
setInterval(()=>{if($("s-start").classList.contains("on"))drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false})},4000);
function codex(tab){show("s-codex");document.querySelectorAll("#cx-tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.t===tab);b.onclick=()=>codex(b.dataset.t)});const B=$("cx-body");
 if(tab==="cards"){const got=new Set(LS.get("rebirth_codex",[]));const keys=Object.keys(CODEX);B.innerHTML=`<p class="dim small">已收集 ${got.size}/${keys.length} 張。喺人生入面遇上歷史大事就會解鎖。</p><div class="cx">${keys.map(k=>{const e=ERAS.find(x=>x.id===k.split(":")[0]),c=CODEX[k];return got.has(k)?`<div data-k="${k}"><b>${c[0]}</b>${e.name}</div>`:`<div class="lock">？？？<br>${e.name}</div>`}).join("")}</div><div id="cx-read"></div>`;
  B.querySelectorAll(".cx div[data-k]").forEach(d=>d.onclick=()=>{const c=CODEX[d.dataset.k];$("cx-read").innerHTML=`<div class="codexnote" style="margin-top:10px"><b>📖 ${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div>`;SFX.card()})}
 if(tab==="ach"){const got=new Set(LS.get("rebirth_ach",[]));B.innerHTML=`<p class="dim small">${got.size}/${M.ACH.length}</p><div class="achl">${M.ACH.map(a=>`<div class="${got.has(a[0])?"":"no"}">${got.has(a[0])?"🏆":"🔒"} <span><b>${a[1]}</b><br><span class="dim">${a[2]}</span></span></div>`).join("")}</div>`}
 if(tab==="refl"){const L=LS.get("rebirth_reflect",[]).filter(r=>r.a).reverse();B.innerHTML=L.map(r=>`<blockquote>「${r.a.replace(/</g,"&lt;")}」<small>${r.era} · ${r.name} ${r.age} 歲 —— ${r.q}</small></blockquote>`).join("")||"<p class='dim'>仲未寫低任何沉澱。</p>"}
 if(tab==="line"){const L=LS.get("rebirth_lineage",{});B.innerHTML=Object.values(L).filter(f=>f.length>1).reverse().map(f=>`<div class="tree">${f.map(g=>`<div style="--g:${g.gen-1}">第${g.gen}代 · ${g.name} · ${g.era} · ${g.cls} · ${g.age} 歲 · 財富排名 ${g.wea}</div>`).join("")}</div>`).join("<hr>")||"<p class='dim'>完成一世之後，揀「傳承」就可以以子孫身份延續。</p>"}}
$("b-codex").onclick=()=>codex("cards");$("b-cx-back").onclick=()=>{show("s-start");home()};
$("b-past").onclick=()=>{const p=$("past");p.style.display=p.style.display==="none"?"block":"none"};
/* 投胎抽籤 */
function spin(items,target,done){const box=$("draw");box.innerHTML=items.map(i=>`<div><span>${i[0]}</span><span>${i[1]}</span></div>`).join("");
 const rows=[...box.children],ti=items.findIndex(i=>i[2]===target),total=items.length*2+ti;let k=0;
 const tick=()=>{rows.forEach(r=>r.classList.remove("hi"));rows[k%rows.length].classList.add("hi");if(k>=total)return setTimeout(done,QA?0:600);k++;setTimeout(tick,QA?0:40+Math.pow(k/total,3)*260)};tick()}
function begin(){SFX.set(SET.sound,SET.music);SFX.click();const seed=NEXT.seed||+Q.get("seed")||Math.floor(Math.random()*1e9);P=E.born(seed,NEXT.era||Q.get("era")||$("o-era").value||null,NEXT.heir||null);P.whatif=NEXT.whatif||null;P.rDone={};P.rq=[];NEXT={};
 mult=+$("o-speed").value||mult;autoDec=QA||$("o-auto").checked;show("s-birth");$("reg").style.display="none";const e=P.era;
 $("draw-h").textContent="抽時代……（機率按當時人口估算加權）";
 spin(ERAS.map(x=>[x.name,pct(E.eraProb(x)),x]),e,()=>{
  $("draw-h").textContent=`抽地點……（${e.name}）`;const cityP=e.urb/e.place.length,rurP=(1-e.urb)/e.place.length;
  const items=e.place.flatMap(pl=>[[pl+"（城）",pct(cityP),pl],[pl+"附近鄉村",pct(rurP),pl+"附近鄉村"]]).filter(i=>parseFloat(i[1])>0);
  spin(items,P.place,reg)})}
function reg(){const e=P.era,C=CALIB[e.id],S=STATS[e.id];$("draw-h").textContent="投胎完成";$("reg").style.display="block";drawScene($("cv-birth"),e,{px:29});
 const lines=[["名字",`<span class="big">${P.name}</span>`],["出生",`${E.yr(P.year)} · ${P.sex==="m"?"男":"女"}`],["地點",`${P.place}（${P.urban?"城市":"鄉村"}）`],["時代",e.name],["出身",`${P.cls.name}；收入大約喺當時第 ${P.band[0]}–${P.band[1]} 百分位（按階級比例估算）`],
  ["父親",`${P.father.age} 歲 · ${P.father.job}`],["母親",`${P.mother.age} 歲 · ${P.cls.rank>=3?"持家":"持家兼幫手"}`],["識字機會",P.lit?"有":"冇"],["家產",E.fmtMoney(e,P.money)],
  ["預期壽命",`約 ${e.le[0]}–${e.le[1]} 歲（估算）`],["五歲前夭折機會",`約 ${pct(C.u5)}（模型估算）`]];
 $("reg-card").innerHTML=`<h2>出生登記</h2><div class="kv">${lines.map(l=>`<b>${l[0]}</b><span>${l[1]}</span>`).join("")}</div>
 <div class="ctx">喺13個時代之中抽中「${e.name}」嘅機率約 ${pct(E.eraProb(e))}：當時該地區人口估計約 ${e.pop} 百萬（McEvedy & Jones 估算，權重＝人口^0.6）。城市人口比例約 ${pct(e.urb)}（Bairoch 1988 等估算）。<br>壽命來源：${e.leSrc}。${S.unit?`<br>貨幣：${S.unit[0]} — ${S.unit[1]}`:""}</div>`;
 if(P.heir){const m=STATS._mobility;$("reg-card").insertAdjacentHTML("afterbegin",`<div class="statbox"><b>🌱 傳承 · 第 ${P.gen} 代</b>你係上一代（財富排名 ${Math.round(P.heir.pct*100)}）嘅後人。出身會部分延續上一代嘅地位。<br>${m[0]}<i>— ${m[1]}</i></div>`)}
 if(QA)setTimeout(live,10)}
$("b-live").onclick=()=>live();$("b-go").onclick=begin;$("b-again").onclick=()=>{["seed","era"].forEach(k=>Q.delete(k));NEXT={};begin()};
/* 生活 */
function focusUI(){if(P.age<6){$("focus").innerHTML=`<p class="dim small" style="grid-column:1/-1">0–5 歲由家人照顧，6 歲起可以揀。</p>`;return}
 $("focus").innerHTML=Object.entries(E.FOCUS).map(([k,v])=>`<button data-f="${k}" class="${P.focus===k?"on":""}">${v.n}<small>${v.h}</small></button>`).join("");
 $("focus").querySelectorAll("button").forEach(b=>b.onclick=()=>{P.focus=b.dataset.f;focusUI()})}
function moneyUI(){const e=P.era,b=P.lastBreak;$("money").innerHTML=`<div class="money"><span class="big">${E.fmtMoney(e,P.money)}</span> <span class="dim small">財富約勝過當時 ${P.wea}% 人（估算）</span></div>
 <div class="dim small">出身：${P.cls.name}（收入第 ${P.band[0]}–${P.band[1]} 百分位）</div>${b?`<div class="brk"><span>今年收入</span><span>+${E.fmtMoney(e,b.inc)}</span>${b.live?`<span>生活開支</span><span>−${E.fmtMoney(e,b.live)}</span>`:`<span>生活開支</span><span>由家人負擔</span>`}${b.kids?`<span>養育子女</span><span>−${E.fmtMoney(e,b.kids)}</span>`:""}${b.vice?`<span>嗜好／癮</span><span>−${E.fmtMoney(e,b.vice)}</span>`:""}</div>`:""}<p class="note" style="text-align:left">金額為遊戲換算估算；${(STATS[e.id].unit||["",""])[1]}</p>`}
function gridHTML(p){const avg=Math.round((p.era.le[0]+p.era.le[1])/2),n=Math.max(p.grid.length,avg+1);let h="";
 for(let i=0;i<n;i++){const g=p.grid[i],hp=p.hist[i];const st=g&&g==="n"?`style="background:hsl(260,${20+hp*.4}%,${15+hp*.45}%)"`:"";h+=`<i class="${g||""} ${i===avg?"out":""}" ${st}>${i%10===0?i:""}</i>`}return h}
function hud(){$("h-age").textContent=P.age;$("h-year").textContent=E.yr(P.year)+" · "+P.place;$("h-who").textContent=`${P.name} · ${P.era.name} · ${P.cls.name}${P.married?" · 已婚":""}${P.kidsAlive?" · 子女"+P.kidsAlive:""}`;
 $("stats").innerHTML=ST.map(([k,n,c])=>`<div class="stat"><span>${n.slice(0,2)}</span>${bar(P[k],c)}<span>${P[k]}</span></div>`).join("");
 if(!skipping){drawScene($("cv-life"),P.era,{px:4+Math.min(50,P.age*.6),night:!!P.dead});moneyUI();$("l-grid").innerHTML=gridHTML(P)}}
function nowCard(c){if(!c||skipping&&false)return;const d=document.createElement("div");d.className="card now";d.innerHTML=M.cHTML(c);$("feed").prepend(d)}
function card(e){const d=document.createElement("div");d.className="card "+e.k;let extra="";
 if(e.codex){const c=CODEX[e.codex];const nu=M.unlock([e.codex]);if(c)extra+=`<div class="codexnote"><b>📖 史料卡${nu.length?"（新解鎖）":""}：${c[0]}</b>${G(c[1])}<span class="fn">📜 ${c[2]}</span></div>`;SFX.hist();
  const [id,vi]=e.codex.split(":"),v=ERAS.find(x=>x.id===id).events[+vi];const key=v.famine?"hunger":v.war?"war":v.plague?"plague":null;
  if(key&&SET.contrast&&!P.contrast.some(x=>x.key===key)){const c2=M.contrast(P,key,{t:v.t,src:v.s||P.era.hsrc});P.contrast.push(c2);extra+=M.cHTML(c2)}}
 if(e.k==="death")SFX.death();
 d.innerHTML=`<small>${e.age} 歲 · ${E.yr(e.year)}</small>${G(e.t)}${e.src?`<span class="fn">📜 ${e.src}</span>`:""}${extra}`;$("feed").prepend(d);
 if(/夭折/.test(e.t)&&e.k==="death"&&P.age>0&&!P.dead)P.rq.push("kid")}
function live(){show("s-life");$("feed").innerHTML="";focusUI();hud();card({k:"life",t:`${P.name}喺${P.place}出世。`,age:0,year:P.year});if(SET.contrast){const c=M.contrast(P,"u5");P.contrast.push(c);nowCard(c)}setSpeed(QA?64:mult)}
function setSpeed(m){if(reflecting)return;if(m)mult=m;const run=m!==0;document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.classList.toggle("on",+b.dataset.s===(run?mult:0)));$("c-auto").classList.toggle("on",autoDec);clearInterval(timer);if(run&&!pending)timer=setInterval(tick,QA?5:1000/mult)}
document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
$("c-auto").onclick=()=>{autoDec=!autoDec;$("c-auto").classList.toggle("on",autoDec);if(pending&&autoDec)countdown()};
$("c-skip").onclick=()=>{if(pending||reflecting||!P||P.dead)return;clearInterval(timer);skipping=true;let n=0;while(!pending&&!P.dead&&n++<150)tick(true);skipping=false;hud();if(!pending&&!P.dead)setSpeed(mult)};
function tick(sync){if(!P||P.dead||pending||reflecting)return;const prevAge=P.age;const n=P.log.length;const {dec}=E.step(P);P.log.slice(n).forEach(card);hud();if(prevAge===5)focusUI();
 if(P.dead)return finish();
 if(dec){clearInterval(timer);pending=dec;SFX.decide();ask(dec)}else{if([5,15,30,50,70].includes(P.age)&&!P.rDone[P.age]){P.rDone[P.age]=1;P.rq.push(P.age)}E.advance(P);if(P.rq.length&&SET.reflect&&!sync)reflect(P.rq.shift());else if(!SET.reflect)P.rq=[]}}
function reflect(trig){const q=M.question(P,trig);if(!q)return;clearInterval(timer);reflecting=true;$("r-age").textContent=`${P.name} · ${P.age} 歲`;$("r-q").textContent=q;$("r-a").value="";$("rmodal").classList.add("on");
 const done=a=>{clearInterval(cd);$("rmodal").classList.remove("on");reflecting=false;M.saveReflection(P,q,a,typeof trig==="number"?trig:P.age);setSpeed(mult)};
 $("r-save").onclick=()=>done($("r-a").value.trim().slice(0,120));$("r-skip").onclick=()=>done("");
 if(autoDec){let n=QA?0:10;$("r-cd").textContent=`🤖 ${n} 秒後自動略過`;clearInterval(cd);cd=setInterval(()=>{n--;$("r-cd").textContent=`🤖 ${n} 秒後自動略過`;if(n<=0){if(QA)$("r-a").value=Q.has("ra")?"我會珍惜身邊人。":"";done($("r-a").value.trim())}},QA?1:1000)}else $("r-cd").textContent="只會儲存喺你部機（localStorage）"}
function ask(d){const e=P.era;$("m-age").textContent=`${P.age} 歲 · ${E.yr(P.year)} · ${E.fmtMoney(e,P.money)}`;$("m-t").textContent=typeof d.t==="function"?d.t(P,e):d.t;
 const s=d.key==="*evt"?null:STATS[e.id][d.key],src=d.key==="*evt"?P.log.slice().reverse().find(l=>l.k==="hist"):null;
 $("m-stat").innerHTML=s?`<b>📊 時代數據（估算）</b>${s[0]}<i>— ${s[1]}</i>`:src?`<b>📜 歷史背景</b>${src.t}<i>— ${src.src}</i>`:`<b>📜 歷史背景</b>${P.dangerEvt?.t||""}<i>— ${e.hsrc}</i>`;
 $("m-c").innerHTML="";d.c.forEach((c,i)=>{const g=E.gated(P,c),o=E.odds(P,c);const w=document.createElement("div");w.className="opt";
  w.innerHTML=`<button class="btn${i?" alt":""}" ${g?"disabled":""}>${o!=null?`<span class="odds">成功機會：${E.hint(o)}</span>`:""}${c.t}<small>${g?"🔒 "+c.gt:c.h||""}</small></button>`;
  w.firstChild.onclick=()=>answer(i);$("m-c").append(w)});$("modal").classList.add("on");$("m-cd").textContent="";if(autoDec)countdown()}
function countdown(){clearInterval(cd);if(Q.has("hold"))return;let n=QA?0:5;$("m-cd").textContent=n?`🤖 ${n} 秒後自動代揀`:"";cd=setInterval(()=>{n--;$("m-cd").textContent=`🤖 ${n} 秒後自動代揀`;if(n<=0){clearInterval(cd);if(pending)answer(E.autoPick(P,pending))}},QA?1:1000)}
function answer(i){clearInterval(cd);SFX.click();const d=pending;pending=null;$("modal").classList.remove("on");const r=E.choose(P,d,i);card(P.log[P.log.length-1]);hud();
 if(SET.contrast){const ck=d.id==="school"?"lit":d.id==="child"&&i===0&&!P.contrast.some(x=>x.key==="tfr")?"tfr":d.id==="appr"&&P.era.id==="london"?"hours":null;if(ck&&!P.contrast.some(x=>x.key===ck)){const c=M.contrast(P,ck);if(c){P.contrast.push(c);nowCard(c)}}}
 const tr={exam:"exam",migr:i===0?"migr":null,refugee:"moral",injustice:"moral",flee:"flee"}[d.id];if(tr&&!P.rDone[tr]){P.rDone[tr]=1;P.rq.push(tr)}
 if(P.dead)return finish();E.advance(P);if(P.rq.length&&SET.reflect)return reflect(P.rq.shift());setSpeed(mult)}
/* 終局 */
function finish(){clearInterval(timer);hud();const ok=P.cause==="old"||P.age>=60;
 show("s-final");$("f-age").textContent=`${P.age} 歲`;$("f-cause").textContent=`${E.yr(P.year)} · ${P.place} · ${P.dead}`;drawScene($("cv-final"),P.era,{px:29,night:1,dead:1});
 const moments=[{t:`${E.yr(P.birthYear)}，${P.name}喺${P.place}出世。`,a:0},...P.log.filter(l=>l.key||l.k==="hist").slice(0,10).map(l=>({t:`${l.age} 歲：${l.t}`,a:l.age})),{t:`${P.age} 歲：${P.dead}。`,a:P.age,d:1}];
 let i=0;const rp=()=>{if(!$("s-final").classList.contains("on"))return;const m=moments[i%moments.length];drawScene($("cv-replay"),P.era,{px:4+Math.min(50,m.a*.6),night:m.d,dead:m.d});$("replay-t").textContent=m.t;i++;if(i<moments.length)setTimeout(rp,QA?5:1800)};rp();
 if(QA)setTimeout(ending,30)}
$("b-record").onclick=()=>ending();
function chart(cv,series,opt){const W=160,H=80,x=cv.getContext("2d");cv.width=W;cv.height=H;x.fillStyle="#120f1c";x.fillRect(0,0,W,H);x.fillStyle="#2a2340";for(let i=0;i<=4;i++)x.fillRect(0,Math.round(i*(H-1)/4),W,1);
 const maxX=opt.maxX,maxY=opt.maxY||1;series.forEach(s=>{x.fillStyle=s.c;s.d.forEach((v,i)=>{const px=Math.round(i/maxX*(W-1)),py=Math.round((1-v/maxY)*(H-4))+1;x.fillRect(px,py,2,2)})});
 if(opt.mark!=null){x.fillStyle="#ff4f7a";const px=Math.round(opt.mark/maxX*(W-1));x.fillRect(px,0,1,H);x.fillRect(px-2,opt.my-2,5,5)}}
function ending(){show("s-end");const e=P.era,C=CALIB[e.id],t=E.title(P),avg=(e.le[0]+e.le[1])/2;drawScene($("cv-end"),e,{px:29,night:1});
 const died=1-(C.l[P.age+1]??0),cs=C.causes[P.cause]||0,happy=P.hist.indexOf(Math.max(...P.hist));
 $("e-title").textContent=`「${t}」${P.name}`;
 const rows=[["時代",`${e.name} · ${P.places.join(" → ")}`],["一生",`${E.yr(P.birthYear)} – ${E.yr(P.year)}`],["出身",P.cls.name],["享年",`<span class="big">${P.age} 歲</span>`],["死因",P.dead],
  ["同輩比較",`比同時代約 ${pct(Math.min(.999,died-(C.l[P.age]-C.l[P.age+1])/2))} 嘅同年出生者長命（模型估算）`],["對比平均",`${P.age>=avg?"多":"少"}咗約 ${Math.abs(Math.round(P.age-avg))} 年（平均約 ${e.le[0]}–${e.le[1]} 歲）`],
  ["同類死因",`喺呢個時代約 ${pct(cs)} 嘅人死於「${E.CAUSE[P.cause]}」（模型估算）`],["教育",P.flags.official?"考取功名／學位":P.lit?"識字":"不識字"],["婚姻",P.married?"已婚":"未婚"+(P.flags.monk?"（出家）":"")],
  ["子女",P.kids?`${P.kids} 個（${P.kidsDead} 個夭折）`:"冇"],["最快樂嗰年",P.hist.length?`${happy} 歲`:"—"],["遺產",E.fmtMoney(e,P.money)+`（約勝過 ${P.wea}% 人）`]];
 $("e-sum").innerHTML=`<div class="kv">${rows.map(r=>`<b>${r[0]}</b><span>${r[1]}</span>`).join("")}</div>`+ST.map(([k,n,c])=>`<div class="stat"><span>${n.slice(0,2)}</span>${bar(P[k],c)}<span>${P[k]}</span></div>`).join("");
 $("e-grid").innerHTML=gridHTML(P);
 const others=ERAS.filter(x=>x.id!==e.id);const S=[];for(let i=0;i<5;i++){const er=others[Math.floor(E.rng(P.seed+i*97)()*others.length)];S.push(E.quick(P.seed+i+1,er.id))}
 const all=[...S,P].sort((a,b)=>b.age-a.age);$("e-souls").innerHTML="";
 all.forEach(s=>{const d=document.createElement("div");d.className="soulrow"+(s===P?" me":"");const c=document.createElement("canvas");drawScene(c,s.era,{px:28,dead:1});d.append(c);
  d.insertAdjacentHTML("beforeend",`<div><b>${s===P?"你：":""}${s.name}</b><br><span class="dim">${s.era.name} · ${s.cls.name}</span></div><div style="text-align:right">${s.age} 歲<br><span class="dim">${s.dead}</span></div>`);$("e-souls").append(d)});
 chart($("cv-surv"),[{c:"#6ac7e0",d:C.l.slice(0,101)},{c:"#3a5a3a",d:CALIB.hk.l.slice(0,101)}],{maxX:100,mark:P.age,my:Math.round((1-(C.l[P.age]||0))*76)+1});
 $("surv-note").textContent=`藍＝${e.name}同年出生者存活比例；暗綠＝現代香港對照；紅線＝你離世年齡。模型估算，按 ${e.leSrc} 校準。`;
 const mx=Math.max(...P.moneyHist,1);chart($("cv-money"),[{c:"#d4af37",d:P.moneyHist}],{maxX:Math.max(10,P.moneyHist.length),maxY:mx});
 const imp=P.log.filter(l=>l.k!=="life");$("e-log").innerHTML=imp.map(l=>`<div class="card ${l.k}" style="margin:6px 0"><small>${l.age} 歲</small>${l.t}${l.src?`<span class="fn">📜 ${l.src}</span>`:""}</div>`).join("")||"平平淡淡。";
 const L=store.get();L.push({era:e.id,eraName:e.name,place:P.place,name:P.name,cls:P.cls.name,age:P.age,cause:P.dead,title:t,ts:Date.now()});store.set(L);

 const cf=M.counterfactual(P);P.cf=cf;$("e-lesson").innerHTML=M.lesson(P,cf);
 const nowL=[M.contrast(P,"le"),M.contrast(P,"u5"),M.contrast(P,"lit"),...P.contrast.filter(c=>c&&!["le","u5","lit"].includes(c.key))].filter(Boolean);$("e-now").innerHTML=nowL.map(M.cHTML).join("");
 const fam=P.whatif?[{gen:P.gen||1,name:P.name,era:P.era.name,cls:P.cls.name,age:P.age,wea:P.wea}]:M.saveLineage(P);const nx=M.nextEras(P);
 $("e-line").innerHTML=`<div class="tree">${fam.map(g=>`<div style="--g:${g.gen-1}">第${g.gen}代 · ${g.name} · ${g.era} · ${g.cls} · ${g.age} 歲 · 財富 ${g.wea}</div>`).join("")}</div>`+
  (P.kidsAlive>0&&nx.length?`<div class="statbox"><b>📊 跨代流動（估算）</b>${STATS._mobility[0]}<i>— ${STATS._mobility[1]}</i></div><p class="small">你有 ${P.kidsAlive} 個子女在世。以後人身份延續去：</p>${nx.map(x=>`<button class="btn alt sm" data-lin="${x.id}">🌱 ${x.name}</button>`).join("")}`:`<p class="dim small">${P.kidsAlive>0?"之後冇更晚嘅時代可以延續。":"呢一世冇在世子女，家族喺呢度停低。"}</p>`);
 $("e-line").querySelectorAll("[data-lin]").forEach(b=>b.onclick=()=>{NEXT={era:b.dataset.lin,heir:M.heirOf(P)};begin()});
 if(P.whatif){const w=P.whatif,row=(n,a,b)=>`<tr><td>${n}</td><td>${a}</td><td>${b}</td></tr>`;let div=w.choices.findIndex((c,i)=>!P.choices[i]||P.choices[i].id!==c.id||P.choices[i].i!==c.i);
  $("e-diff").style.display="block";$("e-diff").innerHTML=`<h2>🔁 如果……對照</h2><div class="diff"><table><tr><td></td><td class="dim">上一次</td><td class="dim">今次</td></tr>${row("享年",w.age+" 歲",P.age+" 歲")}${row("結局",G(w.dead),G(P.dead))}${row("財富排名",w.wea,P.wea)}${row("子女",w.kids,P.kids)}${row("稱號",w.title,t)}</table></div>
  <p class="small" style="margin-top:6px">${div<0?"兩次嘅抉擇完全一樣：分別只嚟自運氣。":`兩條路喺 ${w.choices[div]?.age??"?"} 歲嗰個抉擇開始分岔。出身、時代同分岔之前嘅際遇完全一樣：之後嘅分別就係抉擇同運氣嘅結果。`}</p>`}else $("e-diff").style.display="none";
 const nu=M.checkAch(P,{whatif:!!P.whatif});const got=new Set(LS.get("rebirth_ach",[]));$("e-ach").innerHTML=`<div class="achl">${M.ACH.filter(a=>got.has(a[0])).map(a=>`<div>🏆 <span class="${nu.includes(a[0])?"new":""}">${a[1]}${nu.includes(a[0])?"（新）":""}</span></div>`).join("")}</div><p class="note">${got.size}/${M.ACH.length}</p>`;
 $("b-whatif").onclick=()=>{NEXT={seed:P.seed,era:P.era.id,heir:P.heir,whatif:{age:P.age,dead:P.dead,wea:P.wea,kids:P.kids,title:t,choices:P.choices}};begin()};
 shareCard(t,all);window.__done=true}
function shareCard(t,all){const c=document.createElement("canvas"),W=360,H=560,x=c.getContext("2d");c.width=W;c.height=H;x.imageSmoothingEnabled=false;
 x.fillStyle="#1a1626";x.fillRect(0,0,W,H);const sc=document.createElement("canvas");drawScene(sc,P.era,{px:29,night:1});x.drawImage(sc,20,20,320,200);
 x.fillStyle="#0b0912";[[16,16,328,4],[16,220,328,4],[16,16,4,208],[340,16,4,208]].forEach(r=>x.fillRect(...r));
 x.fillStyle="#ffcc4d";x.font="24px Cubic";x.fillText("輪迴局",20,256);x.font="14px Cubic";x.fillStyle="#a99fc0";x.fillText("異世界投胎模擬",120,256);
 x.fillStyle="#f3ead2";x.font="20px Cubic";x.fillText(`「${t}」${P.name}`,20,290);x.font="15px Cubic";
 [`${P.era.name} · ${P.place}`,`${E.yr(P.birthYear)} – ${E.yr(P.year)} · ${P.cls.name}`,`享年 ${P.age} 歲 · ${P.dead}`].forEach((s,i)=>x.fillText(s,20,318+i*22));
 ST.forEach(([k,n,col],i)=>{const y=392+Math.floor(i/2)*22,X=20+(i%2)*170;x.fillStyle="#a99fc0";x.font="13px Cubic";x.fillText(n.slice(0,2),X,y);x.fillStyle="#120f1c";x.fillRect(X+34,y-10,100,9);x.fillStyle=col;for(let j=0;j<P[k];j+=8)x.fillRect(X+34+j,y-10,6,9)});
 x.fillStyle="#a99fc0";x.fillText("同一刻出生：",20,462);all.filter(s=>s!==P).slice(0,4).forEach((s,i)=>x.fillText(`${s.era.name} ${s.age}歲`,20+(i%2)*170,480+Math.floor(i/2)*16));
 if(P.cf){const f=Math.abs(P.cf.sbWea-P.cf.eraWea),c=Math.abs(P.wea-P.cf.sbWea),fs=Math.round(100*f/Math.max(1,f+c));x.fillStyle="#a3322b";x.fillRect(20,516,fs*3.2,8);x.fillStyle="#2f5f7a";x.fillRect(20+fs*3.2,516,320-fs*3.2,8);x.fillStyle="#f3ead2";x.font="12px Cubic";x.fillText(`出身 ${fs}% ｜ 抉擇＋運氣 ${100-fs}%${P.gen>1?` ｜ 第${P.gen}代`:""}`,20,510)}
 x.font="13px Cubic";x.fillStyle="#ffcc4d";x.fillText(`dancingturtle14.github.io/rebirth-sim/?seed=${P.seed}`,20,546);
 const url=c.toDataURL("image/png");$("e-card").src=url;$("b-dl").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=`rebirth-${P.name}.png`;a.click()}}
document.fonts&&document.fonts.load("16px Cubic");home();if(QA||Q.has("seed"))begin();
})();
