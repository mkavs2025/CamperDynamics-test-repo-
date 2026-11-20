import * as T from './three.module.js';
// Original low-poly campsite. No third-party game assets.
export function createCampsite(){
 const root=new T.Group();const material=c=>new T.MeshStandardMaterial({color:c,roughness:1});
 const earth=material('#6b7052'),rock=material('#677474'),bark=material('#604a35'),leaves=material('#345b48'),water=material('#548e9a');
 function mesh(g,m,x,y,z){const a=new T.Mesh(g,m);a.position.set(x,y,z);a.receiveShadow=true;root.add(a);return a}
 mesh(new T.BoxGeometry(70,.12,70),earth,0,-.09,0);
 mesh(new T.BoxGeometry(54,.08,20),water,0,-.015,-19);
 for(let i=0;i<24;i++){const a=i*2.399,r=12+(i%4)*3,x=Math.sin(a)*r,z=Math.cos(a)*r;if(z<-10)continue;mesh(new T.CylinderGeometry(.12,.2,3,6),bark,x,1.5,z);for(let j=0;j<3;j++)mesh(new T.ConeGeometry(1.4-j*.22,2.6,7),leaves,x,3+j*.9,z);}
 for(let i=0;i<10;i++){const x=-26+i*6;const peak=mesh(new T.ConeGeometry(5+i%3,7+i%4,5),rock,x,3,-31);peak.rotation.y=i;}
 for(let i=0;i<12;i++){const a=i*.53;const r=mesh(new T.DodecahedronGeometry(.3+(i%3)*.08,0),rock,Math.cos(a)*8,.2,Math.sin(a)*7);r.scale.y=.55;}
 const timber=material('#967550'),iron=material('#303c38');
 mesh(new T.BoxGeometry(1.9,.09,.85),timber,-5,.8,3);for(const z of [2.25,3.75])mesh(new T.BoxGeometry(1.9,.09,.3),timber,-5,.45,z);for(const x of [-5.65,-4.35])mesh(new T.BoxGeometry(.09,.8,1.7),iron,x,.4,3);
 return root;
}
// Sub-stepped circle/AABB collision prevents tunnelling at low frame rates.
export function moveWalker(position,dx,dz,inside=false){
 const p={...position},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
 const valid=(x,z)=>inside?Math.abs(x)<.40&&z>-.82&&z<1.78:Math.abs(x)<10&&Math.abs(z)<9&&!(x>-3.12&&x<3.18&&Math.abs(z)<1.37);
 for(let i=0;i<steps;i++){if(valid(p.x+dx/steps,p.z))p.x+=dx/steps;if(valid(p.x,p.z+dz/steps))p.z+=dz/steps;}return p;
}
export function spawnPoint(id){return ({driver:{x:-.8,z:2.7,yaw:0},front:{x:-5.4,z:4.8,yaw:.85},rear:{x:4.8,z:1.7,yaw:-1.05},awning:{x:.5,z:4.4,yaw:0},lake:{x:-5,z:-7,yaw:2.5}})[id]||{x:-5.4,z:4.8,yaw:.85};}
