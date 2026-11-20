import assert from 'node:assert/strict';
import * as T from '../studio/three.module.js';
import {createAccessory} from '../studio/accessories.js';
import {normalize} from '../studio/config.js';
import {NightSequence,nightBeat,NIGHT_TIMING,NightGesture} from '../public/portal/finale-timeline.js';
import catalog from '../studio/catalog.json' with {type:'json'};
// Historical configurations cannot reintroduce a withdrawn accessory.
assert.ok(!catalog.addons.some(x=>x.id==='thermal'));
assert.ok(!normalize({addons:['thermal','showerAwning']},catalog).addons.includes('thermal'));
// Shoot through the entire rear cloth, including the stitched edges: there must be no holes.
const shower=createAccessory('showerAwning');shower.updateMatrixWorld(true);
let samples=0;for(let y=.08;y<=2.10;y+=.10)for(let x=-.51;x<=.51;x+=.051){const ray=new T.Raycaster(new T.Vector3(x,y,-2),new T.Vector3(0,0,1),0,1.55);assert.ok(ray.intersectObject(shower,true).length,'Rear shower fabric must be continuous at '+x+','+y);samples++;}
// Timed shots keep playing without more scroll input, and cannot be skipped by momentum.
for(const dt of [1/60,.1,.25]){
 const sequence=new NightSequence();sequence.start();assert.equal(sequence.phase,'departure');assert.equal(sequence.next(),false);
 while(sequence.phase==='departure')sequence.step(dt);assert.equal(sequence.phase,'form');
 assert.equal(sequence.next(),false);sequence.step(1.4);assert.equal(sequence.next(),true);
 while(sequence.phase==='ram-one'){assert.equal(sequence.next(),false);sequence.step(dt);}assert.equal(sequence.phase,'first-rest');assert.equal(sequence.firstCrack,true);assert.equal(sequence.secondCrack,false);
 sequence.step(10);assert.equal(sequence.phase,'first-rest');assert.equal(sequence.next(),true);
 while(sequence.active)sequence.step(dt);assert.equal(sequence.phase,'complete');assert.equal(sequence.secondCrack,true);
 sequence.reset();sequence.start();sequence.skip();assert.equal(sequence.active,false);
}
assert.equal(nightBeat('departure',2.5).lights,1);assert.equal(nightBeat('departure',6.1).fold,1);assert.equal(nightBeat('departure',6.1).drive,0);
assert.equal(nightBeat('ram-two',1.4).reverse,1);assert.equal(nightBeat('ram-two',1.4).secondAttack,0);assert.equal(nightBeat('ram-two',7).home,1);
for(const phase of ['departure','ram-one','ram-two','form']){let prev=nightBeat(phase,0);for(let i=1;i<=14000;i++){const v=nightBeat(phase,i/1000);for(const key of Object.keys(v)){assert.ok(Number.isFinite(v[key]));assert.ok(v[key]>=0&&v[key]<=1);assert.ok(Math.abs(v[key]-prev[key])<(key.startsWith('crack')?.02:.01),'Continuous animation: '+phase+':'+key);}prev=v;}}
const gestures=new NightGesture();assert.equal(gestures.consume(60,0,false),false);assert.equal(gestures.consume(90,100,true),false);assert.equal(gestures.consume(50,500,true),true);assert.equal(gestures.consume(150,600,true),false);assert.equal(gestures.consume(10,1000,true),false);assert.equal(gestures.consume(35,1020,true),true);
console.log(`Landing finale: ${samples} rear fabric rays, timed automatic lights/packing/driving, two independent impacts, 56,000 smooth samples and momentum protection passed.`);
