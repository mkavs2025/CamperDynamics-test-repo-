import * as T from './three.module.js';
import {TRAIL,ROAD,roadDistance} from './trail.js';
export function createEnvironment(){
 const root=new T.Group(),trail=new T.Group();root.add(trail);trail.visible=false;
 const mat=(color)=>new T.MeshStandardMaterial({color,roughness:1,metalness:0});
 function mesh(g,m,x,y,z,parent=root){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const soil=mat('#625139'),gravel=mat('#8d6946'),grass=mat('#5e7145'),trunk=mat('#614331');
 const ground=mesh(new T.PlaneGeometry(500,360),soil,-85,-.015,0);ground.rotation.x=-Math.PI/2;ground.userData.softwareGround=true;
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d');cx.fillStyle='#807050';cx.fillRect(0,0,128,128);let seed=31;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<4500;i++){cx.fillStyle=['#6c6046','#96865c','#716544','#a2936b'][i%4];cx.fillRect(rand()*128,rand()*128,1+rand()*2,1+rand()*2)}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(100,72);tex.colorSpace=T.SRGBColorSpace;soil.map=tex;soil.bumpMap=tex;soil.bumpScale=.04;}
 const greens=['#395d43','#476b4c','#587b54'].map(mat),stone=mat('#777760');
 // Faceted tree silhouettes and hills continue all the way to the finish.
 for(let i=0;i<105;i++){const x=14-(i%35)*5.6,z=(i%2?1:-1)*(19+(i*7%22));if(roadDistance(x,z)<8)continue;const h=3+(i%5)*.35;mesh(new T.CylinderGeometry(.10,.18,h,6),trunk,x,h/2,z);for(let j=0;j<3;j++)mesh(new T.ConeGeometry(1.6-j*.29,2.4-j*.2,7),greens[(i+j)%3],x,h*.65+j*.7,z);}
 for(let i=0;i<22;i++){const x=30-i*11,z=(i%2?1:-1)*(48+i%3*9),h=7+i%4*2;const hill=mesh(new T.IcosahedronGeometry(h,0),mat(['#65785b','#798568','#6b8069'][i%3]),x,h*.35,z);hill.scale.set(1.7,.7,1.1);hill.rotation.y=i*.8;}
 for(let i=0;i<75;i++){const x=10-i*2.4,z=Math.sin(i*2.4)*21;if(roadDistance(x,z)<5||Math.hypot(x,z)<6)continue;const o=mesh(new T.IcosahedronGeometry(.15+i%3*.1,0),stone,x,.11,z);o.scale.set(1.4,.6,1);}
 for(let i=0;i<80;i++){const x=10-i*2.3,z=Math.sin(i*1.1)*25;if(roadDistance(x,z)<5)continue;const o=mesh(new T.ConeGeometry(.6,.38,4),grass,x,.15,z);o.scale.x=1.6;}
 const vertices=[],indices=[];for(let i=0;i<ROAD.length;i++){const p=ROAD[i],a=ROAD[Math.max(0,i-1)],b=ROAD[Math.min(ROAD.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz);for(const side of [-1,1])vertices.push(p.x-dz/n*3.5*side,.025,p.z+dx/n*3.5*side);if(i){const k=i*2;indices.push(k-2,k,k-1,k-1,k,k+1);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();gravel.side=T.DoubleSide;const road=mesh(geo,gravel,0,0,0,trail);road.userData.softwareGround=true;
 const post=mat('#74563a'),flagMat=mat('#d8ad53');for(let i=1;i<TRAIL.length;i++){const p=TRAIL[i],a=TRAIL[i-1],dx=p.x-a.x,dz=p.z-a.z,n=Math.hypot(dx,dz);for(const side of [-1,1]){const x=p.x-dz/n*4*side,z=p.z+dx/n*4*side;mesh(new T.CylinderGeometry(.07,.10,1.7,6),post,x,.85,z,trail);mesh(new T.BoxGeometry(.08,.5,.65),flagMat,x,1.5,z,trail);}}
 // Distinct finish gate; there is no return leg.
 const finish=TRAIL.at(-1);mesh(new T.BoxGeometry(.2,3,.2),post,finish.x,1.5,finish.z-4,trail);mesh(new T.BoxGeometry(.2,3,.2),post,finish.x,1.5,finish.z+4,trail);mesh(new T.BoxGeometry(.18,.65,8.3),flagMat,finish.x,2.8,finish.z,trail);
 return {root,trail,ground};
}
