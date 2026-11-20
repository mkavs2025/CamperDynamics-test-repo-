import {MOVABLE} from './layout-config.js';
import * as T from './three.module.js';
import {INTERIOR_FEATURES,normalizeInterior,interiorEnabled} from './interior-config.js';
import {createAccessory} from './accessories.js';
export function themeInteriorAccessory(root,finishes){root.traverse(o=>{if(!o.isMesh)return;if(!o.userData.interiorRole){o.material=o.material.clone();const hex=o.material.color.getHexString();o.userData.interiorRole=o.name==='folded-fabric'?'curtains':o.material.metalness>.2?'metal':['232a29','3c403b'].includes(hex)?'trim':'counter';}o.material.color.set(finishes[o.userData.interiorRole]);});}
export function createInteriorKit(){
 const root=new T.Group(),shell=new T.Group(),groups={},parts={},materials={},lights=[];root.add(shell);
 const roles={wood:'#bfa47d',upholstery:'#d2c2a5',walls:'#e5ddcb',ceiling:'#f0eadc',floor:'#8c7154',counter:'#d1c9b6',curtains:'#a89b80',accent:'#7e8d68',linen:'#f1e9d7',trim:'#333c35',metal:'#a8b4b0'};
 function mat(role,owner='shell'){const key=owner+':'+role;if(!materials[key]){materials[key]=new T.MeshStandardMaterial({color:roles[role],roughness:role==='metal'?.3:.85,metalness:role==='metal'?.6:0});materials[key].userData.role=role;materials[key].userData.owner=owner;}return materials[key];}
 function group(id){const g=new T.Group();g.name=id;root.add(g);groups[id]=g;return g;}INTERIOR_FEATURES.forEach(f=>group(f.id));
 function box(w,h,d,x,y,z,role,parent=shell,owner=parent.name||'shell'){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(role,owner));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function cyl(r,h,x,y,z,role,parent,owner=parent.name){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,20),mat(role,owner));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 function addRange(id,fn){fn(groups[id]);}
 // Structural surfaces stay enclosed for 360° viewing; each finish is editable.
 box(2.2,.08,4.5,0,-.04,0,'floor',root,'shell');for(let i=0;i<13;i++)box(.006,.003,4.5,-1.05+i*.175,.004,0,'trim',root,'shell');box(2.2,.08,4.5,0,2.23,0,'ceiling');
 box(2.2,2.2,.08,0,1.1,-2.25,'walls');box(2.2,2.2,.08,0,1.1,2.25,'walls');
 for(const x of [-1.1,1.1]){box(.08,1.05,4.5,x,.525,0,'walls');box(.08,.34,4.5,x,2.05,0,'walls');box(.08,.81,1.1,x,1.455,-1.7,'walls');box(.08,.81,1.55,x,1.455,1.475,'walls');
  box(.055,.77,1.79,x,1.46,-.3,'trim');const win=box(.06,.64,1.63,x+(x>0?-.02:.02),1.46,-.3,'counter');win.material=new T.MeshStandardMaterial({color:'#91aca1',roughness:.35});
  for(let layer=0;layer<2;layer++){const shape=new T.Shape();shape.moveTo(-.78,1.15);shape.lineTo(-.78,1.34);shape.lineTo(-.43,1.66-layer*.12);shape.lineTo(-.08,1.38);shape.lineTo(.28,1.72-layer*.12);shape.lineTo(.78,1.29);shape.lineTo(.78,1.15);shape.closePath();const m=new T.MeshStandardMaterial({color:layer?'#748878':'#9cae9b',side:T.DoubleSide});const mountain=new T.Mesh(new T.ShapeGeometry(shape),m);mountain.rotation.y=Math.PI/2;mountain.position.set(x+(x>0?-(.065+layer*.004):(.065+layer*.004)),0,-.3);shell.add(mountain);}
  const sg=groups.windowShelves;box(.18,.045,2.02,x+(x>0?-.08:.08),1.02,-.3,'wood',sg);
  const cg=groups.curtains;for(const z of [-1.25,.65])for(let i=0;i<5;i++)box(.12,.84,.04,x+(x>0?-.11:.11)+Math.sin(i*1.4)*.012,1.48,z+(i-2)*.035,'curtains',cg);
 }
 const closedCurtains=new T.Group();groups.curtains.add(closedCurtains);for(const x of [-1,1])for(let i=0;i<24;i++)box(.05,.79,.074,x+Math.sin(i*1.4)*.015,1.47,-1.12+i*.071,'curtains',closedCurtains,'curtains');const openCurtains=groups.curtains.children.filter(o=>o!==closedCurtains);
 const doors=new T.Group(),shelves=new T.Group();groups.upperCupboards.add(doors,shelves);
 for(const x of [-.95,.95]){for(const y of [1.82,2.16])box(.32,.035,2.72,x,y,-.2,'wood',groups.upperCupboards);for(const z of [-1.56,1.16])box(.32,.34,.035,x,1.99,z,'wood',groups.upperCupboards);
  for(let z=-1.25;z<1.1;z+=.66){box(.032,.28,.60,x+(x>0?-.17:.17),1.99,z,'wood',doors,'upperCupboards');box(.045,.022,.17,x+(x>0?-.195:.195),1.9,z,'trim',doors,'upperCupboards');box(.30,.018,.025,x,1.91,z,'accent',shelves,'upperCupboards');}
  box(.035,.016,2.7,x+(x>0?-.18:.18),1.80,-.2,'accent',groups.upperLighting);
 }
 addRange('entranceCabinet',g=>{box(.48,.66,.44,-.78,.33,1.7,'wood',g);box(.50,.035,.46,-.78,.68,1.7,'counter',g);box(.02,.05,.16,-.525,.55,1.7,'metal',g);});
 const galleyPanels=[];addRange('galleyCabinets',g=>{box(.035,.84,2.43,-1.05,.42,-.18,'wood',g);for(const y of [.025,.42,.82])box(.56,.035,2.43,-.79,y,-.18,'wood',g);for(const z of [-1.38,1.04])box(.56,.84,.035,-.79,.42,z,'wood',g);for(let z=-1.08;z<1.1;z+=.54){galleyPanels.push(box(.02,.71,.49,-.495,.43,z,'wood',g),box(.022,.71,.012,-.48,.43,z+.25,'trim',g),box(.04,.025,.21,-.46,.71,z,'metal',g));}});
 addRange('worktop',g=>box(.64,.07,2.52,-.76,.89,-.18,'counter',g));
 addRange('sink',g=>{box(.36,.018,.5,-.75,.937,-.78,'metal',g);box(.28,.02,.40,-.75,.95,-.78,'trim',g);});
 addRange('tap',g=>{cyl(.018,.25,-.95,1.03,-.76,'metal',g);box(.16,.025,.025,-.88,1.15,-.76,'metal',g);cyl(.027,.06,-.95,.96,-.76,'metal',g);});
 addRange('hob',g=>{box(.4,.028,.5,-.73,.944,.25,'trim',g);const ring=new T.Mesh(new T.TorusGeometry(.13,.009,8,30),mat('metal','hob'));ring.rotation.x=Math.PI/2;ring.position.set(-.73,.965,.25);g.add(ring);});
 addRange('choppingBoard',g=>box(.29,.025,.25,-.75,.948,.78,'wood',g));
 addRange('seating',g=>box(.59,.35,1.95,.79,.175,.03,'wood',g));
 addRange('seatCushions',g=>{box(.59,.16,1.95,.79,.43,.03,'upholstery',g);box(.13,.51,1.95,1.015,.7,.03,'upholstery',g);for(const z of [-.6,.05,.7])box(.5,.008,.009,.79,.517,z,'linen',g);});
 addRange('throwPillows',g=>{for(const z of [-.6,.05,.7]){const p=box(.15,.35,.4,.88,.72,z,'accent',g);p.rotation.z=.12;}});
 const roundTable=cyl(.40,.055,.46,.79,.05,'wood',groups.table);const rectangularTable=box(.63,.055,.88,.46,.79,.05,'wood',groups.table);cyl(.028,.74,.46,.39,.05,'metal',groups.table);
 addRange('tableDecor',g=>{box(.38,.025,.2,.43,.83,-.13,'linen',g);box(.34,.018,.18,.43,.853,-.13,'accent',g);});
 const doubleBed=new T.Group(),twinBed=new T.Group();groups.bed.add(doubleBed,twinBed);box(2,.61,1.03,0,.305,-1.69,'wood',doubleBed,'bed');for(const x of [-.55,.55])box(.88,.61,1.03,x,.305,-1.69,'wood',twinBed,'bed');
 const doubleMattress=box(1.98,.16,1.01,0,.69,-1.69,'upholstery',groups.mattress);const twinMattresses=[-.55,.55].map(x=>box(.86,.16,1.01,x,.69,-1.69,'upholstery',groups.mattress));
 addRange('blanket',g=>{box(1.99,.045,.49,0,.795,-1.43,'accent',g);for(let i=0;i<14;i++)box(.04,.006,.4,-.95+i*.146,.82,-1.43,'linen',g);});
 addRange('bedPillows',g=>{for(const x of [-.48,.48]){const p=box(.63,.12,.38,x,.83,-1.96,'linen',g);p.rotation.y=x*.1;}});
 addRange('bedsideShelves',g=>{for(const x of [-.73,.73])box(.22,.025,.18,x,1.04,-2.13,'wood',g);});
 addRange('bedsideLamps',g=>{for(const x of [-.73,.73]){cyl(.05,.08,x,1.12,-2.13,'accent',g);const light=new T.PointLight('#ffe0ad',.8,1.5);light.position.set(x,1.25,-2.05);g.add(light);}});
 addRange('interiorDoor',g=>{box(.8,1.96,.04,0,.98,2.19,'walls',g);box(.53,.47,.03,0,1.54,2.16,'counter',g);box(.025,.15,.04,.31,.95,2.13,'metal',g);});
 addRange('floorMat',g=>{box(.65,.012,.49,0,.012,1.79,'accent',g);for(let i=0;i<7;i++)box(.005,.002,.47,-.29+i*.096,.02,1.79,'linen',g);});
 addRange('coatHooks',g=>{for(const x of [-.48,.48])box(.025,.075,.05,x,1.77,2.15,'metal',g);});
 addRange('plant',g=>{cyl(.075,.12,-.78,.79,1.7,'accent',g);for(let i=0;i<5;i++){const p=box(.02,.23,.10,-.78+(i-2)*.02,.93,1.7,'upholstery',g);p.rotation.z=(i-2)*.28;}});
 addRange('ceilingLights',g=>{for(const z of [-1.35,0,1.35]){cyl(.074,.015,0,2.17,z,'metal',g);cyl(.057,.017,0,2.159,z,'linen',g);const light=new T.PointLight('#ffe1ab',3,3.8);light.position.set(0,2.08,z);g.add(light);lights.push(light);}});
 addRange('ceilingBattens',g=>{for(let z=-2;z<2.2;z+=.3)box(2.16,.012,.018,0,2.18,z,'wood',g);});
 addRange('wallDecor',g=>{box(.42,.38,.035,.58,1.45,2.18,'wood',g);box(.35,.31,.04,.58,1.45,2.15,'linen',g);box(.27,.16,.042,.58,1.42,2.12,'accent',g);});
 galleyPanels.forEach(o=>o.userData.restX=o.position.x);const shower=createAccessory('indoorShower');shower.position.set(.71,.03,1.66);root.add(shower);const insectScreen=createAccessory('mosquito');insectScreen.position.set(0,.08,2.12);root.add(insectScreen);
 function update(state,{cutaway=false,externalAccessories=false,inspectStorage=false,gameMode=false}={}){
  const config=state.interior||normalizeInterior();for(const f of INTERIOR_FEATURES)groups[f.id].visible=interiorEnabled({...state,interior:config},f.id);
  for(const m of Object.values(materials)){const f=INTERIOR_FEATURES.find(f=>f.id===m.userData.owner);m.color.set(f&&f.role===m.userData.role&&config.items[f.id].color?config.items[f.id].color:config.finishes[m.userData.role]);}
  doubleBed.visible=doubleMattress.visible=config.bedStyle==='double';twinBed.visible=config.bedStyle==='twin';twinMattresses.forEach(o=>o.visible=config.bedStyle==='twin');roundTable.visible=config.tableShape==='round';rectangularTable.visible=config.tableShape==='rectangular';closedCurtains.visible=config.curtainStyle==='closed';openCurtains.forEach(o=>o.visible=config.curtainStyle==='open');doors.visible=config.cabinetStyle==='doors'&&!inspectStorage;shelves.visible=config.cabinetStyle==='shelves'||inspectStorage;galleyPanels.forEach(o=>o.position.x=o.userData.restX+(inspectStorage?.23:0));
  for(const f of INTERIOR_FEATURES){let id=f.id,parent=f;while(!MOVABLE[id]&&parent?.parent){id=parent.parent;parent=INTERIOR_FEATURES.find(x=>x.id===id);}const move=MOVABLE[id],p=config.placements?.[id];groups[f.id].position.set(p&&move?p.x-move.x:0,0,p&&move?p.z-move.z:0);if(f.kitchen){groups[f.id].scale.z=.8;groups[f.id].position.z+=.2;}}shell.visible=!cutaway;shower.visible=!externalAccessories&&state.addons.includes('indoorShower')&&!gameMode;insectScreen.visible=!externalAccessories&&state.addons.includes('mosquito');
  themeInteriorAccessory(shower,config.finishes);themeInteriorAccessory(insectScreen,config.finishes);root.userData.interiorConfig=config;
 }
 return {root,shell,groups,materials,lights,shower,insectScreen,update};
}
