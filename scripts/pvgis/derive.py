# 5/6 Kształty godzinowe, współczynniki orientacji, statystyki RCE -> derived.json.
import json,datetime as dt
from zoneinfo import ZoneInfo
W=ZoneInfo('Europe/Warsaw')
H=json.load(open('hourly.json'))
shapes={}
for asp,rows in H.items():
  acc=[[0.0]*24 for _ in range(12)]
  for t,p in rows:
    u=dt.datetime.strptime(t,'%Y%m%d:%H%M').replace(tzinfo=dt.timezone.utc).astimezone(W)
    acc[u.month-1][u.hour]+=p
  shapes[asp]=[[round(x/sum(m),4) for x in m] for m in acc]
O=json.load(open('orient.json'))
base=O['35,0']
fac={k:[round(v[i]/base[i],4) for i in range(12)] for k,v in O.items()}
R=json.load(open('rce-raw.json'))
rce={}
for mon,vals in R.items():
  s=[0.0]*24;n=[0]*24
  for v in vals:
    h=int(v['period'][:2]); s[h]+=max(0,v['rce_pln']); n[h]+=1
  hr=[round(s[i]/n[i],2) for i in range(24)]
  m=int(mon[5:])
  sh=shapes['0'][m-1]
  pvw=sum(hr[i]*sh[i] for i in range(24))
  neg=sum(1 for v in vals if v['rce_pln']<0)/4
  rce[mon]={'h':hr,'pvw':round(pvw,2),'avg':round(sum(max(0,v['rce_pln']) for v in vals)/len(vals),2),'negH':neg}
  print(mon,rce[mon]['avg'],round(pvw,2),neg)
json.dump({'shapes':shapes,'orient':fac,'rce':rce},open('derived.json','w'))
print({k:round(sum(O[k])/sum(base),3) for k in O})
