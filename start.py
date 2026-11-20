"""Camper Dynamics local application server. Python 3.10+, standard library only."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse, json, sqlite3, uuid, re, os, webbrowser
from datetime import datetime, timezone
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'studio'
CATALOG = json.loads((PUBLIC / 'catalog.json').read_text(encoding='utf-8'))
INTERIOR = json.loads((PUBLIC / 'interior-options.json').read_text(encoding='utf-8'))
DATABASE = Path(os.environ.get('CAMPER_DB_PATH', str(ROOT / 'data' / 'camper.sqlite3')))

def initialize():
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DATABASE) as db:
        db.execute('CREATE TABLE IF NOT EXISTS builds (id TEXT PRIMARY KEY, config TEXT NOT NULL, estimate TEXT NOT NULL, created_at TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, contact TEXT NOT NULL, config TEXT NOT NULL, estimate TEXT NOT NULL, consent INTEGER NOT NULL, created_at TEXT NOT NULL)')

def normalize_interior(raw, result):
    raw = raw if isinstance(raw, dict) else {}
    theme = raw.get('theme') if isinstance(raw.get('theme'), str) and raw.get('theme') in INTERIOR['themes'] else 'beige'
    finishes = dict(INTERIOR['themes'][theme]['colors'])
    colors = raw.get('finishes') if isinstance(raw.get('finishes'), dict) else {}
    valid_hex = lambda value: isinstance(value, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', value) is not None
    for role in finishes:
        if valid_hex(colors.get(role)):
            finishes[role] = colors[role].lower()
    if not raw.get('theme') and not raw.get('finishes'):
        finishes['wood'] = next(x['hex'] for x in CATALOG['woods'] if x['id'] == result['wood']).lower()
        finishes['upholstery'] = next(x['hex'] for x in CATALOG['fabrics'] if x['id'] == result['fabric']).lower()
    raw_items = raw.get('items') if isinstance(raw.get('items'), dict) else {}
    items = {}
    for feature in INTERIOR['features']:
        item = raw_items.get(feature['id'])
        item = item if isinstance(item, dict) else {}
        items[feature['id']] = {'enabled': item.get('enabled') if isinstance(item.get('enabled'), bool) else feature['default'], 'color': item['color'].lower() if valid_hex(item.get('color')) else None}
    value = {'theme': theme, 'finishes': finishes, 'items': items}
    for key, allowed in INTERIOR['styles'].items():
        value[key] = raw.get(key) if raw.get(key) in allowed else allowed[0]
    return value

def normalize(raw):
    if not isinstance(raw, dict):
        raise ValueError('Configuration must be an object')
    model = raw.get('model', 'basecamp')
    if model not in ('basecamp', 'backpack'):
        raise ValueError('Unsupported conversion')
    result = {'model': model}
    for key, group, fallback in [('color','colors','sand'),('wood','woods','beige'),('fabric','fabrics','linen')]:
        value = raw.get(key, fallback)
        if not any(x['id'] == value for x in CATALOG[group]):
            raise ValueError('Invalid ' + key)
        result[key] = value
    addons = raw.get('addons', [])
    if not isinstance(addons, list) or len(addons) > 20 or not all(isinstance(v, str) for v in addons):
        raise ValueError('Invalid accessories')
    for addon in addons:
        option = next((x for x in CATALOG['addons'] if x['id'] == addon), None)
        if not option or model not in option['models']:
            raise ValueError('Accessory is incompatible with the selected conversion')
    result['addons'] = [x['id'] for x in CATALOG['addons'] if x['id'] in addons]
    result['layout'] = 'storage' if raw.get('layout') == 'storage' else 'galley'
    result['interior'] = normalize_interior(raw.get('interior'), result)
    return result

def estimate(raw):
    config = normalize(raw)
    model = next(x for x in CATALOG['models'] if x['id'] == config['model'])
    items = [{'id': model['id'], 'name': model['name'] + ' conversion', 'price': model['price']}]
    for key, group in [('color','colors'), ('wood','woods'), ('fabric','fabrics')]:
        option = next(x for x in CATALOG[group] if x['id'] == config[key])
        if option['price']:
            items.append({'id': key, 'name': option['name'], 'price': option['price']})
    items += [{'id': x['id'], 'name': x['name'], 'price': x['price']} for x in CATALOG['addons'] if x['id'] in config['addons']]
    subtotal = sum(x['price'] for x in items)
    tax = int(subtotal * CATALOG['taxRate'] + .5)
    return {'state': config, 'items': items, 'subtotal': subtotal, 'tax': tax, 'total': subtotal + tax, 'currency': 'INR', 'priceStatus': CATALOG['priceStatus']}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)
    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        super().end_headers()
    def reply(self, code, value):
        data = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/health':
            return self.reply(200, {'ok': True, 'storage': 'sqlite', 'priceVersion': CATALOG['version']})
        if path.startswith('/api/'):
            return self.reply(404, {'error': 'Not found'})
        return super().do_GET()
    def do_POST(self):
        path = urlparse(self.path).path
        if path not in ('/api/estimate', '/api/builds', '/api/quotes'):
            return self.reply(404, {'error': 'Not found'})
        # Same-origin JSON only. Keep this local server bound to loopback.
        origin = self.headers.get('Origin')
        if origin and urlparse(origin).netloc != self.headers.get('Host'):
            return self.reply(403, {'error': 'Cross-origin requests are not allowed'})
        if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            return self.reply(415, {'error': 'Expected application/json'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if size <= 0 or size > 32768:
                return self.reply(413, {'error': 'Invalid request size'})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict):
                raise ValueError('Invalid request')
            price = estimate(data.get('config', {}))
            if path == '/api/estimate':
                return self.reply(200, price)
            now = datetime.now(timezone.utc).isoformat()
            if path == '/api/builds':
                identifier = 'BUILD-' + uuid.uuid4().hex[:12].upper()
                with sqlite3.connect(DATABASE) as db:
                    db.execute('INSERT INTO builds VALUES (?, ?, ?, ?)', (identifier, json.dumps(price['state']), json.dumps(price), now))
                return self.reply(201, {'id': identifier, 'estimate': price})
            if data.get('consent') is not True:
                raise ValueError('Consent is required')
            raw = data.get('contact')
            if not isinstance(raw, dict):
                raise ValueError('Contact details are required')
            contact = {}
            for key, limit in [('name',80),('email',150),('phone',30),('note',1500)]:
                value = raw.get(key, '')
                if not isinstance(value, str) or len(value) > limit:
                    raise ValueError('Invalid ' + key)
                contact[key] = value.strip()
            if not contact['name'] or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', contact['email']):
                raise ValueError('A name and valid email are required')
            identifier = 'QUOTE-' + uuid.uuid4().hex[:12].upper()
            with sqlite3.connect(DATABASE) as db:
                db.execute('INSERT INTO enquiries VALUES (?, ?, ?, ?, ?, ?)', (identifier, json.dumps(contact), json.dumps(price['state']), json.dumps(price), 1, now))
            return self.reply(201, {'id': identifier, 'estimate': price, 'status': 'saved_not_sent'})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            return self.reply(400, {'error': str(exc)})
        except sqlite3.Error:
            return self.reply(503, {'error': 'Storage is temporarily unavailable'})

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    initialize()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    url = f'http://127.0.0.1:{args.port}'
    print('Camper Dynamics is running at ' + url)
    print('Keep this window open. Press Ctrl+C to stop.')
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
