# 由 OWID 公開數據（HYDE、Gapminder、Riley、UN、Maddison、van Zanden）建立時間索引世界數據
import csv,json,bisect
R={k:v for k,v in [
("china",["CHN","TWN"]),("hk",["HKG"]),("india",["IND","PAK","BGD","LKA","NPL"]),("japan",["JPN"]),("korea",["KOR","PRK"]),
("seamain",["VNM","THA","MMR","KHM","LAO"]),("seaisl",["IDN","PHL","MYS","SGP"]),("central",["MNG","KAZ","UZB","TKM","KGZ","TJK"]),
("persia",["IRN","AFG"]),("mideast",["IRQ","SYR","LBN","ISR","PSE","JOR","SAU","YEM","OMN","ARE","KWT","QAT","BHR"]),("turkey",["TUR"]),
("egypt",["EGY"]),("maghreb",["MAR","DZA","TUN","LBY"]),("wafrica",["NGA","GHA","CIV","SEN","MLI","BFA","NER","GIN","BEN","TGO","SLE","LBR","GMB","GNB","MRT"]),
("cafrica",["COD","COG","CMR","CAF","TCD","GAB","AGO"]),("eafrica",["ETH","KEN","TZA","UGA","SOM","SDN","RWA","BDI","ERI","SSD","MDG","MOZ","MWI"]),
("safrica",["ZAF","ZWE","ZMB","NAM","BWA","LSO","SWZ"]),("britain",["GBR","IRL"]),("france",["FRA"]),("german",["DEU","AUT","CHE"]),("italy",["ITA"]),
("iberia",["ESP","PRT"]),("north",["NLD","BEL","DNK","SWE","NOR","FIN"]),("easteu",["POL","CZE","SVK","HUN","ROU","BGR","SRB","HRV","BIH","GRC","ALB","MKD","SVN"]),
("russia",["RUS","UKR","BLR"]),("northam",["USA","CAN"]),("mexico",["MEX","GTM","HND","SLV","NIC","CRI","PAN"]),("carib",["CUB","HTI","DOM","JAM","PRI","TTO"]),
("andes",["PER","BOL","ECU","COL","VEN","CHL"]),("brazil",["BRA"]),("cone",["ARG","URY","PRY"]),("oceania",["AUS","NZL","PNG"])]}
CONT={"china":"Asia","hk":"Asia","india":"Asia","japan":"Asia","korea":"Asia","seamain":"Asia","seaisl":"Asia","central":"Asia","persia":"Asia","mideast":"Asia","turkey":"Asia",
"egypt":"Africa","maghreb":"Africa","wafrica":"Africa","cafrica":"Africa","eafrica":"Africa","safrica":"Africa","britain":"Europe","france":"Europe","german":"Europe","italy":"Europe",
"iberia":"Europe","north":"Europe","easteu":"Europe","russia":"Europe","northam":"Americas","mexico":"Americas","carib":"Americas","andes":"Americas","brazil":"Americas","cone":"Americas","oceania":"Oceania"}
A=[-1000,1,500,1000,1300,1500,1600,1700,1800,1850,1900,1925,1950,1975,2000,2020]
def load(f,col=3,bycode=True):
    d={}
    for x in list(csv.reader(open('raw/'+f+'.csv')))[1:]:
        k=x[1] if bycode else x[0]
        if not x[col]:continue
        d.setdefault(k,[]).append((int(x[2]),float(x[col])))
    for k in d:d[k].sort()
    return d
def gm(n):
    d={}
    for x in list(csv.reader(open('raw/gm_'+n+'.csv')))[1:]:
        if x[2]:d.setdefault(x[0].upper(),[]).append((int(x[1]),float(x[2])))
    for k in d:d[k].sort()
    return d
GLE=gm('lex');GU5=gm('child_mortality_0_5_year_olds_dying_per_1000_born');GTFR=gm('children_per_woman_total_fertility')
POP=load('population');LE=load('life-expectancy');U5=load('child-mortality');TFR=load('children-born-per-woman');LITH=load('cross-country-literacy-rates');LITM=load('literacy-rate')
GDP=load('gdp-per-capita-maddison-project-database');URB=load('urbanization-last-500-years');LEC=load('life-expectancy',bycode=False);LITW=load('cross-country-literacy-rates',bycode=False)
def val(s,y,gap=60,extend=0):
    if not s:return None
    ys=[a for a,_ in s]
    if y<ys[0]: return s[0][1] if ys[0]-y<=extend else None
    if y>ys[-1]: return s[-1][1] if y-ys[-1]<=max(extend,10) else None
    i=bisect.bisect_left(ys,y)
    if ys[i]==y:return s[i][1]
    (a,va),(b,vb)=s[i-1],s[i]
    if b-a>gap:return None
    return va+(vb-va)*(y-a)/(b-a)
