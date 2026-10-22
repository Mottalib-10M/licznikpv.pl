# 4/6 Ceny RCE PSE (api.raporty.pse.pl, dane publiczne) z 12 miesięcy -> rce-raw.json. Bieżącą aktualizację robi scripts/update-data.mjs.
import json,urllib.request,urllib.parse,calendar
out={}
for (y,m) in [(2025,10),(2025,11),(2025,12)]+[(2026,i) for i in range(1,10)]:
  last=calendar.monthrange(y,m)[1]
  f=f"business_date ge '{y}-{m:02d}-01' and business_date le '{y}-{m:02d}-{last}'"
  u='https://api.raporty.pse.pl/api/rce-pln?'+urllib.parse.urlencode({'$filter':f,'$select':'dtime,period,rce_pln,business_date','$first':'5000'})
  vals=[]
  while u:
    d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=120))
    vals+=d['value']; u=d.get('nextLink') or d.get('@odata.nextLink')
  out[f'{y}-{m:02d}']=vals; print(y,m,len(vals),vals[0],flush=True)
json.dump(out,open('rce-raw.json','w'))
