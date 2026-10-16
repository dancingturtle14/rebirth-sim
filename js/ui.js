(function(){
const $=id=>document.getElementById(id),E=Engine,Q=new URLSearchParams(location.search);
const STATS=[["hea","健康","#e05c5c"],["hap","快樂","#ffcc4d"],["wis","智慧","#6ac7e0"],["soc","人脈","#a07ae0"],["wea","財富","#d4af37"],["fam","聲望","#7ad08a"]];
const store={get:()=>{try{return JSON.parse(localStorage.getItem("rebirth_lives")||"[]")}catch(e){return[]}},set:v=>localStorage.setItem("rebirth_lives",JSON.stringify(v.slice(-50)))};
let P=null,speed=500,timer=null,pending=null,auto=Q.has("auto");
const show=id=>{document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));$("ctrl").style.display=id==="s-life"?"flex":"none";scrollTo(0,0)};
function home(){const L=store.get();$("n-past").textContent=L.length;const got=new Set(L.map(l=>l.era));
 $("chips").innerHTML=ERAS.map(e=>`<span class="${got.has(e.id)?"got":""}">${got.has(e.id)?"✓ ":"？"}${e.name}</span>`).join("")+`<p class="note">已解鎖 ${got.size}/${ERAS.length}</p>`;
 $("past-list").innerHTML=L.slice().reverse().map(l=>`<div class="card"><small>${l.eraName} · ${l.place}</small>${l.name}（${l.cls}）享年 ${l.age} · ${l.cause} · 「${l.title}」</div>`).join("")||"未有紀錄";
 const t=ERAS[Math.floor(Date.now()/4000)%ERAS.length];drawScene($("cv-title"),t,{person:false})}
setInterval(()=>{if($("s-start").classList.contains("on"))home()},4000);
$("b-past").onclick=()=>{const p=$("past");p.style.display=p.style.display==="none"?"block":"none"};
function begin(){const seed=+Q.get("seed")||Math.floor(Math.random()*1e9);P=E.born(seed,Q.get("era"));show("s-birth");
 const e=P.era;drawScene($("cv-birth"),e,{px:29});document.body.style.setProperty("--ac",e.pal.accent==="#3b6ea5"?"#ffcc4d":"#ffcc4d");
 const lines=[["時代",`${e.name}`],["地點",P.place],["年份",E.yr(P.year)],["出身",P.cls.name],["性別",P.sex==="m"?"男":"女"],["名字",`<span class="big">${P.name}</span>`],["識字機會",P.lit?"有":"冇"],["當時預期壽命",e.e0+"（估算）"]];
 $("reveal").innerHTML=`<h2>你投胎到……</h2>`+lines.map(l=>`<div class="kv"><b>${l[0]}</b><span>${l[1]}</span></div>`).join("");
 const ds=[...$("reveal").children].slice(1);$("b-live").style.visibility="hidden";ds.forEach((d,i)=>setTimeout(()=>{d.classList.add("show");if(i===ds.length-1)$("b-live").style.visibility="visible"},auto?10:350*(i+1)));
 if(auto)setTimeout(live,80)}
$("b-live").onclick=live;$("b-go").onclick=begin;$("b-again").onclick=()=>{history.replaceState(0,"",location.pathname+(auto?"?auto=1":""));Q.delete("seed");Q.delete("era");begin()};
function focusUI(){$("focus").innerHTML=Object.entries(E.FOCUS).map(([k,v])=>`<button data-f="${k}" class="${P.focus===k?"on":""}">${v.n}</button>`).join("");
 $("focus").querySelectorAll("button").forEach(b=>b.onclick=()=>{P.focus=b.dataset.f;focusUI()})}
function hud(){$("h-age").textContent=P.age;$("h-year").textContent=E.yr(P.year)+" · "+P.place;$("h-who").textContent=`${P.name} · ${P.era.name} · ${P.cls.name}${P.married?" · 已婚":""}${P.kids?" · 子女"+P.kids:""}`;
 $("stats").innerHTML=STATS.map(([k,n,c])=>`<div class="stat"><span>${n}</span><div class="bar"><i style="width:${P[k]}%;--c:${c}"></i></div><span>${P[k]}</span></div>`).join("");
 drawScene($("cv-life"),P.era,{px:4+Math.min(50,P.age*.6),night:P.dead})}
function card(e){const d=document.createElement("div");d.className="card "+e.k;d.innerHTML=`<small>${e.age} 歲 · ${E.yr(e.year)}</small>${e.t}`;$("feed").prepend(d);$("feed").scrollTop=0}
function live(){show("s-live"==="x"?"":"s-life");$("feed").innerHTML="";focusUI();hud();card({k:"life",t:`${P.name}喺${P.place}出世。`,age:0,year:P.year});setSpeed(auto?30:speed)}
function setSpeed(s){speed=s;document.querySelectorAll("#ctrl button").forEach(b=>b.classList.toggle("on",+b.dataset.s===s||(auto&&b.dataset.s==="120")));clearInterval(timer);if(s&&!pending)timer=setInterval(tick,s)}
document.querySelectorAll("#ctrl button").forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
function tick(){if(!P||P.dead)return;const {ev,dec}=E.step(P);ev.forEach(card);hud();
 if(P.dead)return finish();
 if(dec){clearInterval(timer);pending=dec;ask(dec)}else E.advance(P)}
