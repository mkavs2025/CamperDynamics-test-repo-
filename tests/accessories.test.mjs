import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../studio/three.module.js';
import {createAccessory,mountAccessory,ACCESSORY_IDS} from '../studio/accessories.js';
import {createVehicle} from '../studio/model.js';
import {normalize,defaults} from '../studio/config.js';
const catalogue=JSON.parse(fs.readFileSync(new URL('../studio/catalog.json',import.meta.url)));
assert.deepEqual([...ACCESSORY_IDS].sort(),catalogue.addons.map(a=>a.id).sort());
const geometrySignature=g=>{const out=[];g.traverse(o=>{if(o.isMesh)out.push([o.geometry.type,o.geometry.attributes.position.count])});return out};
const vehicle=createVehicle();let meshes=0,vertices=0;
for(const id of ACCESSORY_IDS){const preview=createAccessory(id),installed=vehicle.parts[id];assert.deepEqual(geometrySignature(preview),geometrySignature(installed),id+' catalogue and fitted geometry must match');preview.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n),id+' nonfinite geometry');vertices+=p.count;});const box=new T.Box3().setFromObject(preview);assert.ok(!box.isEmpty());}
const shower=createAccessory('showerAwning');assert.equal(shower.userData.opening,true);const fabrics=[];shower.traverse(o=>{if(o.name==='folded-fabric')fabrics.push(o)});assert.equal(fabrics.length,5);for(const p of fabrics){const z=Array.from({length:p.geometry.attributes.position.count},(_,i)=>p.geometry.attributes.position.getZ(i));assert.ok(Math.max(...z)-Math.min(...z)>.02,'Curtains need physical folds');}
shower.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(0,1,2),new T.Vector3(0,0,-1),0,1.8);assert.equal(ray.intersectObject(shower,true).length,0,'Entrance must remain an actual opening');
const cfg=normalize({...defaults,addons:catalogue.addons.filter(a=>a.models.includes('basecamp')).map(a=>a.id)},catalogue);vehicle.update(cfg,catalogue,{cutaway:true});assert.equal(vehicle.parts.showerAwning.visible,true);assert.equal(vehicle.parts.indoorShower.visible,true);assert.equal(vehicle.parts.kitchen.visible,false);console.log(`All 10 accessories share preview/fitted geometry; ${meshes} detailed meshes and ${vertices} finite vertices, folded shower fabric and clear doorway verified.`);
