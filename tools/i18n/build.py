"""Build the English version into en/ from the Chinese sources + tools/i18n/en.json.
Chinese files are never modified. Run: python3 tools/i18n/build.py"""
import json,glob,os,re,sys,shutil
sys.path.insert(0,os.path.dirname(__file__));from lex import keys,html_keys,CJK
os.chdir(os.path.join(os.path.dirname(__file__),'..','..'))
T=json.load(open('tools/i18n/en.json'));V='42'
def esc(t,k):
    if k=='"': return t.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n')
    if k=="'": return t.replace('\\','\\\\').replace("'","\\'").replace('\n','\\n')
    if k=='`': return t.replace('`','\\`').replace('${','\\${')
    return t
miss=set()
HKS={"陳":"Chan","李":"Lee","黃":"Wong","張":"Cheung","周":"Chow","林":"Lam","何":"Ho","梁":"Leung"}
OVR={'hk':HKS,'shanghai':HKS,'korea':{"李":"Lee","崔":"Choi","鄭":"Jeong"},'china':{"志強":"Zhiqiang"},'mingqing':{"錢":"Qian"}}
CTX=re.compile(r'(?m)^\s*([a-z]+):\{n:"|\{id:"([a-z0-9]+)"')
def tr(s,spans,f=''):
    ctxs=[(m.start(),m.group(1) or m.group(2)) for m in CTX.finditer(s)] if f in('data/regions.js','data/eras.js') else []
    for a,b,k in sorted(spans,reverse=True):
        key=s[a:b];c=None
        for p,n in ctxs:
            if p<a: c=n
        t=OVR.get(c,{}).get(key) if k!='h' else None
        if t is None:
            if key not in T: miss.add(key);continue
            t=T[key]
        s=s[:a]+esc(t,k)+s[b:]
    return s
PATCH=[ # (file, old, new) applied to EN output; each must match
 ('js/engine.js','`BCE ${1-y}`','`${1-y} BCE`'),
 ('js/world.js','`BCE ${-y}`','`${-y} BCE`'),
 ('js/engine.js','name=(heir&&heir.sur&&N.sur.length?heir.sur:N.sur.length?pick(N.sur,R):"")+pick(N[sex],R)',
  '_su=(heir&&heir.sur&&N.sur.length?heir.sur:N.sur.length?pick(N.sur,R):""),_gv=pick(N[sex],R),name=_su?(era.id==="london"||era.pack==="london"?_gv+" "+_su:_su+" "+_gv):_gv'),
 ('js/engine.js','return`${(v/1e4).toFixed(v>=1e5?0:1)}0,000 HKD`','return`${Math.round(v).toLocaleString("en")} HKD`'),
 ('js/engine.js','pick(era.place,R)+" (countryside)"','"countryside near "+pick(era.place,R)'),
 ('js/ui.js','["Place",`${P.place} (${P.urban?"City":"Countryside"})`]','["Place",P.place+(P.urban?" (city)":"")]'),
 ('js/meaning.js','${up(p.wea,cf.sbWea)} ${Math.round(c)}','${Math.round(c)} points ${up(p.wea,cf.sbWea)}'),
 ('js/ui.js','x.font="14px Cubic";x.fillStyle="#a99fc0";x.fillText("A pixel-art life simulator",120,256)','x.font="11px Cubic";x.fillStyle="#a99fc0";void 0'),
 ('js/ui.js','n.slice(0,2),X,y)','(n==="Reputation"?"Rep.":n.slice(0,7)),X,y)'),
 ('js/ui.js','x.fillText(`${s.era.rname||s.era.name} ${s.age}','x.fillText(`${(s.era.rname||s.era.name).replace(/^The /,"").slice(0,15)} ${s.age}'),
 ('js/ui.js','/夭折/.test(e.t)','/before turning five/.test(e.t)'),
 ('js/ui.js','World.ylab(a)+(a>=1800?"":"c. ")','(a>=1800?World.ylab(a)+"s":"c. "+World.ylab(a))'),
 ('js/ui.js','rebirth-sim/?seed=','rebirth-sim/en/?seed='),
]
REPL=[ # regex patches
 ('js/ui.js',r'const G=t=>!SET\.gentle\?t:[^;]*;',
  'const G=t=>!SET.gentle?t:t.replace(/Died in infancy|Died of illness as a child/g,"Died young").replace(/died before turning five\\. May they rest in peace\\./g,"passed away before turning five.").replace(/Killed in battle|Killed in war/g,"Lost in the war").replace(/Died in a famine/g,"Lost in the famine").replace(/Died of plague/g,"Lost to the epidemic").replace(/buried alive|massacred|were killed|was killed/g,"lost their lives").replace(/a terrible massacre/g,"terrible loss of life").replace(/cannibalism/g,"extreme famine");'),
 ('js/ui.js',r'px Cubic"',"px \\'Pixelify Sans\\',Cubic\""),
 ('js/ui.js',r'X\+34',"X+58"),
 ('*',r'"rebirth_(?!set")',r'"rebirth_en_'),
]
os.makedirs('en/js',exist_ok=True);os.makedirs('en/data',exist_ok=True)
done=set()
for f in sorted(glob.glob('js/*.js')+glob.glob('data/*.js')):
    s=open(f).read();sp=keys(s)
    if not sp: continue
    o=tr(s,sp,f)
    for pf,a,b in PATCH:
        if pf==f:
            assert a in o,(f,a);o=o.replace(a,b)
    for pf,a,b in REPL:
        if pf in(f,'*'):
            o2=re.sub(a,b.replace('\\\'',"'") if pf!='*' else b,o)
            assert o2!=o or pf=='*',(f,a);o=o2
    open('en/'+f,'w').write(o);done.add(f)
