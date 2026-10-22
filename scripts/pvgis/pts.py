# 1/6 Punkty gmin (TERYT, Wikidata CC0) -> pts.json. Kolejność: pts, fetch, shape, rce, derive, build. Uruchamiać w katalogu roboczym poza repo.
import csv,json,statistics
rows=list(csv.DictReader(open('../dl/teryt.csv')))
def co(s):
  a=s.replace('Point(','').replace(')','').split(); return float(a[1]),float(a[0])
pts={}
for r in rows:
  t=r['teryt']
  if (len(t)==7 and t[-1] in '123') or len(t)==4 or len(t)==2:
    lat,lon=co(r['coord'])
    if not (48.9<lat<55 and 14<lon<24.3): continue
    d=pts.setdefault(t,{'t':t,'names':set(),'c':[]}); d['names'].add(r['label']); d['c'].append((lat,lon))
out=[]
for t,d in pts.items():
  lat=statistics.mean(c[0] for c in d['c']); lon=statistics.mean(c[1] for c in d['c'])
  out.append({'t':t,'n':sorted(d['names'])[0],'lat':round(lat,4),'lon':round(lon,4)})
json.dump(out,open('pts.json','w'),ensure_ascii=False)
print(len(out))
