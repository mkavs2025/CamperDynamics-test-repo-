// Original short demonstration course, in metres. The pickup faces local -X.
export const TRAIL=[{x:0,z:0},{x:-20,z:0},{x:-39,z:12},{x:-59,z:10},{x:-79,z:-10},{x:-99,z:-14},{x:-119,z:7},{x:-139,z:12},{x:-160,z:0}];
// Smooth, open-ended route shared by the renderer, minimap and simulation.
export const ROAD=[];
for(let i=0;i<TRAIL.length-1;i++)for(let j=0;j<10;j++){
 const p0=TRAIL[Math.max(0,i-1)],p1=TRAIL[i],p2=TRAIL[i+1],p3=TRAIL[Math.min(TRAIL.length-1,i+2)],t=j/10;
 const sample=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
 ROAD.push({x:sample('x'),z:sample('z')});
}ROAD.push({...TRAIL.at(-1)});
export function roadDistance(x,z){let lo=0,hi=ROAD.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ROAD[m].x>x)lo=m;else hi=m;}const a=ROAD[lo],b=ROAD[hi],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
export const routeDistance=roadDistance;
export function newDrive(){return {x:0,z:0,heading:0,speed:0,next:1,distance:0,elapsed:0,complete:false,offroad:false}}
export function stepDrive(current,input,delta){const s={...current};if(s.complete)return s;const dt=Math.min(Math.max(delta,0),.1);s.elapsed+=dt;let throttle=input.forward?1:input.reverse?-1:0;const steer=(input.left?1:0)-(input.right?1:0);
 if(input.assist){let targetIndex=ROAD.findIndex(p=>p.x<s.x-2.5);if(targetIndex<0)targetIndex=ROAD.length-1;const t=ROAD[targetIndex];const dx=t.x-s.x,dz=t.z-s.z;const desired=Math.atan2(dz,-dx);let turn=Math.atan2(Math.sin(desired-s.heading),Math.cos(desired-s.heading));s.heading+=Math.max(-dt*1.8,Math.min(dt*1.8,turn));s.speed=Math.min(6,Math.hypot(dx,dz)/dt);}
 else{s.speed+=throttle*4.5*dt;if(!throttle)s.speed*=Math.exp(-1.1*dt);if(input.brake)s.speed*=Math.exp(-7*dt);s.speed=Math.max(-2.5,Math.min(8,s.speed));s.heading+=steer*.65*dt*s.speed/3;}
 s.offroad=routeDistance(s.x,s.z)>4.5;if(s.offroad)s.speed*=Math.exp(-2*dt);const dx=-Math.cos(s.heading)*s.speed*dt,dz=Math.sin(s.heading)*s.speed*dt;s.x+=dx;s.z+=dz;s.distance+=Math.hypot(dx,dz);
 const t=TRAIL[s.next];if(Math.hypot(s.x-t.x,s.z-t.z)<2.5){s.next++;if(s.next===TRAIL.length){s.next=TRAIL.length-1;s.complete=s.distance>100&&s.elapsed>15;s.speed=0;}}
 return s;
}
export function recoverDrive(current){const p=TRAIL[Math.max(0,current.next-1)],n=TRAIL[current.next];return {...current,x:p.x,z:p.z,speed:0,heading:Math.atan2(n.z-p.z,p.x-n.x),offroad:false}}
export function rewardRecord(randomUUID,date=new Date()){return {code:'DEMO-TRAIL-'+randomUUID.replace(/-/g,'').slice(0,8).toUpperCase(),earnedAt:date.toISOString(),kind:'demonstration',redeemable:false}}
