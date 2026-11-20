export {DEFAULT_AVAILABILITY,validateSlot,bookingTransition} from '../public/portal/booking-rules.js';
import {normalize,estimate} from '../studio/config.js';
import base from '../studio/catalog.json' with {type:'json'};
import {TRAIL} from '../studio/trail.js';
export {base,normalize,estimate,TRAIL};
export const STAGES=['Requirements','Design approval','Production','Installation','Handover'];
export function cleanText(v,max=500){return typeof v==='string'?v.trim().slice(0,max):''}
export function approvedCatalog(input){const c=structuredClone(base);for(const group of ['models','addons','colors','woods','fabrics'])for(const item of c[group]){const x=input?.[group]?.find(a=>a.id===item.id);if(!x)continue;if(item.price!==null&&(!Number.isInteger(x.price)||x.price<0||x.price>10000000))throw Error('Invalid price');if(item.id!=='odyssey')item.price=x.price;if(x.models&&group==='addons'){if(!Array.isArray(x.models)||!x.models.length||x.models.some(m=>!['basecamp','backpack'].includes(m)))throw Error('Invalid compatibility');item.models=[...new Set(x.models)];}}return c;}
export function progressRun(run,index,position,now=Date.now()){
 if(run.complete||index!==run.next)throw Error('Checkpoints must be completed in order.');const t=TRAIL[index],p=TRAIL[index-1];if(!t||!position||!Number.isFinite(position.x)||!Number.isFinite(position.z)||Math.hypot(position.x-t.x,position.z-t.z)>4)throw Error('Checkpoint position is invalid.');const minMs=Math.hypot(t.x-p.x,t.z-p.z)/12*1000;if(now-run.lastAt<minMs)throw Error('Checkpoint reached too quickly.');return {...run,next:index+1,lastAt:now,complete:index===TRAIL.length-1,finishedAt:index===TRAIL.length-1?now:null};
}
export function freezeProposal(config,catalog,name,revision){const c=normalize(config,catalog);return {config:c,estimate:estimate(c,catalog),name,revision,catalogRevision:catalog.revision||1,createdAt:new Date().toISOString(),status:'Illustrative proposal',assumptions:catalog.assumptions,validUntil:null};}

