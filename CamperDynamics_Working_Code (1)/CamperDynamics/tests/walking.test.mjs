import assert from 'node:assert/strict';
import {stepWalker,surfaces} from '../studio/walking.js';
const neutral={yaw:0};let p={x:-4,z:3};for(let i=0;i<90;i++)p=stepWalker(p,neutral,1/60);assert.equal(p.y,0);assert.equal(p.grounded,true);
let walk={x:-4,z:3},run={...walk};for(let i=0;i<60;i++){walk=stepWalker(walk,{forward:true,yaw:0},1/60);run=stepWalker(run,{forward:true,run:true,yaw:0},1/60);}assert.ok(3-run.z>(3-walk.z)*1.8,'Shift must increase movement speed');
let jump={x:1,z:1.8},peak=0,landed=false;for(let i=0;i<110;i++){jump=stepWalker(jump,{yaw:0,jump:i===0,forward:i>29&&i<44},1/60);peak=Math.max(peak,jump.y);if(jump.grounded&&jump.y>3)landed=true;}assert.ok(peak>3.28);assert.ok(landed,'Must be able to jump onto raised RV roof');assert.equal(jump.y,surfaces()[1].y);
let edge={x:1,z:0,y:3.28,vy:0,grounded:true};for(let i=0;i<140;i++)edge=stepWalker(edge,{right:true,yaw:0},1/60);assert.equal(edge.y,0,'Stepping off roof must land on ground');
let blocked={x:-4,z:0};for(let i=0;i<100;i++)blocked=stepWalker(blocked,{right:true,yaw:0},1/60);assert.ok(blocked.x< -3,'Grounded player cannot walk through pickup');
let inside={x:0,z:1};for(let i=0;i<60;i++)inside=stepWalker(inside,{jump:i===0,yaw:0},1/60,{inside:true});assert.equal(inside.y,0);console.log('Jump height, RV roof landing, roof edge gravity, sprint, grounded collision and cabin ceiling verified.');

let slow={x:1,z:1.8},slowPeak=0;for(let i=0;i<20;i++){slow=stepWalker(slow,{yaw:0,jump:i===0},.1);slowPeak=Math.max(slowPeak,slow.y);}assert.ok(slowPeak>3.28,'Low frame rates must retain enough jump height to reach RV roof');console.log('Low-frame-rate jump stability verified.');
