import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../studio/three.module.js';
const source=fs.readFileSync(new URL('../public/portal/orbit-look.js',import.meta.url),'utf8').replace("'/studio/three.module.js'",JSON.stringify(new URL('../studio/three.module.js',import.meta.url).href));
const {createLookAround}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
class Element extends EventTarget{dataset={};hidden=false;setAttribute(){}append(){}remove(){}setPointerCapture(){}}
const originalWindow=globalThis.window,originalDocument=globalThis.document;globalThis.window=new Element();globalThis.document={createElement:()=>new Element()};
try{
 const canvas=new Element(),host=new Element(),control=createLookAround(canvas,host),press=key=>{const e=new Event('keydown',{cancelable:true});e.key=key;canvas.dispatchEvent(e)};
 for(let i=0;i<36;i++)press('ArrowRight');assert.equal(control.tick(.016,false),true);assert.equal(host.dataset.manualView,'exploring');assert.ok(Math.abs(Number(host.dataset.manualYaw))>Math.PI*2,'The camper supports a complete free orbit');
 const camera=new T.PerspectiveCamera(38,1,.025,100),focus=new T.Vector3(0,1,0);camera.position.set(8,3,7);camera.lookAt(focus);const radius=camera.position.distanceTo(focus);control.apply(camera,focus,false);assert.ok(Math.abs(camera.position.distanceTo(focus)-radius)<1e-9);
 const start=camera.position.clone();control.apply(camera,focus,true);assert.deepEqual(camera.position.toArray(),start.toArray(),'Interior looking must not move through the walls');
 // A fresh scroll releases the interaction by damping home before the story progresses.
 window.dispatchEvent(new Event('wheel'));assert.equal(control.tick(.016,true),true);assert.equal(host.dataset.manualView,'returning');let frames=0;while(control.tick(.016,false)&&frames<200)frames++;assert.ok(frames>5&&frames<200);assert.equal(host.dataset.manualView,'rest');assert.equal(host.dataset.manualYaw,'0.000');
 press('ArrowLeft');control.reset();assert.equal(control.tick(.016,false),false);control.dispose();
 console.log('360 look-around: full free orbit, fixed interior eye, smooth scroll handback and replay reset passed.');
}finally{globalThis.window=originalWindow;globalThis.document=originalDocument;}