HEAD_EN='<script>(function(){try{var q=new URLSearchParams(location.search),l=q.get("lang");if(l)localStorage.setItem("rebirth_lang",l);if(l==="zh"){q.delete("lang");var s=q.toString(),p=location.pathname.split("/").pop();location.replace("../"+(p==="index.html"?"":p)+(s?"?"+s:""))}}catch(e){}})()</script>'
SW_EN='<a class="langsw" href="?lang=zh" lang="zh-Hant">中文</a>'
for f in ['index.html','about.html']:
    s=open(f).read();o=tr(s,html_keys(s))
    o=o.replace('lang="zh-Hant-HK"','lang="en"')
    o=re.sub(r'<script>\(function\(\)\{try\{var q=new URLSearchParams.*?</script>',HEAD_EN,o,count=1,flags=re.S)
    o=re.sub(r'<a class="langsw"[^>]*>[^<]*</a>',SW_EN,o)
    o=o.replace('href="style.css','href="../style.css').replace('href="fonts/','href="../fonts/')
    o=o.replace('</head>','<link rel="preload" href="../fonts/PixelifySans.woff" as="font" type="font/woff" crossorigin><link rel="stylesheet" href="../style-en.css?v=%s"></head>'%V,1)
    o=re.sub(r'src="((?:js|data)/[^"?]+)',lambda m:'src="'+(m.group(1) if m.group(1) in done else '../'+m.group(1)),o)
    open('en/'+f,'w').write(o)
# leftover CJK check in EN output literals (comments/regex excluded by lexer)
left=[]
for f in glob.glob('en/**/*.js',recursive=True):
    s=open(f).read();left+=[(f,s[a:b]) for a,b,k in keys(s)]
for f in ['en/index.html','en/about.html']:
    s=open(f).read();left+=[(f,s[a:b]) for a,b,k in html_keys(s) if s[a:b]!='中文']
print('translated files',len(done),'missing keys',len(miss),'leftover CJK literals',len(left))
for x in list(miss)[:10]+left[:10]: print(' ',x)
sys.exit(1 if miss or left else 0)