# ---- v4.1 修正 ----
# 人口：唔再將某國最早一年嘅數「倒灌」去更早年份（舊版 extend=500 令愛爾蘭 1950 年 291 萬人口被套用落 1600、1850 年）。
def madpop():
    d={}
    for x in csv.DictReader(open('raw/mpd2023.csv')):
        if x['pop'] not in('','None'):d.setdefault(x['countrycode'],[]).append((int(float(x['year'])),float(x['pop'])*1000))
    for k in d:d[k].sort()
    return d
MADP=madpop()
IREL=[(int(x[2]),float(x[3])) for x in list(csv.reader(open('raw/population.csv')))[1:] if x[0]=="Ireland (whole island)" and x[3]]
IREL.sort()
# 舊有 OWID 國碼起點較遲嘅國家：用母體（較大範圍）序列按比例倒推，或者確認當時無人居住
BACK={"PSE":"ISR","SSD":"SDN","SRB":"OWID_SRM"}
ZERO_BEFORE={"NZL":1200,"TTO":900}  # 毛利人約 1250–1300 年先到紐西蘭；HYDE 千里達 900 年前人口 ≈ 0
def popc(c,y):
    y=0 if y==1 else y
    if c=="IRL":
        # Maddison／Gapminder 嘅「GBR」1820–1920 已包括全愛爾蘭（大不列顛及愛爾蘭聯合王國），避免重複計算
        if 1815<=y<=1920:return 0
        if 1800<=y<1815:return val(IREL,y,30,0)
        if y<1800 or 1920<y<1950:return val(MADP.get("IRL"),y,300,0) or 0
    s=POP.get(c)
    if c in ZERO_BEFORE and y<ZERO_BEFORE[c]:return 0
    if s and y<s[0][0] and c in BACK:
        p=POP.get(BACK[c]);a=val(p,y,500,0);b=val(p,s[0][0],500,0)
        return a*s[0][1]/b if a and b else 0
    return val(s,y,500,0 if c in BACK or c=="IRL" else 500) or 0
def agg(reg,y,D,gap=60,extend=0):
    tot=0;w=0;v=0
    for c in R[reg]:
        p=popc(c,y);tot+=p
        x=val(D.get(c),y,gap,extend)
        if x is not None:w+=p;v+=p*x
    return (v/w if w else None),(w/tot if tot else 0)

# 識字率：先用該國真實觀測（van Zanden/OWID、UNESCO、人口普查／史家估算），長距離內插或者錨定本地觀測嘅推算會標「估計」
CEN={ # 國家: [(年份, 識字率%, 來源代號)]
 "RUS":[(1897,21,"c_rus")],"JPN":[(1870,30,"c_jpn")],"CHN":[(1880,22,"c_chn")],"ITA":[(1861,22,"c_ita")],
 "USA":[(1870,80,"c_usa"),(1880,83,"c_usa"),(1890,86.7,"c_usa")],"FRA":[(1788,37.1,"c_fra"),(1818,44.5,"c_fra")],
 "GBR":[(1755,49.5,"c_gbr"),(1840,58.5,"c_gbr")]}
LITALL={}
for D,t in ((LITH,"vz"),(LITM,"unesco")):
    for k,s in D.items():
        for yy,v in s:LITALL.setdefault(k,{})[yy]=(v,t)
for k,s in CEN.items():
    for yy,v,t in s:LITALL.setdefault(k,{})[yy]=(v,t)
LITS={k:sorted((yy,v,t) for yy,(v,t) in d.items()) for k,d in LITALL.items()}
WL=LITW["World"]
def litc(c,y):
    s=LITS.get(c)
    if not s:return None,None
    ys=[a for a,_,_ in s]
    for a,v,t in s:
        if a==y:return v,t
    i=bisect.bisect_left(ys,y)
    if 0<i<len(s):
        (a,va,ta),(b,vb,tb)=s[i-1],s[i]
        if b-a<=250:
            v=va+(vb-va)*(y-a)/(b-a);near=min(y-a,b-y)
            return v,(ta if (y-a)<=(b-y) else tb) if b-a<=60 or near<=15 else "vzi"
    if i==0:
        a,va,ta=s[0]
        if a-y<=15:return va,ta
        w0=val(WL,a,100,5);w1=val(WL,y,100,5)
        if a-y<=150 and w0 and w1:return min(va,va*w1/w0),"bc"
        return None,None
    a,va,ta=s[-1]
    if y-a<=15:return va,ta
    if y-a<=80:
        if va>=95:return va,"bc"   # 已近飽和，維持
        w0=val(WL,a,100,5);w1=val(WL,y,100,10)
        if w0 and w1 and w0<100:return min(99,max(va,100-(100-va)*(100-w1)/(100-w0))),"bc"  # 按世界文盲率下降比例推前
        return va,"bc"
    return None,None