function ask(d){$("m-age").textContent=`${P.age} 歲 · ${E.yr(P.year)}`;$("m-t").textContent=d.t;$("m-c").innerHTML="";
 d.c.forEach((c,i)=>{const b=document.createElement("button");b.className="btn"+(i?" alt":"");b.textContent=c.t;b.onclick=()=>answer(i);$("m-c").append(b)});$("modal").classList.add("on");
 if(auto)setTimeout(()=>answer(Math.floor(Math.random()*d.c.length)),Q.has("hold")?1e9:20)}
function answer(i){const d=pending;pending=null;$("modal").classList.remove("on");E.choose(P,d,i);card(P.log[P.log.length-1]);hud();if(P.dead)return finish();E.advance(P);setSpeed(auto?30:speed)}
function finish(){clearInterval(timer);hud();card({k:"death",t:`${P.name}${P.dead}，享年 ${P.age} 歲。`,age:P.age,year:P.year});setTimeout(ending,auto?50:1600)}
function soulCanvas(p,w){const c=document.createElement("canvas");drawScene(c,p.era,{px:28,dead:1});return c}
function ending(){show("s-end");const t=E.title(P);drawScene($("cv-end"),P.era,{px:29,night:1});
 $("e-title").textContent=`「${t}」${P.name}`;
 $("e-sum").innerHTML=`<div class="kv"><b>時代</b><span>${P.era.name} · ${P.place}</span><b>一生</b><span>${E.yr(P.birthYear)} – ${E.yr(P.year)}</span><b>出身</b><span>${P.cls.name}</span><b>享年</b><span class="big">${P.age} 歲</span><b>結局</b><span>${P.dead}</span></div>`+
  STATS.map(([k,n,c])=>`<div class="stat"><span>${n}</span><div class="bar"><i style="width:${P[k]}%;--c:${c}"></i></div><span>${P[k]}</span></div>`).join("");
 $("e-grid").innerHTML=P.grid.map((g,i)=>`<i class="${g}" title="${i}歲">${i%10===0?i:""}</i>`).join("");
 const others=ERAS.filter(e=>e.id!==P.era.id).sort((a,b)=>((P.seed*31+a.name.length*7+a.pop)%13)-((P.seed*31+b.name.length*7+b.pop)%13)).slice(0,4);
 const S=others.map((e,i)=>E.quick(P.seed+i+1,e.id));$("e-souls").innerHTML="";
 S.forEach(s=>{const d=document.createElement("div");d.className="soul";d.append(soulCanvas(s));d.insertAdjacentHTML("beforeend",`<b>${s.name}</b><br>${s.era.name}<br>${s.cls.name} · 享年 ${s.age}<br><span style="color:var(--dim)">${s.dead}</span>`);$("e-souls").append(d)});
 const imp=P.log.filter(l=>l.k!=="life");$("e-log").innerHTML=imp.map(l=>`<div class="card ${l.k}" style="margin:6px 0"><small>${l.age} 歲</small>${l.t}</div>`).join("")||"平平淡淡。";
 const L=store.get();L.push({era:P.era.id,eraName:P.era.name,place:P.place,name:P.name,cls:P.cls.name,age:P.age,cause:P.dead,title:t,ts:Date.now()});store.set(L);
 shareCard(t,S);window.__done=true}
function shareCard(t,S){const c=document.createElement("canvas"),W=360,H=540,x=c.getContext("2d");c.width=W;c.height=H;x.imageSmoothingEnabled=false;
 x.fillStyle="#1a1626";x.fillRect(0,0,W,H);const sc=document.createElement("canvas");drawScene(sc,P.era,{px:29,night:1});x.drawImage(sc,20,20,320,200);
 x.fillStyle="#0b0912";x.fillRect(16,16,328,4);x.fillRect(16,220,328,4);x.fillRect(16,16,4,208);x.fillRect(340,16,4,208);
 x.fillStyle="#ffcc4d";x.font="24px Cubic";x.fillText("輪迴局",20,256);x.font="14px Cubic";x.fillStyle="#a99fc0";x.fillText("異世界投胎模擬",120,256);
 x.fillStyle="#f3ead2";x.font="20px Cubic";x.fillText(`「${t}」${P.name}`,20,290);x.font="15px Cubic";
 [`${P.era.name} · ${P.place}`,`${E.yr(P.birthYear)} – ${E.yr(P.year)} · ${P.cls.name}`,`享年 ${P.age} 歲 · ${P.dead}`].forEach((s,i)=>x.fillText(s,20,318+i*22));
 STATS.forEach(([k,n,col],i)=>{const y=390+Math.floor(i/2)*24,X=20+(i%2)*170;x.fillStyle="#a99fc0";x.fillText(n,X,y);x.fillStyle="#120f1c";x.fillRect(X+40,y-11,100,10);x.fillStyle=col;for(let j=0;j<P[k];j+=8)x.fillRect(X+40+j,y-11,6,10)});
 x.fillStyle="#a99fc0";x.font="13px Cubic";x.fillText("同一刻：",20,474);x.fillText(S.map(s=>`${s.era.name}${s.age}歲`).slice(0,2).join("、"),80,474);x.fillText(S.map(s=>`${s.era.name}${s.age}歲`).slice(2).join("、"),80,494);
 x.fillStyle="#ffcc4d";x.fillText("dancingturtle14.github.io/rebirth-sim",20,526);
 const url=c.toDataURL("image/png");$("e-card").src=url;$("b-dl").onclick=()=>{const a=document.createElement("a");a.href=url;a.download=`rebirth-${P.name}.png`;a.click()}}
document.fonts&&document.fonts.load("16px Cubic");home();if(auto||Q.has("seed"))begin();
})();
