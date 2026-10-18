/* 補充：參考壽命範圍、城市化、貨幣（遊戲換算）、歷史事件來源 */
(function(){const X={
egypt:{le:[20,25],leSrc:"Scheidel, Death on the Nile (2001), estimate",urb:.05,cur:" deben",base:60,hsrc:"After Kemp, Ancient Egypt, and other general histories"},
qinhan:{le:[25,30],leSrc:"Scholarly estimates such as Ge Jianxiong, History of China's Population",urb:.10,cur:" coins",base:8000,hsrc:"After the Records of the Grand Historian and the Book of Han"},
rome:{le:[20,30],leSrc:"Frier (2000); Scheidel (2001) estimates",urb:.15,cur:" denarii",base:250,hsrc:"After Tacitus, Pliny and others; Duncan-Jones (1996)"},
tang:{le:[27,32],leSrc:"General scholarly estimate for the Tang population (including infant deaths)",urb:.10,cur:" wen",base:12000,hsrc:"After the Old and New Books of Tang and the Zizhi Tongjian"},
song:{le:[27,32],leSrc:"General scholarly estimate for the Song population (including infant deaths)",urb:.12,cur:" wen",base:30000,hsrc:"After the History of Song and the Xu Zizhi Tongjian Changbian"},
blackdeath:{le:[20,30],leSrc:"Russell; Hatcher (1986) estimates for 14th-century England",urb:.10,cur:" pence",base:300,hsrc:"After Benedictow (2004); Jordan, The Great Famine (1996)"},
mongol:{le:[25,30],leSrc:"General estimate for pre-modern societies (Our World in Data)",urb:.05,cur:" sheep",base:12,hsrc:"After The Secret History of the Mongols and History of Yuan; Atwood (2004)"},
mingqing:{le:[25,32],leSrc:"Lee & Wang, One Quarter of Humanity (1999), and other estimates",urb:.07,cur:" taels",base:5,hsrc:"After the History of Ming and Draft History of Qing"},
edo:{le:[30,38],leSrc:"Hanley & Yamamura (1977); Hayami Akira's studies of temple registers",urb:.13,cur:" wen",base:60000,hsrc:"After Kikuchi Isao, A Social History of Famine, and others"},
london:{le:[30,40],leSrc:"Wrigley & Schofield (1981); Szreter & Mooney (1998) urban estimates",urb:1,cur:"£",base:40,hsrc:"After Registrar General reports; Snow (1855)"},
shanghai:{le:[30,40],leSrc:"Barclay et al. (1976); urban estimates (Our World in Data)",urb:1,cur:" silver dollars",base:180,hsrc:"After the Shanghai Gazetteer and histories of Hong Kong"},
ww2:{le:[55,62],leSrc:"Our World in Data: European life expectancy at birth, 1930s",urb:.5,cur:" yuan",base:1500,hsrc:"After Our World in Data; Snyder, Bloodlands"},
hk:{le:[80,86],leSrc:"Census and Statistics Department, Hong Kong Life Tables",urb:1,cur:" HKD",base:360000,hsrc:"After the Census and Statistics Department and Hong Kong Yearbook"}};
for(const e of ERAS)Object.assign(e,X[e.id]);
const bd=ERAS.find(e=>e.id==="blackdeath");bd.events.find(v=>v.plague>.05&&v.y[0]===1347).s="Benedictow, The Black Death (2004)";
const ld=ERAS.find(e=>e.id==="london");ld.events[2].s="Snow, On the Mode of Communication of Cholera (1855)";
})();
