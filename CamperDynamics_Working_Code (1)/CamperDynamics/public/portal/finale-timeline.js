import {ease} from './premium-timeline.js';
export const NIGHT_TIMING={lights:2.6,lightsReady:3.6,fold:4.1,folded:6.0,drive:6.4,parked:12.6,firstHit:4.1,firstRest:5.15,secondHit:3.35,homeStart:4.5,complete:7.0};
// Scroll only requests the next beat. Playback is clock-driven and cannot skip a running shot.
export class NightSequence{
 constructor(){this.reset();}
 reset(){this.phase='idle';this.time=0;this.firstCrack=false;this.secondCrack=false;}
 get active(){return !['idle','complete','skipped'].includes(this.phase);}
 start(){if(this.phase==='idle'){this.phase='departure';this.time=0;}}
 next(){if(this.phase==='form'&&this.time>=1.3)this.phase='ram-one';else if(this.phase==='first-rest')this.phase='ram-two';else return false;this.time=0;return true;}
 back(){return false;}
 step(dt){if(!this.active)return;this.time+=Math.max(0,dt);if(this.phase==='departure'&&this.time>=NIGHT_TIMING.parked){this.phase='form';this.time=0;}else if(this.phase==='ram-one'){if(this.time>=NIGHT_TIMING.firstHit)this.firstCrack=true;if(this.time>=NIGHT_TIMING.firstRest){this.phase='first-rest';this.time=0;}}else if(this.phase==='ram-two'){if(this.time>=NIGHT_TIMING.secondHit)this.secondCrack=true;if(this.time>=NIGHT_TIMING.complete){this.phase='complete';this.time=0;}}}
 skip(){this.phase='skipped';this.time=0;}
}
export function nightBeat(phase,t){
 const departure=phase==='departure',second=phase==='ram-two',first=phase==='ram-one';
 const home=second?Math.min(1,Math.max(0,ease(NIGHT_TIMING.homeStart,NIGHT_TIMING.complete-.3,t))):phase==='complete'?1:0;
 return {lights:departure?1:phase==='idle'?0:1,fold:departure?ease(NIGHT_TIMING.fold,NIGHT_TIMING.folded,t):phase==='idle'?0:1,drive:departure?ease(NIGHT_TIMING.drive,NIGHT_TIMING.parked-.4,t):phase==='idle'?0:1,turn:first?ease(0,1.6,t):0,attack:first?ease(1.3,NIGHT_TIMING.firstHit,t):0,reverse:second?ease(0,1.35,t):0,secondAttack:second?ease(1.8,NIGHT_TIMING.secondHit,t):0,home,roll:phase==='form'?ease(0,1.1,t):0,crackOne:first?ease(NIGHT_TIMING.firstHit,NIGHT_TIMING.firstHit+.15,t):0,crackTwo:second?ease(NIGHT_TIMING.secondHit,NIGHT_TIMING.secondHit+.16,t):0};
}
// One consumed gesture per shot; a stream of trackpad momentum never queues another hit.
export class NightGesture{
 constructor(){this.last=-Infinity;this.total=0;this.used=false;}
 consume(delta,now,ready){if(now-this.last>220){this.total=0;this.used=false;}this.last=now;if(!ready){this.used=true;return false;}if(this.used)return false;this.total+=Math.abs(delta);if(this.total<42)return false;this.used=true;return true;}
}
