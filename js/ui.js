(function(){
const $=id=>document.getElementById(id),E=Engine,Q=new URLSearchParams(location.search),QA=Q.has("auto");
const ST=[["hea","健康","#e05c5c"],["hap","快樂","#ffcc4d"],["wis","智慧","#6ac7e0"],["soc","人脈","#a07ae0"],["wea","財富排名","#d4af37"],["fam","聲望","#7ad08a"]];
const store={get:()=>{try{return JSON.parse(localStorage.getItem("rebirth_lives")||"[]")}catch(e){return[]}},set:v=>localStorage.setItem("rebirth_lives",JSON.stringify(v.slice(-50)))};
const pct=x=>(x*100<1?(x*100).toFixed(1):Math.round(x*100))+"%";
let P=null,mult=+Q.get("speed")||2,timer=null,pending=null,autoDec=QA,cd=null,skipping=false;
const show=id=>{document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));$("ctrl").style.display=id==="s-life"?"flex":"none";scrollTo(0,0)};
const bar=(v,c)=>`<div class="bar"><i style="width:${v}%;--c:${c}"></i></div>`;
/* 主頁 */
ERAS.forEach(e=>$("o-era").insertAdjacentHTML("beforeend",`<option value="${e.id}">${e.name}（${pct(E.eraProb(e))}）</option>`));
function home(){const L=store.get();$("n-past").textContent=L.length;const got=new Set(L.map(l=>l.era));
 $("chips").innerHTML=ERAS.map(e=>`<span class="${got.has(e.id)?"got":""}">${got.has(e.id)?"✓ ":"？"}${e.name}</span>`).join("")+`<p class="note">已解鎖 ${got.size}/${ERAS.length}</p>`;
 $("past-list").innerHTML=L.slice().reverse().map(l=>`<div class="card"><small>${l.eraName} · ${l.place}</small>${l.name}（${l.cls}）享年 ${l.age} · ${l.cause} · 「${l.title}」</div>`).join("")||"未有紀錄";
 drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false})}
setInterval(()=>{if($("s-start").classList.contains("on"))drawScene($("cv-title"),ERAS[Math.floor(Date.now()/4000)%ERAS.length],{person:false})},4000);
$("b-past").onclick=()=>{const p=$("past");p.style.display=p.style.display==="none"?"block":"none"};
/* 投胎抽籤 */
function spin(items,target,done){const box=$("draw");box.innerHTML=items.map(i=>`<div><span>${i[0]}</span><span>${i[1]}</span></div>`).join("");
 const rows=[...box.children],ti=items.findIndex(i=>i[2]===target),total=items.length*2+ti;let k=0;
 const tick=()=>{rows.forEach(r=>r.classList.remove("hi"));rows[k%rows.length].classList.add("hi");if(k>=total)return setTimeout(done,QA?0:600);k++;setTimeout(tick,QA?0:40+Math.pow(k/total,3)*260)};tick()}
function begin(){const seed=+Q.get("seed")||Math.floor(Math.random()*1e9);P=E.born(seed,Q.get("era")||$("o-era").value||null);
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
 if(QA)setTimeout(live,10)}
$("b-live").onclick=()=>live();$("b-go").onclick=begin;$("b-again").onclick=()=>{["seed","era"].forEach(k=>Q.delete(k));begin()};
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
function card(e){const d=document.createElement("div");d.className="card "+e.k;d.innerHTML=`<small>${e.age} 歲 · ${E.yr(e.year)}</small>${e.t}${e.src?`<span class="fn">📜 ${e.src}</span>`:""}`;$("feed").prepend(d)}
function live(){show("s-life");$("feed").innerHTML="";focusUI();hud();card({k:"life",t:`${P.name}喺${P.place}出世。`,age:0,year:P.year});setSpeed(QA?64:mult)}
function setSpeed(m){if(m)mult=m;const run=m!==0;document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.classList.toggle("on",+b.dataset.s===(run?mult:0)));$("c-auto").classList.toggle("on",autoDec);clearInterval(timer);if(run&&!pending)timer=setInterval(tick,QA?5:1000/mult)}
document.querySelectorAll("#ctrl button[data-s]").forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
$("c-auto").onclick=()=>{autoDec=!autoDec;$("c-auto").classList.toggle("on",autoDec);if(pending&&autoDec)countdown()};
$("c-skip").onclick=()=>{if(pending||!P||P.dead)return;clearInterval(timer);skipping=true;let n=0;while(!pending&&!P.dead&&n++<150)tick(true);skipping=false;hud();if(!pending&&!P.dead)setSpeed(mult)};
function tick(sync){if(!P||P.dead||pending)return;const prevAge=P.age;const n=P.log.length;const {dec}=E.step(P);P.log.slice(n).forEach(card);hud();if(prevAge===5)focusUI();
 if(P.dead)return finish();
 if(dec){clearInterval(timer);pending=dec;ask(dec)}else E.advance(P)}
