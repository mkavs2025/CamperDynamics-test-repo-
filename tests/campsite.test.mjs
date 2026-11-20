import assert from 'node:assert/strict';
import fs from 'node:fs';
import {moveWalker,spawnPoint,createCampsite} from '../studio/campsite.js';
import {createVehicle} from '../studio/model.js';
import {defaults,normalize,estimate} from '../studio/config.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../studio/catalog.json',import.meta.url)));
const start={x:-5,z:0};const stopped=moveWalker(start,20,0);assert.ok(stopped.x< -3.12,'Truck collision must stop a long frame movement');
const slide=moveWalker({x:-3.2,z:0},2,3);assert.ok(slide.z>2,'Player should slide along vehicle boundary');
assert.ok(moveWalker({x:9,z:4},20,0).x<10,'Campsite boundary');
for(const delta of [[10,0],[-10,0],[0,10],[0,-10]]){const p=moveWalker({x:0,z:.5},...delta,true);assert.ok(Math.abs(p.x)<.4&&p.z>-.82&&p.z<1.78,'Cabin aisle collision');}
const rear=spawnPoint('rear');assert.ok(Math.hypot(rear.x-3.2,rear.z)<2.7,'Guided entry must be in interaction range');
const config=normalize({...defaults,addons:['awning']},catalog),before=JSON.stringify(config),price=estimate(config,catalog).total,truck=createVehicle();truck.update(config,catalog,{doorOpen:true,storageOpen:true,awningOpen:false});assert.ok(truck.parts.door.rotation.y>1);assert.ok(truck.parts.drawer.position.z>.5);assert.equal(truck.parts.awning.visible,false);truck.update(config,catalog,{});assert.equal(truck.parts.door.rotation.y,0);assert.equal(truck.parts.awning.visible,true);assert.equal(JSON.stringify(config),before);assert.equal(estimate(config,catalog).total,price);
assert.ok(createCampsite().children.length>40);console.log('Campsite collision, guided entry, interactions and price preservation verified.');
