import json,glob,sys
sys.path.insert(0,'tools/i18n');from lex import *
FILES=sorted(glob.glob('js/*.js'))+sorted(glob.glob('data/*.js'))+['index.html','about.html']
K={}
for f in FILES:
    s=open(f).read();sp=html_keys(s) if f.endswith('.html') else keys(s)
    for a,b,k in sp: K.setdefault(s[a:b],f)
L=list(K);json.dump(L,open('tools/i18n/keys.json','w'),ensure_ascii=False)
print(len(L),sum(map(len,L)))
