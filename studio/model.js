import * as T from './three.module.js';
import {createInteriorKit,themeInteriorAccessory} from './interior-kit.js';
import {createAccessory,mountAccessory,ACCESSORY_IDS} from './accessories.js';
// Original detailed Hilux-reference geometry. Replace via the documented model adapter with licensed production GLB assets.
export function createVehicle(){
 const root=new T.Group(),body=new T.Group(),conversion=new T.Group(),parts={},wheels=[],roof=new T.Group(),softwall=new T.Group();root.add(body,conversion);conversion.add(roof,softwall);
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const paint=mat('#c7cbc9',.24,.6),camper=mat('#c4aa7e',.48,.18),black=mat('#141a1c',.65),rubber=mat('#171b1c',.95),chrome=mat('#c4c6bd',.2,.85),glass=mat('#23353c',.12,.25),dark=mat('#303735'),canvas=mat('#767769'),wood=mat('#bfa47d'),fabric=mat('#c5bba4'),light=mat('#e4e8df',.25),amber=mat('#e9b36e');
 function box(w,h,d,x,y,z,m,parent=body,bevel=0){let geo;if(bevel){const sh=new T.Shape();const r=Math.min(bevel,w/3,h/3);sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);geo=new T.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:3});geo.translate(0,0,-(d-2*r)/2);}else geo=new T.BoxGeometry(w,h,d,2,2,2);const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function cyl(r,h,x,y,z,m,parent=body,segments=28){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
 function profile(points,depth,m,parent=body){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:2});geo.translate(0,0,-depth/2);const mesh=new T.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function line(points,color='#68716b',parent=body,r=.008){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(2,points.length*3),r,6,false),mat(color,.4,.5));parent.add(mesh);return mesh}
 function oval(x,y,z,rx,ry,m,parent=body){const o=new T.Mesh(new T.TorusGeometry(1,.045,8,40),m);o.scale.set(rx,ry,rx);o.rotation.y=Math.PI/2;o.position.set(x,y,z);parent.add(o);return o}
 // Frame, axles and the pickup bed.
 box(5.12,.16,1.5,0,.48,0,black);for(const x of [-1.54,1.55]){const axle=cyl(.065,1.9,x,.41,0,dark);axle.rotation.x=Math.PI/2;}
 box(2.2,.18,1.86,1.55,.89,0,dark);box(2.18,.31,1.83,1.55,1.08,0,paint,body,.045);
 // Sculpted front body and hood, bevelled surfaces avoid a block-shaped silhouette.
 profile([[-2.65,.69],[-2.66,1.13],[-2.48,1.29],[-1.65,1.38],[-1.19,1.34],[-.93,1.22],[-.94,.73]],1.72,paint);
 box(2.08,.09,1.74,-.27,.70,0,paint);const passenger=profile([[-1.32,.67],[-1.32,1.34],[-.78,1.85],[.44,1.85],[.79,1.59],[.81,.68]],.04,paint);passenger.position.z=-.85;const rearSide=profile([[-.13,.70],[-.13,1.85],[.44,1.85],[.79,1.59],[.81,.70]],.04,paint);rearSide.position.z=.85;box(.06,.7,1.67,.74,1.1,0,paint);box(.3,.20,1.65,-1.05,1.26,0,dark);
 box(1.06,.045,1.64,-2.02,1.34,0,paint,body,.015);for(const z of [-.63,.63])line([[-2.54,1.35,z],[-2.1,1.39,z*.85],[-1.56,1.38,z*.78]],'#a2a9a6');
 // Door window polygons on both sides, slight taper toward the roof.
 for(const sign of [-1,1]){const z=sign*.895;
 const fw=profile([[-1.16,1.37],[-.73,1.78],[-.18,1.78],[-.18,1.36]],.015,glass);fw.position.z=z;if(sign===1)fw.visible=false;
 const rw=profile([[-.09,1.36],[-.09,1.78],[.39,1.78],[.70,1.55],[.70,1.36]],.015,glass);rw.position.z=z;
 box(.065,.46,.045,-.135,1.57,z*1.008,black);line([[-1.18,1.33,z],[-.1,1.33,z],[.73,1.33,z]],'#3c474a',body,.012);
 for(const x of [-.15,.7])line([[x,.72,z],[x,1.29,z]],'#707a79',body,.004);
 for(const x of [-.37,.5]){box(.19,.033,.039,x,1.21,z*1.015,chrome,body,.008);box(.11,.023,.045,x,1.21,z*1.025,black);}
 box(.22,.14,.23,-1.1,1.35,sign*1.01,paint,body,.035);box(.19,.11,.013,-1.1,1.36,sign*1.135,glass,body,.008);line([[-1.07,1.29,sign*.9],[-1.1,1.31,sign*1.04]],'#252b2c',body,.022);
 box(2.04,.07,.22,-.24,.63,sign*.99,chrome,body,.02);for(let j=0;j<6;j++)box(.19,.012,.13,-1.08+j*.33,.675,sign*1.015,black);
 }
 // Driver-side hinged door, with a visible interior card and handle.
 const driverDoor=new T.Group();driverDoor.position.set(-1.16,.72,.91);body.add(driverDoor);parts.driverDoor=driverDoor;
 box(.99,.62,.055,.49,.29,0,paint,driverDoor,.03);box(.86,.44,.025,.49,.31,-.038,dark,driverDoor,.02);box(.2,.04,.05,.74,.49,.04,chrome,driverDoor,.01);box(.055,.39,.04,.99,.82,0,black,driverDoor);
 const driverGlass=profile([[0,0],[.42,.4],[.96,.4],[.96,0]],.016,glass,driverDoor);driverGlass.position.set(0,.65,0);
 const steering=new T.Mesh(new T.TorusGeometry(.15,.022,10,32),black);steering.position.set(-.86,1.28,.43);steering.rotation.y=-.45;body.add(steering);box(.34,.08,.4,-.46,.9,.43,dark);box(.12,.4,.38,-.26,1.1,.43,dark,body,.035);
 const windshield=box(.025,.64,1.51,-1.10,1.58,0,glass);windshield.rotation.z=-.77;box(1.24,.045,1.6,-.15,1.865,0,paint,body,.015);box(.02,.37,1.30,.72,1.53,0,glass);for(const z of [-.42,.4])line([[-1.23,1.39,z-.18],[-1.16,1.4,z+.13]],'#131a1c',body,.008);
 // Trapezoid Hilux-style grille, chrome surround, projector lights and Toyota oval reference.
 const grille=profile([[-.67,-.18],[-.82,.18],[-.69,.32],[.69,.32],[.82,.18],[.67,-.18]],.052,black);grille.rotation.y=Math.PI/2;grille.position.set(-2.7,.91,0);
 for(let i=0;i<4;i++)box(.045,.018,1.38-i*.055,-2.745,.80+i*.11,0,chrome);
 line([[-2.75,.74,-.67],[-2.75,1.09,-.82],[-2.75,1.21,-.69],[-2.75,1.21,.69],[-2.75,1.09,.82],[-2.75,.74,.67]],'#bfc7c4',body,.025);
 oval(-2.79,1.01,0,.094,.063,chrome);const emblem=new T.Mesh(new T.TorusGeometry(.057,.01,6,32),chrome);emblem.rotation.y=Math.PI/2;emblem.scale.set(1,1.35,.55);emblem.position.set(-2.8,1.01,0);body.add(emblem);
 for(const sign of [-1,1]){const lamp=box(.11,.17,.38,-2.64,1.21,sign*.68,chrome,body,.025);const lens=box(.018,.105,.28,-2.705,1.23,sign*.68,light,body,.018);lens.userData.vehicleLamp='headlight';box(.025,.018,.30,-2.72,1.30,sign*.68,light);const projector=cyl(.044,.022,-2.725,1.22,sign*.67,chrome);projector.rotation.z=Math.PI/2;box(.055,.055,.075,-2.70,1.17,sign*.83,amber,body,.015);}
 box(.15,.18,1.78,-2.67,.61,0,paint,body,.035);box(.17,.14,.71,-2.71,.57,0,black,body,.025);for(const sign of [-1,1]){box(.16,.16,.29,-2.68,.62,sign*.67,black,body,.035);const fog=cyl(.045,.025,-2.775,.64,sign*.67,light);fog.rotation.z=Math.PI/2;fog.userData.vehicleLamp='headlight';}
 box(.025,.12,.43,-2.81,.68,0,mat('#e7e9de'));box(.03,.025,.26,-2.828,.68,0,black);
 // All-terrain tyres, rounded shoulders, alloy spokes, lug nuts and wheel arches.
 for(const x of [-1.54,1.55])for(const sign of [-1,1]){const wheelStart=body.children.length;const z=sign*.91;const tire=cyl(.405,.285,x,.43,z,rubber);tire.rotation.x=Math.PI/2;for(const zz of [z-.11,z+.11]){const shoulder=new T.Mesh(new T.TorusGeometry(.34,.064,8,36),rubber);shoulder.position.set(x,.43,zz);body.add(shoulder)}const rim=cyl(.265,.3,x,.43,z,chrome);rim.rotation.x=Math.PI/2;const inner=cyl(.225,.315,x,.43,z,black);inner.rotation.x=Math.PI/2;for(let j=0;j<6;j++){const a=j*Math.PI/3;const spoke=box(.045,.39,.025,x,.43,z+sign*.17,chrome,body,.009);spoke.rotation.z=a;const nut=cyl(.013,.025,x+Math.sin(a)*.085,.43+Math.cos(a)*.085,z+sign*.19,chrome,body,8);nut.rotation.x=Math.PI/2;}
 const hub=cyl(.073,.34,x,.43,z,chrome);hub.rotation.x=Math.PI/2;
 for(let j=0;j<26;j++){const a=j*Math.PI/13;const tread=box(.067,.027,.27,x+Math.sin(a)*.405,.43+Math.cos(a)*.405,z,black);tread.rotation.z=-a;}
 const wheel=new T.Group();wheel.position.set(x,.43,z);const wheelObjects=body.children.slice(wheelStart);body.add(wheel);body.updateMatrixWorld(true);for(const o of wheelObjects)wheel.attach(o);wheels.push(wheel);
 const arch=new T.Mesh(new T.TorusGeometry(.45,.055,8,40,Math.PI),dark);arch.position.set(x,.43,sign*1.04);body.add(arch);for(const side of [-1,1])box(.065,.26,.1,x+side*.45,.3,sign*1.04,dark);}
 // Flatbed platform and lower storage: standard on Basecamp.
 parts.flatbed=new T.Group();conversion.add(parts.flatbed);box(2.23,.14,2.13,1.56,.99,0,chrome,parts.flatbed,.018);box(2.2,.24,2.06,1.56,1.11,0,dark,parts.flatbed,.02);for(const sign of [-1,1]){box(1.1,.19,.035,1.28,1.12,sign*1.055,black,parts.flatbed,.015);box(.23,.025,.04,1.29,1.14,sign*1.08,chrome,parts.flatbed,.008)}
 // Camper lower shell, cab-over berth, windows and rear entrance.
 parts.shell=new T.Group();conversion.add(parts.shell);const sh=parts.shell;
 box(2.22,1.12,.065,1.56,1.79,-1.025,camper,sh,.02);box(2.22,1.12,.065,1.56,1.79,1.025,camper,sh,.02);box(.065,1.12,.66,2.65,1.79,-.70,camper,sh,.02);box(.065,1.12,.66,2.65,1.79,.75,camper,sh,.02);box(.065,.16,.8,2.65,2.27,.025,camper,sh);box(.065,1.12,2.06,.47,1.79,0,camper,sh,.02);
 profile([[-1.3,2.02],[-1.3,2.23],[-1.07,2.36],[.49,2.36],[.49,2.02]],2.04,camper,sh);box(1.5,.055,1.85,-.32,2,0,dark,sh);
 for(const sign of [-1,1]){box(1.18,.44,.026,1.16,1.91,sign*1.065,black,sh,.025);box(1.07,.34,.029,1.16,1.91,sign*1.081,glass,sh,.02);box(.025,.34,.035,1.16,1.91,sign*1.10,chrome,sh);box(2.1,.047,.02,1.56,1.35,sign*1.064,mat('#695a43'),sh);box(.4,.17,.03,2.26,1.56,sign*1.071,black,sh);for(let j=0;j<4;j++)box(.33,.013,.036,2.26,1.50+j*.04,sign*1.09,chrome,sh);for(const x of [.57,1.35,2.55])for(const y of [1.27,2.29])box(.02,.02,.026,x,y,sign*1.07,chrome,sh);}
 const door=new T.Group();door.position.set(2.73,1.32,-.30);sh.add(door);parts.door=door;
 box(.035,.96,.7,0,.45,.35,dark,door,.02);box(.04,.89,.63,.025,.45,.35,camper,door,.02);box(.045,.29,.46,.05,.69,.35,glass,door,.015);box(.06,.04,.12,.065,.38,.57,black,door);
 const drawer=new T.Group();parts.flatbed.add(drawer);parts.drawer=drawer;box(1.04,.13,.7,1.28,1.11,1.1,wood,drawer);box(1.1,.19,.035,1.28,1.12,1.47,dark,drawer,.01);box(.23,.025,.04,1.28,1.14,1.50,chrome,drawer);
 box(.32,.06,.65,2.8,1.15,0,dark,sh);box(.1,.29,.4,2.89,.96,0,chrome,sh);for(const sign of [-1,1]){const tail=box(.05,.19,.12,2.74,1.21,sign*.89,mat('#a83c31'),sh);tail.userData.vehicleLamp='tail';box(.04,.06,.12,2.74,1.1,sign*.89,light,sh)}
 // Pop-up fabric walls, mesh windows and lift struts move with the roof.
 box(3.94,.065,2.18,.71,0,0,camper,roof,.02);box(3.94,.026,2.2,.71,.044,0,black,roof);for(const sign of [-1,1])box(3.7,.045,.035,.71,.11,sign*.98,dark,roof);
 for(const sign of [-1,1]){box(3.8,.62,.026,.71,.31,sign*1.015,canvas,softwall);for(const x of [-.62,.55,1.72]){box(.74,.35,.029,x,.31,sign*1.036,black,softwall,.03);box(.66,.28,.031,x,.31,sign*1.055,mat('#918b6c'),softwall,.025);for(let j=0;j<6;j++)box(.66,.004,.034,x,.19+j*.046,sign*1.075,dark,softwall)}}
 for(const x of [-1.18,2.6])box(.026,.62,2.03,x,.31,0,canvas,softwall);
 // One 170W roof panel is always included. The second is an optional upgrade.
 parts.standardSolar=createAccessory('extraSolar');parts.standardSolar.position.set(-.3,.15,0);roof.add(parts.standardSolar);
 for(const id of ACCESSORY_IDS){const g=createAccessory(id,{wood,body:camper});parts[id]=g;mountAccessory(id,g);(id==='extraSolar'?roof:conversion).add(g);}
 const interiorKit=createInteriorKit();parts.furniture=interiorKit.root;parts.furniture.rotation.y=Math.PI/2;parts.furniture.scale.set(.92,.78,.86);parts.furniture.position.set(.8,1.24,0);conversion.add(parts.furniture);
 const cabinLight=new T.PointLight('#ffd49b',0,5);cabinLight.position.set(.8,2.7,0);root.add(cabinLight);
 function update(s,catalog,{roofOpen=true,cutaway=false,night=false,doorOpen=false,storageOpen=false,awningOpen=true,driverDoorOpen=false}={}){driverDoor.rotation.y=driverDoorOpen?-1.2:0;door.rotation.y=doorOpen?1.65:0;drawer.position.z=storageOpen?.7:0;drawer.visible=storageOpen&&s.model==='basecamp';camper.color.set(catalog.colors.find(c=>c.id===s.color).hex);wood.color.set(catalog.woods.find(w=>w.id===s.wood).hex);fabric.color.set(catalog.fabrics.find(f=>f.id===s.fabric).hex);const open=roofOpen&&!cutaway;roof.position.y=open?3.04:2.40;softwall.position.y=2.40;softwall.visible=open;roof.visible=!cutaway;parts.shell.visible=!cutaway;parts.flatbed.visible=s.model==='basecamp';parts.furniture.visible=roofOpen||cutaway||doorOpen;interiorKit.update(s,{cutaway:true,externalAccessories:true,inspectStorage:storageOpen});if(s.interior){themeInteriorAccessory(parts.indoorShower,s.interior.finishes);themeInteriorAccessory(parts.mosquito,s.interior.finishes);}for(const id of ['awning','annex','showerAwning','extraSolar','outdoorLights','molle','accessDoor','mosquito','kitchen','indoorShower'])parts[id].visible=s.addons.includes(id);parts.awning.visible=parts.awning.visible&&awningOpen;parts.annex.visible=parts.annex.visible&&awningOpen;parts.indoorShower.visible=s.addons.includes('indoorShower')&&cutaway;parts.kitchen.visible=false;parts.mosquito.visible=s.addons.includes('mosquito');conversion.scale.z=s.model==='backpack'?.92:1;if(s.model==='backpack'){parts.flatbed.visible=false;}parts.outdoorLights.traverse(o=>{if(o.isLight)o.intensity=night?4:0});cabinLight.intensity=night?4:0;}
 return{root,parts,roof,softwall,wood,fabric,wheels,interiorKit,update};
}
