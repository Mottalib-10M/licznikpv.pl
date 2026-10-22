# 2/6 Produkcja roczna i miesięczna PVGIS 5.3 (JRC, licencja Komisji Europejskiej, ponowne użycie z podaniem źródła) dla każdego punktu: 1 kWp, straty 14 %, nachylenie 35°, południe.
import json,urllib.request,time,os,concurrent.futures as cf
pts=json.load(open('pts.json'))
os.makedirs('pv',exist_ok=True)
def get(p):
  f=f"pv/{p['t']}.json"
  if os.path.exists(f): return 0
  u=f"https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat={p['lat']}&lon={p['lon']}&peakpower=1&loss=14&angle=35&aspect=0&outputformat=json"
  for k in range(5):
    try:
      d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
      m=[x['E_m'] for x in d['outputs']['monthly']['fixed']]
      json.dump({'m':m,'y':d['outputs']['totals']['fixed']['E_y'],'db':d['inputs']['meteo_data']['radiation_db']},open(f,'w')); time.sleep(0.5); return 1
    except Exception as e:
      time.sleep(3*(k+1))
  print('FAIL',p['t'],flush=True); return 0
with cf.ThreadPoolExecutor(3) as ex:
  n=sum(ex.map(get,pts))
print('done',n)
