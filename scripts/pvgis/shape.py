# 3/6 Profile godzinowe PVGIS (Warszawa, 2019-2023) i współczynniki orientacji/nachylenia -> hourly.json, orient.json.
import json,urllib.request,time
res={}
for asp in (0,-45,45,-90,90):
  u=f"https://re.jrc.ec.europa.eu/api/v5_3/seriescalc?lat=52.23&lon=21.01&pvcalculation=1&peakpower=1&loss=14&angle=35&aspect={asp}&startyear=2019&endyear=2023&outputformat=json"
  d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=180))
  res[asp]=[(h['time'],h['P']) for h in d['outputs']['hourly']]
  print(asp,len(res[asp]),res[asp][12],flush=True); time.sleep(1)
json.dump(res,open('hourly.json','w'))
fac={}
for ang in (10,20,30,35,40,45,90):  # 90° : panele pionowe (balkon), dodane 2026-10-22
  for asp in (0,-45,45,-90,90):
    u=f"https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=52.23&lon=21.01&peakpower=1&loss=14&angle={ang}&aspect={asp}&outputformat=json"
    d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
    fac[f'{ang},{asp}']=[x['E_m'] for x in d['outputs']['monthly']['fixed']]; time.sleep(0.6)
json.dump(fac,open('orient.json','w')); print('ok')