function ask(d){const e=P.era;$("m-age").textContent=`${P.age} 歲 · ${E.yr(P.year)} · ${E.fmtMoney(e,P.money)}`;$("m-t").textContent=typeof d.t==="function"?d.t(P,e):d.t;
 const s=d.key==="*evt"?null:STATS[e.id][d.key],src=d.key==="*evt"?P.log.slice().reverse().find(l=>l.k==="hist"):null;
 $("m-stat").innerHTML=s?`<b>📊 時代數據（估算）</b>${s[0]}<i>— ${s[1]}</i>`:src?`<b>📜 歷史背景</b>${src.t}<i>— ${src.src}</i>`:`<b>📜 歷史背景</b>${P.dangerEvt?.t||""}<i>— ${e.hsrc}</i>`;
 $("m-c").innerHTML="";d.c.forEach((c,i)=>{const g=E.gated(P,c),o=E.odds(P,c);const w=document.createElement("div");w.className="opt";
  w.innerHTML=`<button class="btn${i?" alt":""}" ${g?"disabled":""}>${o!=null?`<span class="odds">成功機會：${E.hint(o)}</span>`:""}${c.t}<small>${g?"🔒 "+c.gt:c.h||""}</small></button>`;
  w.firstChild.onclick=()=>answer(i);$("m-c").append(w)});$("modal").classList.add("on");$("m-cd").textContent="";if(autoDec)countdown()}
function countdown(){clearInterval(cd);if(Q.has("hold"))return;let n=QA?0:5;$("m-cd").textContent=n?`🤖 ${n} 秒後自動代揀`:"";cd=setInterval(()=>{n--;$("m-cd").textContent=`🤖 ${n} 秒後自動代揀`;if(n<=0){clearInterval(cd);if(pending)answer(E.autoPick(P,pending))}},QA?1:1000)}
function answer(i){clearInterval(cd);const d=pending;pending=null;$("modal").classList.remove("on");E.choose(P,d,i);card(P.log[P.log.length-1]);hud();if(P.dead)return finish();E.advance(P);setSpeed(mult)}
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
 shareCard(t,all);window.__done=true}
function shareCard(t,all){const c=document.createElement("canvas"),W=360,H=560,x=c.getContext("2d");c.width=W;c.height=H;x.imageSmoothingEnabled=false;
 x.fillStyle="#1a1626";x.fillRect(0,0,W,H);const sc=document.createElement("canvas");drawScene(sc,P.era,{px:29,night:1});x.drawImage(sc,20,20,320,200);
 x.fillStyle="#0b0912";[[16,16,328,4],[16,220,328,4],[16,16,4,208],[340,16,4,208]].forEach(r=>x.fillRect(...r));
 x.fillStyle="#ffcc4d";x.font="24px Cubic";x.fillText("輪迴局",20,256);x.font="14px Cubic";x.fillStyle="#a99fc0";x.fillText("異世界投胎模擬",120,256);
 x.fillStyle="#f3ead2";x.font="20px Cubic";x.fillText(`「${t}」${P.name}`,20,290);x.font="15px Cubic";
 [`${P.era.name} · ${P.place}`,`${E.yr(P.birthYear)} – ${E.yr(P.year)} · ${P.cls.name}`,`享年 ${P.age} 歲 · ${P.dead}`].forEach((s,i)=>x.fillText(s,20,318+i*22));
 ST.forEach(([k,n,col],i)=>{const y=392+Math.floor(i/2)*22,X=20+(i%2)*170;x.fillStyle="#a99fc0";x.font="13px Cubic";x.fillText(n.slice(0,2),X,y);x.fillStyle="#120f1c";x.fillRect(X+34,y-10,100,9);x.fillStyle=col;for(let j=0;j<P[k];j+=8)x.fillRect(X+34+j,y-10,6,9)});
 x.fillStyle="#a99fc0";x.fillText("同一刻出生：",20,470);all.filter(s=>s!==P).slice(0,4).forEach((s,i)=>x.fillText(`${s.era.name} ${s.age}歲`,20+(i%2)*170,490+Math.floor(i/2)*18));
 x.fillStyle="#ffcc4d";x.fillText(`dancingturtle14.github.io/rebirth-sim/?seed=${P.seed}`,20,546);
 const url=c.toDataURL("image/png");$("e-card").src=url;$("b-dl").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=`rebirth-${P.name}.png`;a.click()}}
document.fonts&&document.fonts.load("16px Cubic");home();if(QA||Q.has("seed"))begin();
})();
