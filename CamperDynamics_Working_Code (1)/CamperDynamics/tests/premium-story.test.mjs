import assert from 'node:assert/strict';
import {ease,storyTime,storyPosition,exploded,explosionAngle,FINISHES,chapterPosition} from '../public/portal/premium-timeline.js';
import {normalize,estimate} from '../studio/config.js';
import catalog from '../studio/catalog.json' with {type:'json'};
let previous=-1;
for(let i=0;i<=10000;i++){const q=i/10000,p=storyTime(q);assert.ok(p>=previous&&p>=0&&p<=1);previous=p;assert.ok(exploded(q)>=0&&exploded(q)<=1);if(q<.12||q>.36)assert.equal(exploded(q),0);}
for(const p of [0,.08,.13,.15,.43,.52,.64,.78,.91,1])assert.ok(Math.abs(storyTime(storyPosition(p))-p)<1e-9);
assert.equal(exploded(.24),1);assert.equal(explosionAngle(.18),0);assert.equal(explosionAngle(.30),2*Math.PI);assert.equal(exploded(.36),0);
for(const q of [.12,.18,.30,.36]){assert.ok(Math.abs(exploded(q-1e-7)-exploded(q+1e-7))<1e-5);assert.ok(Math.abs(storyTime(q-1e-7)-storyTime(q+1e-7))<1e-5)}
assert.deepEqual(chapterPosition,[0,.24,.50,.69,.84,.98]);
for(const f of FINISHES){const state=normalize({color:f.id},catalog);assert.equal(state.color,f.id);assert.equal(normalize(JSON.parse(JSON.stringify(state)),catalog).color,f.id);assert.ok(Number.isFinite(estimate(state,catalog).total));}
assert.equal(ease(0,1,-1),0);assert.equal(ease(0,1,2),1);
console.log('Premium timeline: 10,001 monotonic reversible samples, continuous explosion boundaries, complete orbit, chapter mapping and all finish save/price round trips passed.');
