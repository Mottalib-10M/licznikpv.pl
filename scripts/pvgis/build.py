# 6/6 Składa public/data/miejsca.json i src/data/pv-model.json z wyników poprzednich kroków.
import json,os,statistics as st,collections
W={'02':'dolnośląskie','04':'kujawsko-pomorskie','06':'lubelskie','08':'lubuskie','10':'łódzkie','12':'małopolskie','14':'mazowieckie','16':'opolskie','18':'podkarpackie','20':'podlaskie','22':'pomorskie','24':'śląskie','26':'świętokrzyskie','28':'warmińsko-mazurskie','30':'wielkopolskie','32':'zachodniopomorskie'}
pts={p['t']:p for p in json.load(open('pts.json'))}
pv={t:json.load(open(f'pv/{t}.json')) for t in pts}
dbs=collections.Counter(v['db'] for v in pv.values()); print(dbs)
powname={t:p['n'] for t,p in pts.items() if len(t)==4}
gm=[t for t in pts if len(t)==7]
names=collections.Counter((t[:4],pts[t]['n']) for t in gm)
out=[]
for t in sorted(gm):
  n=pts[t]['n']; pw=t[:4]
  if names[(pw,n)]>1 and t[-1]=='2': n=n+' (gm. wiejska)'
  pn=powname.get(pw,'')
  city= int(pw[2:])>=61
  lab = n if city else f"{n}, {pn.replace('powiat ','pow. ')}" if pn else n
  out.append([lab,t,round(pv[t]['y']),list(W).index(t[:2])])
gmpow=set(t[:4] for t in gm)
for t,pn in powname.items():
  if int(t[2:])>=61 and t in gmpow: continue
  lab = f"{pn}, woj. {W[t[:2]]} (cały powiat)" if pn.startswith('powiat') else f"{pn} (powiat)"
  out.append([lab,t,round(pv[t]['y']),list(W).index(t[:2])])
out.sort(key=lambda r:(r[0].lower()))
print(len(out), out[:3])
# woj monthly shapes
shape={}
stats={}
for w in W:
  ms=[pv[t]['m'] for t in gm if t[:2]==w]
  ys=[pv[t]['y'] for t in gm if t[:2]==w]
  sh=[st.mean(m[i]/sum(m) for m in ms) for i in range(12)]
  shape[w]=[round(x,5) for x in sh]
  stats[w]={'name':W[w],'n':len(ys),'mean':round(st.mean(ys)),'min':round(min(ys)),'max':round(max(ys)),'minN':pts[min((t for t in gm if t[:2]==w),key=lambda t:pv[t]['y'])]['n'],'maxN':pts[max((t for t in gm if t[:2]==w),key=lambda t:pv[t]['y'])]['n']}
ally=[pv[t]['y'] for t in gm]
print(min(ally),max(ally),st.mean(ally))
for w,s in stats.items(): print(w,s)
# errors of using woj shape vs own
err=max(abs(sum(pv[t]['m'][i] for i in range(12))-pv[t]['y']) for t in gm); print('sum check',err)
D=json.load(open('derived.json'))
json.dump({'places':out},open('miejsca.json','w'),ensure_ascii=False,separators=(',',':'))
model={'voivodeships':[{'code':w,**stats[w],'shape':shape[w]} for w in W],'hourShape':D['shapes'],'orient':D['orient'],
 'national':{'gminas':len(gm),'powiats':len(powname),'min':round(min(ally)),'max':round(max(ally)),'mean':round(st.mean(ally)),'minN':pts[min(gm,key=lambda t:pv[t]['y'])]['n'],'maxN':pts[max(gm,key=lambda t:pv[t]['y'])]['n']},
 'meta':{'api':'PVGIS 5.3 PVcalc','db':'PVGIS-SARAH3','loss':14,'angle':35,'aspect':0,'retrieved':'2026-10-22','shapeSite':'Warszawa 52.23N 21.01E, seriescalc 2019–2023'}}
json.dump(model,open('pv-model.json','w'),ensure_ascii=False,separators=(',',':'))
# featured cities
for c in ['Warszawa','Kraków','Łódź','Wrocław','Poznań','Gdańsk','Szczecin','Bydgoszcz','Lublin','Białystok','Katowice','Rzeszów','Olsztyn','Kielce','Opole','Zielona Góra']:
  r=[o for o in out if o[0]==c]; print(c,r[:1])
