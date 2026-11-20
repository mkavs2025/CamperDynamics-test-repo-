import {validateSlot,bookingTransition} from './booking-rules.js';
import {normalize,estimate} from '/studio/config.js';
import {TRAIL} from '/studio/trail.js';
const isPreviewDomain = ['127.0.0.1','localhost'].includes(location.hostname) || location.hostname.endsWith('.vercel.app') || location.hostname.includes('vercel');
const preview = isPreviewDomain || location.search.includes('preview=1') || location.search.includes('demo=1'), key='cd-platform-preview-v1';
const initial=()=>({records:[],bookings:[],rewards:[],settings:{availability:{days:[1,2,3,4,5,6],times:['10:00','11:00','14:00','15:00','16:00'],blocked:[]},promotion:{active:false}},shares:[]});
const read=()=>{try{return JSON.parse(localStorage.getItem(key))||initial()}catch{return initial()}};const write=v=>localStorage.setItem(key,JSON.stringify(v));
const id=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
export const isPreview=preview;
export async function api(path,{method='GET',body}={}){
 if(preview)return localApi(path,method,body);
 try {
  const r=await fetch('/api'+path,{method,headers:body instanceof FormData?{}:{'Content-Type':'application/json'},body:body?body instanceof FormData?body:JSON.stringify(body):undefined});
  const data=await r.json();
  if(!r.ok){
    if(r.status===503||r.status===401||r.status===404)return localApi(path,method,body);
    throw Error(data.error||'Request failed');
  }
  return data;
 } catch(e){
  return localApi(path,method,body);
 }
}
async function localApi(path,method,b){let d=read();const save=()=>write(d),find=x=>d.records.find(r=>r.id===x),add=(kind,title,data)=>{const r={id:id(),user_id:'preview-device',kind,title,data,version:1,created_at:now(),updated_at:now()};d.records.unshift(r);save();return r;};
 if(path==='/catalog'){const c=await fetch('/studio/catalog.json').then(r=>r.json()),saved=d.settings.catalog;return saved?{...saved,addons:saved.addons.filter(a=>c.addons.some(b=>b.id===a.id)),colors:c.colors.map(b=>({...b,...saved.colors?.find(x=>x.id===b.id)}))}:c;}
 if(path==='/faq')return d.settings.faq||{items:[]};
 if(path==='/session')return {user:{id:'preview-device',name:'Device preview',email:'preview@device.local'},admin:true,preview:true,storage:'Device-only preview',notifications:'In-app only'};
 if(path.startsWith('/workspace'))return d;
 if(path==='/availability')return {...d.settings.availability,occupied:d.bookings.filter(b=>!['cancelled','completed'].includes(b.status)).map(b=>b.slot)};
 if(path==='/records'&&method==='POST'){let data=structuredClone(b.data);if(b.kind==='proposal')data={...data,createdAt:now(),status:'Illustrative proposal'};if(b.kind==='project')data={...data,stage:'Requirements',updates:[],photos:[],approvals:[]};return add(b.kind,b.title,data);}
 if(path.startsWith('/records/')){const r=find(path.split('/')[2]);if(!r)throw Error('Record unavailable');if(method==='GET')return r;if(method==='DELETE'){d.records=d.records.filter(x=>x.id!==r.id);save();return {ok:true}}if(r.kind==='proposal')throw Error('Create a new proposal revision');if(r.version!==b.version)throw Error('Version conflict');if(r.kind==='project'){if(b.action==='approve'){if(!r.data.design||r.data.designRevision!==b.designRevision)throw Error('Review the current design revision first');if(r.data.approvals.some(a=>a.designRevision===r.data.designRevision))throw Error('This revision is already approved');r.data.approvals.push({stage:r.data.stage,at:now(),designRevision:r.data.designRevision,buildVersion:r.data.design.buildVersion});}else{r.data.stage=b.data.stage||r.data.stage;if(r.data.stage==='Design approval'){const build=find(r.data.buildId);if(!build)throw Error('Linked build unavailable');const cat=d.settings.catalog||await fetch('/studio/catalog.json').then(r=>r.json()),config=normalize(build.data.config,cat);r.data.designRevision=(r.data.designRevision||0)+1;r.data.design={config,estimate:estimate(config,cat),revision:r.data.designRevision,buildVersion:build.version,createdAt:now(),catalogRevision:cat.revision||1};}if(b.data.update)r.data.updates.push({text:b.data.update,at:now(),stage:r.data.stage});r.data.photos=b.data.photos||r.data.photos;}}else r.data={...r.data,...b.data,history:[...(r.data.history||[]),{config:r.data.config,at:r.updated_at,version:r.version,title:r.title}].slice(-20)};r.title=b.title||r.title;r.version++;r.updated_at=now();save();return r;}
 if(path==='/bookings'&&method==='POST'){const slot=validateSlot(b.slot,d.settings.availability);if(d.bookings.some(x=>x.slot===slot&&!['cancelled','completed'].includes(x.status)))throw Error('That time is reserved');if(!b.consent)throw Error('Consent required');const r={id:id(),user_id:'preview-device',slot,status:'requested',data:{...b,slot,notification:'Device preview only; no request sent.'},created_at:now()};d.bookings.unshift(r);save();return r;}
 if(path.startsWith('/bookings/')&&method==='PATCH'){const r=d.bookings.find(x=>x.id===path.split('/')[2]);if(!r)throw Error('Booking unavailable');const next=bookingTransition(r,b,true,d.settings.availability);if(next.slot&&d.bookings.some(x=>x.id!==r.id&&x.slot===next.slot&&!['cancelled','completed'].includes(x.status)))throw Error('That time is reserved');Object.assign(r,next,{updated_at:now()});save();return {ok:true};}
 if(path==='/shares'){const r={token:id(),recordId:b.recordId,expiresAt:new Date(Date.now()+30*86400000).toISOString()};d.shares.push(r);save();return r;}
 if(path.startsWith('/share/')){const s=d.shares.find(x=>x.token===path.split('/')[2]);if(!s)throw Error('Share link unavailable');const r=find(s.recordId);if(method==='GET')return {record:r,comments:d.records.filter(x=>x.kind==='comment'&&x.data.recordId===r.id)};if(method==='DELETE'){d.shares=d.shares.filter(x=>x!==s);save();return {ok:true}}return add('comment','Build discussion',{...b,recordId:r.id,author:'Device preview'});}
 if(path==='/comments')return add('comment','Build discussion',{...b,author:'Device preview'});
 if(path==='/admin/settings'){if(method==='GET'){const c=await localApi('/catalog','GET');return {...d.settings,catalog:c};}d.settings[b.key]=b.value;add('audit','Published '+b.key,{next:b.value});save();return {ok:true};}
 if(path==='/admin/audit')return d.records.filter(x=>x.kind==='audit');
 if(path==='/game/start')return add('run','Woodland trail',{config:b.config,next:1,startedAt:Date.now(),lastAt:Date.now(),complete:false});
 if(path==='/game/checkpoint'){const r=find(b.runId);if(r.data.next!==b.index)throw Error('Pass gates in order');const p=TRAIL[b.index];if(Math.hypot(b.position.x-p.x,b.position.z-p.z)>4)throw Error('Invalid checkpoint');r.data.next++;r.data.complete=b.index===TRAIL.length-1;save();return {complete:r.data.complete,next:r.data.next,badge:r.data.complete?'Woodland Explorer':null};}
 if(path==='/game/claim'){const r=find(b.runId);if(!r?.data.complete)throw Error('Finish the trail first');return {badge:'Woodland Explorer',offer:null,message:'Device preview badge. Production offers require an approved promotion.'};}
 if(path==='/upload'){const f=b.get('file');if(f.size>1024*1024)throw Error('Device preview files must be under 1 MB');const url=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(f)});return add('attachment',f.name,{url,mime:f.type,size:f.size});}
 if(path==='/rewards/redeem')return {ok:true};
 throw Error('Preview action unavailable');
}
