// Feet-based movement, gravity, surface landings and solid vehicle sides.
export function surfaces(roofOpen=true){return [{x0:-2.98,x1:-1.32,z0:-1.15,z1:1.15,y:1.43},{x0:-1.32,x1:2.96,z0:-1.15,z1:1.15,y:roofOpen?3.28:2.64}];}
const within=(p,r,pad=0)=>p.x>r.x0-pad&&p.x<r.x1+pad&&p.z>r.z0-pad&&p.z<r.z1+pad;
function integrateWalker(previous,input,delta,{inside=false,roofOpen=true}={}){
 let p={y:0,vy:0,grounded:true,...previous};const dt=Math.min(.1,Math.max(0,delta));
 const platforms=inside?[]:surfaces(roofOpen),support=platforms.find(r=>within(p,r));
 if(p.grounded&&support&&p.y>1.3)p.y=support.y;
 if(input.jump&&p.grounded){p.vy=inside?2.4:9;p.grounded=false;}
 const oldY=p.y;p.vy-=12*dt;p.y+=p.vy*dt;
 if(inside&&p.y>.4){p.y=.4;p.vy=Math.min(p.vy,0);}
 const forward=(input.forward?1:0)-(input.reverse?1:0),side=(input.right?1:0)-(input.left?1:0),n=Math.hypot(forward,side)||1,speed=inside?1.2:input.run?5.5:2.8;
 const dx=(Math.sin(input.yaw)*forward+Math.cos(input.yaw)*side)/n*speed*dt,dz=(-Math.cos(input.yaw)*forward+Math.sin(input.yaw)*side)/n*speed*dt;
 const valid=(x,z)=>inside?Math.abs(x)<.40&&z>-.82&&z<1.78:Math.abs(x)<12&&Math.abs(z)<12&&!platforms.some(r=>within({x,z},r,.20)&&p.y<r.y-.04&&oldY<r.y-.04);
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));for(let i=0;i<steps;i++){if(valid(p.x+dx/steps,p.z))p.x+=dx/steps;if(valid(p.x,p.z+dz/steps))p.z+=dz/steps;}
 p.grounded=false;let landing=0;for(const r of platforms)if(within(p,r)&&oldY>=r.y-.05&&p.y<=r.y&&p.vy<=0)landing=Math.max(landing,r.y);
 if(p.y<=landing){p.y=landing;p.vy=0;p.grounded=true;}
 return p;
}

export function stepWalker(previous,input,delta,options={}){const dt=Math.min(.1,Math.max(0,delta)),steps=Math.max(1,Math.ceil(dt*120));let p=previous;for(let i=0;i<steps;i++)p=integrateWalker(p,{...input,jump:input.jump&&i===0},dt/steps,options);return p;}
