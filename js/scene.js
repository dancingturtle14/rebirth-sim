/* 像素場景：64x40 邏輯像素，全部用 fillRect 手繪，無外部素材 */
window.drawScene=function(cv,era,opts={}){
 const W=64,H=40,x=cv.getContext("2d");cv.width=W;cv.height=H;x.imageSmoothingEnabled=false;
 const P=era.pal,R=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(a,b,c,d)};
 const sh=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(r)},${f(g)},${f(b)})`};
 for(let i=0;i<4;i++)R(0,i*7,W,7,sh(P.sky,1.1-i*.07));
 const night=opts.night;if(night){R(0,0,W,28,"#141a33");for(let i=0;i<14;i++)R((i*23)%W,(i*11)%22,1,1,"#fff")}
 R(50,4,5,5,night?"#eee":"#fff4c2");
 R(0,28,W,12,P.ground);for(let i=0;i<W;i+=4)R(i,28+(i%8?1:0),2,1,sh(P.ground,.8));
 const a=P.accent,k=P.ink,s=era.scene;
 if(s==="pyramid"){for(let i=0;i<14;i++)R(8+i,27-i,28-2*i,1,i%2?"#e2b86a":"#d4a456");for(let i=0;i<8;i++)R(40+i,27-i,16-2*i,1,"#c99a4e");R(2,29,60,2,a)}
 if(s==="wall"){R(0,20,W,8,"#8b7d63");for(let i=0;i<W;i+=6)R(i,18,4,2,"#8b7d63");R(26,12,12,8,"#6d6150");R(24,10,16,2,a);R(30,22,4,6,k)}
 if(s==="colosseum"){R(10,12,44,16,"#d8c49a");for(let r=0;r<3;r++)for(let i=0;i<10;i++)R(12+i*4,14+r*5,2,3,"#7a6a4a");R(10,11,44,1,a)}
 if(s==="pagoda"){for(let i=0;i<5;i++){R(24-i,24-i*4,16+i*2,1,a);R(27,21-i*4,10,3,"#6b3a24")}R(31,2,2,4,k);R(0,26,20,2,a);R(44,26,20,2,a)}
 if(s==="bridge"){R(0,30,W,10,"#5a7f8c");for(let i=0;i<20;i++){const y=Math.round(4*Math.sin(i/19*Math.PI));R(22+i,26-y,1,2,"#7a5a3a")}R(4,18,10,10,"#e8e0cc");R(3,17,12,2,k);R(48,20,10,8,"#e8e0cc");R(47,19,12,2,k)}
 if(s==="castle"){R(14,12,36,16,"#6c6c74");for(let i=0;i<9;i++)R(14+i*4,10,2,2,"#6c6c74");R(12,6,6,22,"#5a5a62");R(46,6,6,22,"#5a5a62");R(28,20,8,8,k);R(14,4,2,2,a);R(48,4,2,2,a)}
 if(s==="ger"){[[10,6],[30,8],[48,5]].forEach(([g,w])=>{R(g,22,w*2,6,"#f0ead8");R(g+1,20,w*2-2,2,"#e0d6be");R(g+w-1,24,2,4,a)});R(4,30,2,1,k);R(5,29,3,1,k)}
 if(s==="gate"){R(14,16,36,12,"#a8402c");R(10,12,44,4,"#3e3a36");R(12,10,40,2,"#d4a84a");R(28,20,8,8,k);R(0,24,14,4,"#8a7a66");R(50,24,14,4,"#8a7a66")}
 if(s==="torii"){R(18,12,28,2,a);R(16,10,32,2,k);R(22,12,3,16,a);R(39,12,3,16,a);R(20,16,24,2,a);R(4,20,8,8,"#f2d7e0");R(52,18,8,10,"#f2d7e0")}
 if(s==="factory"){R(6,16,22,12,"#5a4038");R(34,12,24,16,"#4a3a34");R(10,6,3,10,"#3a302c");R(40,4,3,8,"#3a302c");R(50,6,3,6,"#3a302c");for(let i=0;i<5;i++)R(9+i*2,4-i,3,2,"#bbb");for(let i=0;i<6;i++)R(36+i*4,18,2,3,a)}
 if(s==="bund"){[[4,14,10],[16,10,8],[26,16,12],[40,8,9],[51,13,10]].forEach(([b,h,w])=>{R(b,28-h-6,w,h+6,"#2c2a38");for(let j=0;j<h;j+=3)R(b+2,28-h-4+j,w-4,1,a)});R(43,4,3,4,a);R(0,31,W,9,"#3a5068")}
 if(s==="ruins"){R(6,16,12,12,"#5c5c5c");R(6,14,4,2,"#5c5c5c");R(24,20,18,8,"#505050");R(46,12,10,16,"#5c5c5c");R(50,10,4,2,"#5c5c5c");for(let i=0;i<6;i++)R(20+i*3,8-i,4,3,"#888");R(28,23,4,4,a)}
 if(s==="skyline"){[[2,14,7],[10,22,6],[17,12,8],[26,26,7],[34,17,6],[41,30,6],[48,20,7],[56,15,7]].forEach(([b,h,w],i)=>{R(b,28-h,w,h,i%2?"#323a5a":"#28304c");for(let j=2;j<h;j+=3)for(let q=1;q<w-1;q+=2)if((j*q+i)%5)R(b+q,28-h+j,1,1,"#ffd27a")});R(0,31,W,9,"#1e3557")}
 if(s==="village"){[[6,10],[22,12],[44,9]].forEach(([b,w])=>{R(b,21,w,7,"#a8875a");for(let i=0;i<4;i++)R(b-1+i,20-i,w+2-2*i,1,"#d9b46a");R(b+w/2-1,24,2,4,k)});R(58,10,2,18,"#6b4a2a");R(54,8,10,3,"#3f8a3a");R(55,6,8,2,"#4fa04a")}
 if(s==="dome"){R(18,16,28,12,"#e8dcc0");for(let i=0;i<6;i++)R(24+i,15-i,16-2*i,1,a);R(31,7,2,3,"#d4af37");R(10,6,4,22,"#e8dcc0");R(9,5,6,2,a);R(50,6,4,22,"#e8dcc0");R(49,5,6,2,a);R(29,21,6,7,k)}
 if(s==="savanna"){R(6,18,2,10,"#5a3a1a");R(0,15,14,3,"#4f7a2a");R(2,13,10,2,"#5f8a3a");[[24,9],[40,8]].forEach(([b,w])=>{R(b,22,w,6,"#b5793a");for(let i=0;i<5;i++)R(b-1+i,21-i,w+2-2*i,1,"#d9b46a")});R(54,24,6,2,k);R(55,22,4,2,k)}
 if(s==="andes"){for(let i=0;i<16;i++){R(4+i,26-i,36-2*i,1,i>11?"#f0f0f0":"#7a6a5a");R(34+i,26-i*.8|0,28-2*i>0?28-2*i:0,1,i>12?"#f0f0f0":"#8a7a6a")}for(let i=0;i<4;i++)R(0,27-i*2,20-i*4,1,"#5f8a3a")}
 if(s==="farm"){R(8,16,16,12,"#a83a2a");for(let i=0;i<6;i++)R(6+i,15-i,20-2*i,1,"#6a2a1a");R(14,22,4,6,k);R(40,14,4,14,"#c9c0a0");R(39,12,6,2,"#8a8070");for(let i=0;i<W;i+=3)R(i,31,1,6,"#c8b04a")}
 if(opts.person!==false){const px=opts.px??5,py=22,c=opts.dead?"#888":"#2b1a10";R(px+1,py,3,3,"#f1c9a0");R(px,py-1,5,1,c);R(px,py+3,5,4,opts.cloth||a);R(px+1,py+7,1,2,c);R(px+3,py+7,1,2,c)}
};
