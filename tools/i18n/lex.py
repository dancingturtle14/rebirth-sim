import re,sys,json
CJK=re.compile(r'[\u3000-\u9fff\uff00-\uffef\u2e80-\u2fff]')
def segs(src):
    """yield (start,end) of literal text segments in JS source"""
    i=0;n=len(src);out=[]
    def tmpl(i):
        # i at char after backtick
        s=i
        while i<n:
            c=src[i]
            if c=='\\': i+=2;continue
            if c=='`': out.append((s,i,'`'));return i+1
            if c=='$' and src[i+1]=='{':
                out.append((s,i,'`'));i=code(i+2,'}');s=i;continue
            i+=1
        return i
    def strl(i,q):
        s=i
        while src[i]!=q:
            if src[i]=='\\': i+=1
            i+=1
        out.append((s,i,q));return i+1
    def code(i,end):
        depth=0
        while i<n:
            c=src[i]
            if c in '"\'': i=strl(i+1,c);continue
            if c=='`': i=tmpl(i+1);continue
            if src.startswith('//',i) : i=src.find('\n',i);i=n if i<0 else i;continue
            if src.startswith('/*',i): i=src.find('*/',i)+2;continue
            if c=='{': depth+=1
            if c=='}':
                if depth==0 and end=='}': return i+1
                depth-=1
            i+=1
        return i
    code(0,None);return out
def keys(src):
    return [(a,b,k) for a,b,k in segs(src) if CJK.search(src[a:b])]
if __name__=='__main__':
    allk={}
    for f in sys.argv[1:]:
        s=open(f).read()
        for a,b,k in keys(s): allk.setdefault(s[a:b],f)
    json.dump(allk,open('/tmp/keys.json','w'),ensure_ascii=False,indent=0)
    print(len(allk),sum(len(k) for k in allk))

def html_keys(src):
    """returns list of (a,b) spans: text nodes, attr values, inline script literals"""
    out=[];i=0
    for m in re.finditer(r'<script>(.*?)</script>',src,re.S):
        off=m.start(1)
        out+=[(a+off,b+off,k) for a,b,k in keys(m.group(1))]
    masked=re.sub(r'<script>.*?</script>',lambda m:' '*len(m.group(0)),src,flags=re.S)
    for m in re.finditer(r'>([^<]+)<',masked):
        t=m.group(1)
        if CJK.search(t):
            s=m.start(1)+len(t)-len(t.lstrip());e=m.end(1)-(len(t)-len(t.rstrip()))
            out.append((s,e,'h'))
    for m in re.finditer(r'(?:title|placeholder|aria-label|alt|content)="([^"]*)"',masked):
        if CJK.search(m.group(1)): out.append((m.start(1),m.end(1),'"'))
    return sorted(out)
