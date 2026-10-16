/* 補充：參考壽命範圍、城市化、貨幣（遊戲換算）、歷史事件來源 */
(function(){const X={
egypt:{le:[20,25],leSrc:"Scheidel《Death on the Nile》(2001) 估算",urb:.05,cur:"德本",base:60,hsrc:"據 Kemp《Ancient Egypt》等通史"},
qinhan:{le:[25,30],leSrc:"葛劍雄《中國人口史》等學界估算",urb:.10,cur:"錢",base:8000,hsrc:"據《史記》《漢書》"},
rome:{le:[20,30],leSrc:"Frier (2000)；Scheidel (2001) 估算",urb:.15,cur:"第納里",base:250,hsrc:"據 Tacitus、Pliny 等史料；Duncan-Jones (1996)"},
tang:{le:[27,32],leSrc:"學界對唐代人口之一般估算（含嬰兒夭折）",urb:.10,cur:"文",base:12000,hsrc:"據《舊唐書》《新唐書》《資治通鑑》"},
song:{le:[27,32],leSrc:"學界對宋代人口之一般估算（含嬰兒夭折）",urb:.12,cur:"文",base:30000,hsrc:"據《宋史》《續資治通鑑長編》"},
blackdeath:{le:[20,30],leSrc:"Russell；Hatcher (1986) 對14世紀英格蘭估算",urb:.10,cur:"便士",base:300,hsrc:"據 Benedictow (2004)；Jordan《The Great Famine》(1996)"},
mongol:{le:[25,30],leSrc:"前現代社會一般估算（Our World in Data）",urb:.05,cur:"羊",base:12,hsrc:"據《元朝秘史》《元史》；Atwood (2004)"},
mingqing:{le:[25,32],leSrc:"Lee & Wang《One Quarter of Humanity》(1999) 等估算",urb:.07,cur:"兩",base:5,hsrc:"據《明史》《清史稿》"},
edo:{le:[30,38],leSrc:"Hanley & Yamamura (1977)；速水融宗門改帳研究",urb:.13,cur:"文",base:60000,hsrc:"據菊池勇夫《飢饉の社会史》等"},
london:{le:[30,40],leSrc:"Wrigley & Schofield (1981)；Szreter & Mooney (1998) 城市估算",urb:1,cur:"£",base:40,hsrc:"據 Registrar General 報告；Snow (1855)"},
shanghai:{le:[30,40],leSrc:"Barclay 等 (1976)；城市估算（Our World in Data）",urb:1,cur:"銀元",base:180,hsrc:"據《上海通志》《香港史》"},
ww2:{le:[55,62],leSrc:"Our World in Data：1930s 歐洲出生時預期壽命",urb:.5,cur:"元",base:1500,hsrc:"據 Our World in Data；Snyder《Bloodlands》"},
hk:{le:[80,86],leSrc:"政府統計處香港生命表",urb:1,cur:"港元",base:360000,hsrc:"據政府統計處、《香港年報》"}};
for(const e of ERAS)Object.assign(e,X[e.id]);
const bd=ERAS.find(e=>e.id==="blackdeath");bd.events.find(v=>v.plague>.05&&v.y[0]===1347).s="Benedictow《The Black Death》(2004)";
const ld=ERAS.find(e=>e.id==="london");ld.events[2].s="Snow《On the Mode of Communication of Cholera》(1855)";
})();
