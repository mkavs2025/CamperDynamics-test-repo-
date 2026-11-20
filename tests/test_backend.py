import importlib.util, json, os, tempfile, threading, unittest, urllib.request, urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer

class BackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory();os.environ['CAMPER_DB_PATH']=str(Path(cls.tmp.name)/'test.sqlite3')
        spec=importlib.util.spec_from_file_location('camper_app',Path(__file__).resolve().parents[1]/'start.py');cls.app=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.app);cls.app.initialize()
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),cls.app.Handler);cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start();cls.base='http://127.0.0.1:'+str(cls.server.server_port)
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.tmp.cleanup()
    def request(self,path,data,origin=None):
        headers={'Content-Type':'application/json'}
        if origin:headers['Origin']=origin
        request=urllib.request.Request(self.base+path,json.dumps(data).encode(),headers)
        try:
            with urllib.request.urlopen(request) as response:return response.status,json.load(response)
        except urllib.error.HTTPError as error:return error.code,json.load(error)
    def test_server_ignores_client_prices(self):
        code,p=self.request('/api/estimate',{'config':{'model':'basecamp','addons':[]},'total':1});self.assertEqual(code,200);self.assertEqual(p['total'],823640)
    def test_incompatible_accessory_rejected(self):
        code,_=self.request('/api/estimate',{'config':{'model':'backpack','addons':['awning']}});self.assertEqual(code,400)
    def test_no_unapproved_odyssey(self):
        code,_=self.request('/api/estimate',{'config':{'model':'odyssey'}});self.assertEqual(code,400)
    def test_quote_requires_consent(self):
        code,_=self.request('/api/quotes',{'config':{},'contact':{'name':'Demo','email':'demo@example.com'}});self.assertEqual(code,400)
    def test_valid_quote_is_persisted(self):
        code,p=self.request('/api/quotes',{'config':{},'contact':{'name':'Demo tester','email':'demo@example.com','note':'Synthetic test only'},'consent':True});self.assertEqual(code,201);self.assertEqual(p['status'],'saved_not_sent')
        import sqlite3
        with sqlite3.connect(self.app.DATABASE) as db:self.assertEqual(db.execute('SELECT count(*) FROM enquiries WHERE id=?',(p['id'],)).fetchone()[0],1)
    def test_interior_saved_without_losing_customization(self):
        config = {'interior': {'theme': 'green', 'finishes': {'walls': '#AABBCC'}, 'items': {'bed': {'enabled': False}, 'tap': {'color': '#ff0022'}}, 'tableShape': 'round'}}
        code, result = self.request('/api/builds', {'config': config})
        self.assertEqual(code, 201)
        import sqlite3
        with sqlite3.connect(self.app.DATABASE) as db:
            saved = json.loads(db.execute('SELECT config FROM builds WHERE id=?', (result['id'],)).fetchone()[0])
        self.assertEqual(saved['interior']['theme'], 'green')
        self.assertFalse(saved['interior']['items']['bed']['enabled'])
        self.assertEqual(saved['interior']['items']['tap']['color'], '#ff0022')
        self.assertEqual(saved['interior']['finishes']['walls'], '#aabbcc')
        self.assertEqual(saved['interior']['tableShape'], 'round')
    def test_invalid_interior_values_normalized(self):
        code, p = self.request('/api/estimate', {'config': {'interior': {'theme': 'invalid', 'items': {'bed': {'enabled': 'false'}}, 'finishes': {'walls': 'url(evil)'}}}})
        self.assertEqual(code, 200)
        self.assertEqual(p['state']['interior']['theme'], 'beige')
        self.assertTrue(p['state']['interior']['items']['bed']['enabled'])
    def test_bad_email_rejected(self):
        code,_=self.request('/api/quotes',{'config':{},'contact':{'name':'Demo','email':'bad'},'consent':True});self.assertEqual(code,400)
    def test_cross_origin_rejected(self):
        code,_=self.request('/api/builds',{'config':{}},'https://untrusted.example');self.assertEqual(code,403)
    def test_frontend_backend_prices_match(self):
        filename=os.environ.get('CAMPER_PRICE_VECTOR_PATH')
        if not filename:self.skipTest('Run config.test.mjs with CAMPER_PRICE_VECTOR_PATH for cross-runtime vectors')
        for item in json.loads(Path(filename).read_text()):self.assertEqual(self.app.estimate(item['config'])['total'],item['total'])
if __name__=='__main__':unittest.main()