RANK={"vz":0,"unesco":0,"vzi":1,"bc":2}
def litreg(reg,y):
    tot=w=v=0;tw={}
    for c in R[reg]:
        p=popc(c,y);tot+=p;x,t=litc(c,y)
        if x is not None:w+=p;v+=p*x;tw[t]=tw.get(t,0)+p
    if not tot or w/tot<.5:return None,None
    tag=max(tw,key=tw.get)
    return v/w/100,tag
out={}
for reg in R:
    out[reg]={}
    for y in A:
        yy=0 if y==1 else y
        pop=sum(popc(c,y) for c in R[reg])
        c={"pop":round(pop/1e6,3),"popS":"hyde"}
        bcp=sum(popc(k,y) for k in R[reg] if k in BACK and POP.get(k) and (0 if y==1 else y)<POP[k][0][0])
        if pop and bcp/pop>=.01:c["popS"]="popbc"
        elif "IRL" in R[reg] and (y<1800 or 1920<y<1950):c["popS"]="hydm"
        le,cv=agg(reg,y,GLE,30,0) if y>=1800 else (None,0)
        if le and cv>=.5:c["le"]=round(le,1);c["leS"]="gm"
        elif agg(reg,y,LE,30,5)[1]>=.5:c["le"]=round(agg(reg,y,LE,30,5)[0],1);c["leS"]="owid"
        else:
            cl=val(LEC[CONT[reg]],y,200,10)
            if cl:c["le"]=round(cl,1);c["leS"]="riley"
            else:c["le"]=LEC[CONT[reg]][0][1];c["leS"]="pre"
        u,cv=agg(reg,y,GU5,30,0) if y>=1800 else (None,0)
        if u and cv>=.5:c["u5"]=round(u/1000,3);c["u5S"]="gap"
        else:c["u5"]=.43;c["u5S"]="volk"
        t,cv=agg(reg,y,GTFR,30,0) if y>=1800 else (None,0)
        if t and cv>=.5:c["tfr"]=round(t,1);c["tfrS"]="gap"
        else:c["tfr"]=6;c["tfrS"]="pre"
        l,tag=litreg(reg,y)
        if l is not None:c["lit"]=round(l,3);c["litS"]=tag
        elif y>=1820:c["lit"]=round(val(LITW["World"],y,100,5)/100,3);c["litS"]="world"
        else:c["lit"]=.05;c["litS"]="pre"
        u,cv=agg(reg,y,URB,500,0)
        c["urb"]=round((u or 5)/100,3);c["urbS"]="hyde" if u else "pre"
        g,cv=agg(reg,y,GDP,120,0)
        if g and cv>=.4:c["gdp"]=round(g);c["gdpS"]="mad"
        else:
            gw=val(GDP.get("OWID_WRL") or [],y,200,0) or (val(load('gdp-per-capita-maddison-project-database',bycode=False)["World"],y,200,0))
            if gw:c["gdp"]=round(gw);c["gdpS"]="madw"
            else:c["gdp"]=1000;c["gdpS"]="pre"
        out[reg][y]=c
open('../data/world-data.js','w').write("/* 由 tools/build_world.py 由 OWID 數據產生（HYDE 3.x 人口同城市化、Gapminder 兒童死亡率同生育率、Riley/UN/HMD 壽命、Maddison 2023 人均GDP、van Zanden/UNESCO 識字率） */\nwindow.ANCHORS="+json.dumps(A)+";\nwindow.WDATA="+json.dumps(out,ensure_ascii=False,separators=(',',':'))+";\n")
for y in [1800,1900,1950,2000]:
    tot=sum(out[r][y]["pop"] for r in R)
    print(y,round(tot),[(r,out[r][y]["pop"],out[r][y]["le"],out[r][y]["leS"],out[r][y]["u5"],out[r][y]["gdp"],out[r][y]["gdpS"]) for r in ["china","india","britain","wafrica","japan"]])
