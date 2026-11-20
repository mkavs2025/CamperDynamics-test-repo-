"""Owner-only local CLI to export enquiries. Never served through the website."""
import csv, json, sqlite3, argparse
from pathlib import Path
from start import DATABASE
parser=argparse.ArgumentParser()
parser.add_argument('--output',default='enquiries.csv')
args=parser.parse_args()
if not DATABASE.exists():
    raise SystemExit('No database yet. Run start.py and save an enquiry first.')
with sqlite3.connect(DATABASE) as db, open(args.output,'w',newline='',encoding='utf-8-sig') as output:
    writer=csv.writer(output)
    writer.writerow(['reference','name','email','phone','note','model','configuration','total_INR','created_at'])
    for identifier,raw_contact,config,raw_price,consent,date in db.execute('SELECT * FROM enquiries ORDER BY created_at DESC'):
        c=json.loads(raw_contact);p=json.loads(raw_price);s=json.loads(config)
        safe=lambda v: "'"+str(v) if str(v).startswith(('=','+','-','@')) else str(v)
        writer.writerow([safe(v) for v in [identifier,c['name'],c['email'],c['phone'],c['note'],s['model'],config,p['total'],date]])
print('Saved '+args.output)
