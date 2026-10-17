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
def agg(reg,y,D,gap=60,extend=0):
    tot=0;w=0;v=0
    for c in R[reg]:
        p=val(POP.get(c),0 if y==1 else y,500,500) or 0;tot+=p
        x=val(D.get(c),y,gap,extend)
        if x is not None:w+=p;v+=p*x
    return (v/w if w else None),(w/tot if tot else 0)
out={}
for reg in R:
    out[reg]={}
    for y in A:
        yy=0 if y==1 else y
        pop=sum((val(POP.get(c),yy,500,500) or 0) for c in R[reg])
        c={"pop":round(pop/1e6,3)}
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
        l,cv=agg(reg,y,LITM if y>=1975 else LITH,40,5)
        if l and cv>=.5:c["lit"]=round(l/100,3);c["litS"]="unesco" if y>=1975 else "vz"
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
