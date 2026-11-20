import * as T from './three.module.js';
export const ACCESSORY_IDS=['awning','annex','showerAwning','extraSolar','outdoorLights','molle','accessDoor','kitchen','mosquito','indoorShower'];
// These meshes are used by both the fitted camper and the catalogue previews.
export function createAccessory(id,{wood,body}={}){
 const root=new T.Group();root.name=id;root.userData.accessory=id;
 const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
 const black=material('#232a29'),frame=material('#555e5d',.36,.65),silver=material('#b6bfbb',.26,.8),cloth=material('#81796d'),edge=material('#3c403b'),tan=material('#c4ac7c'),ivory=material('#d1d0bc'),timber=wood||material('#ad9471'),paint=body||material('#b9b6a3');
 function mesh(geometry,m,x=0,y=0,z=0,parent=root){const o=new T.Mesh(geometry,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function box(w,h,d,x,y,z,m=black,parent=root){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent)}
 function rod(a,b,r=.012,m=frame,parent=root){const va=new T.Vector3(...a),vb=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r,r,va.distanceTo(vb),7),m,0,0,0,parent);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o}
 function seam(points,m=edge,r=.006,parent=root){for(let i=1;i<points.length;i++)rod(points[i-1],points[i],r,m,parent)}
 function clothPanel(w,h,position,rotation=0,{fold=.045,color=cloth,segments=12,part=0}={}){
  const geo=new T.PlaneGeometry(w,h,segments,12),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),v=(y+h/2)/h,u=(x+w/2)/w;const flutter=Math.sin(u*Math.PI*8+v*.8)*fold*(.35+.65*(1-v))*Math.sin(u*Math.PI);p.setXYZ(i,x*(1+.065*(1-v))+part*(1-v)*Math.sin(v*Math.PI),y,flutter+.035*Math.sin(v*Math.PI)*Math.sin(u*Math.PI)+.014*Math.sin(v*16+u*7)*Math.sin(u*Math.PI));}geo.computeVertexNormals();const panel=mesh(geo,color,...position);panel.rotation.y=rotation;panel.name='folded-fabric';return panel;
 }
 function solar(){box(1.45,.045,1.68,0,.025,0,silver);box(1.39,.012,1.62,0,.056,0,black);const cell=material('#243f54',.3,.25);for(let row=0;row<6;row++)for(let col=0;col<5;col++){box(.262,.008,.245,-.551+col*.276,.066,-.668+row*.267,cell);for(const off of [-.055,.055])box(.002,.002,.239,-.551+col*.276+off,.072,-.668+row*.267,silver);}for(const x of [-.57,.57])for(const z of [-.7,.7]){box(.10,.035,.12,x,-.015,z,frame);mesh(new T.CylinderGeometry(.014,.014,.008,8),silver,x,.053,z);}root.userData.cells=30;}
 function ledBar(w=.7){box(w,.09,.08,0,.04,0,black);box(w-.035,.065,.025,0,.04,.049,silver);const glow=material('#ffdc8e',.35);glow.emissive=new T.Color('#ffc563');glow.emissiveIntensity=.45;for(let i=0;i<8;i++)box((w-.06)/8-.005,.045,.025,-(w-.06)/2+(i+.5)*(w-.06)/8,.04,.065,glow);for(const x of [-w/2+.04,w/2-.04]){rod([x,-.02,0],[x,-.07,-.04],.013);box(.08,.015,.07,x,-.07,-.04,black);}const lamp=new T.PointLight('#ffd59a',0,4);lamp.position.set(0,.02,.15);root.add(lamp);}
 function shower(){
  root.userData.fabricPanels=5;const size=1.08,h=2.08,top=2.17;
  box(size+.08,.06,size+.08,0,top,0,edge);const cap=mesh(new T.ConeGeometry(.82,.18,4),cloth,0,top+.11,0);cap.rotation.y=Math.PI/4;cap.scale.z=1;
  box(1.04,.025,1.04,0,.025,0,black);const liner=material('#292e2a');box(1.06,2.08,.012,0,1.08,-.51,liner);box(.012,2.08,1.06,-.51,1.08,0,liner);box(.012,2.08,1.06,.51,1.08,0,liner);
  for(const x of [-.52,.52])for(const z of [-.52,.52]){rod([x,.04,z],[x,top,z],.013,frame);box(.07,.025,.07,x,.03,z,frame);}
  clothPanel(1.12,h,[0,1.08,-.535],0);clothPanel(1.12,h,[-.535,1.08,0],Math.PI/2);clothPanel(1.12,h,[.535,1.08,0],Math.PI/2);
  // Two tied-back front curtains reveal the actual dark doorway.
  clothPanel(.23,h,[-.44,1.08,.535],0,{fold:.042,part:-.065});clothPanel(.23,h,[.44,1.08,.535],0,{fold:.042,part:.065});
  for(const sign of [-1,1]){seam([[sign*.25,.08,.55],[sign*.32,1.1,.57],[sign*.25,2.12,.55]],tan,.006);box(.19,.036,.04,sign*.4,1.02,.57,edge);seam([[sign*.54,.06,-.55],[sign*.52,1.1,-.55],[sign*.50,2.14,-.55]],tan,.005);}
  for(const z of [-.55,.55]){rod([-.54,2.12,z],[.54,2.12,z],.009,edge);rod([-.55,.07,z],[.55,.07,z],.009,edge);}for(const x of [-.55,.55])rod([x,.07,-.55],[x,.07,.55],.009,edge);
  box(.18,.055,.018,0,2.19,.59,black);box(.08,.025,.022,0,2.19,.605,silver);
  rod([-.50,1.95,-.5],[.43,1.95,.48],.008,frame);root.userData.opening=true;
 }
 function awning(w=3.4,depth=1.8){
  box(w,.13,.16,0,2.38,0,edge);box(w-.06,.045,.08,0,2.43,.04,frame);for(const x of [-w/2+.08,w/2-.08])box(.045,.12,.17,x,2.38,.02,black);
  const geo=new T.PlaneGeometry(w,depth,16,8),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),v=(p.getY(i)+depth/2)/depth;p.setXYZ(i,x,2.40-v*.12-.065*Math.sin(v*Math.PI)*Math.cos(x/w*Math.PI),v*depth);}geo.computeVertexNormals();const canopy=mesh(geo,tan);canopy.name='tensioned-canopy';box(w,.055,.025,0,2.26,depth,edge);
  for(const x of [-w/2+.06,w/2-.06]){rod([x,.04,depth],[x,2.28,depth],.018,frame);rod([x,.04,depth],[x,1.18,depth],.023,frame);box(.10,.025,.10,x,.025,depth,black);rod([x,2.32,.05],[x*.6,2.26,.9],.015,silver);rod([x*.6,2.26,.9],[x,2.26,depth],.015,silver);const joint=mesh(new T.SphereGeometry(.035,8,5),black,x*.6,2.26,.9);rod([x,2.27,depth],[x*1.18,.025,depth+.46],.004,tan);box(.12,.016,.025,x*1.18,.02,depth+.46,frame);}
  for(let i=0;i<6;i++){box(.18,.014,.025,-w*.4+i*w*.16,2.235,depth-.04,ivory);}for(let i=0;i<5;i++)rod([-w/2+i*w/4,2.40,.02],[-w/2+i*w/4,2.26,depth],.004,edge);
 }
 if(id==='showerAwning')shower();
 else if(id==='awning')awning();
 else if(id==='annex'){
  awning(2.7,1.75);clothPanel(1.68,2.14,[-1.34,1.12,.88],Math.PI/2);clothPanel(1.68,2.14,[1.34,1.12,.88],Math.PI/2);clothPanel(.95,2.14,[-.86,1.12,1.76]);clothPanel(.95,2.14,[.86,1.12,1.76]);
  for(const x of [-1.357,1.357]){const window=box(.012,.55,.8,x,1.45,.85,black);for(let i=0;i<11;i++)rod([x,1.2+i*.045,.45],[x,1.2+i*.045,1.25],.0025,frame);}box(.74,.10,.10,0,2.15,1.8,cloth);root.userData.opening=true;
 }
 else if(id==='extraSolar')solar();
 else if(id==='outdoorLights')ledBar();
 else if(id==='molle'){
  // Actual openings between rounded slots, rather than painted rectangles.
  for(const x of [-.48,.48])box(.045,.64,.025,x,.32,0,black);for(const y of [0,.64])box(1.0,.035,.025,0,y,0,black);for(let j=0;j<5;j++){const y=.07+j*.125;box(.94,.03,.025,0,y,0,black);for(let i=0;i<6;i++)box(.028,.10,.025,-.40+i*.16,y+.05,0,black);}for(const x of [-.44,.44])for(const y of [.04,.60])mesh(new T.CylinderGeometry(.018,.018,.02,8),silver,x,y,.025).rotation.x=Math.PI/2;root.userData.openings=30;
 }
 else if(id==='accessDoor'){
  box(.72,.39,.045,0,.20,0,black);box(.65,.32,.025,0,.20,.033,frame);box(.60,.27,.025,0,.20,.05,paint);for(const x of [-.2,.2]){box(.12,.03,.035,x,.36,.06,silver);rod([x-.06,.36,.08],[x+.06,.36,.08],.008,black);}box(.13,.045,.028,0,.10,.08,black);box(.07,.014,.02,0,.10,.10,silver);for(const x of [-.31,.31])for(const y of [.06,.34])mesh(new T.SphereGeometry(.009,6,4),silver,x,y,.06);
 }
 else if(id==='kitchen'){
  box(1.3,.55,.53,0,.275,0,timber);box(1.34,.04,.58,0,.57,0,silver);box(.46,.018,.38,-.34,.595,0,black);box(.39,.012,.31,-.34,.603,0,silver);box(.31,.006,.23,-.34,.61,0,edge);rod([-.52,.60,-.18],[-.52,.81,-.18],.015,silver);seam([[-.52,.81,-.18],[-.52,.84,-.10],[-.52,.80,-.04]],silver,.015);
  box(.46,.015,.35,.33,.60,0,black);for(const x of [.23,.43]){const ring=mesh(new T.TorusGeometry(.065,.008,5,16),frame,x,.615,0);ring.rotation.x=Math.PI/2;}for(const x of [-.43,0,.43]){box(.40,.23,.025,x,.39,.28,timber);box(.18,.018,.028,x,.43,.30,black);box(.40,.23,.025,x,.13,.28,timber);box(.18,.018,.028,x,.18,.30,black);}for(const x of [-.57,.57])for(const z of [-.2,.2])box(.04,.08,.04,x,-.035,z,black);
 }
 else if(id==='mosquito'){
  for(const x of [-.36,.36])rod([x,0,0],[x,1.55,0],.018,edge);for(const y of [0,1.55])rod([-.36,y,0],[.36,y,0],.018,edge);
  for(let i=0;i<21;i++)rod([-.34+i*.034,.02,0],[-.34+i*.034,1.53,0],.0014,frame);for(let i=0;i<32;i++)rod([-.34,.02+i*.048,0],[.34,.02+i*.048,0],.0014,frame);rod([0,.02,.008],[0,1.53,.008],.006,black);for(let i=0;i<8;i++)box(.022,.035,.012,0,.08+i*.19,.014,black);box(.72,.06,.07,0,1.58,0,cloth);
 }
 else if(id==='indoorShower'){
  box(.64,.055,.64,0,.03,0,ivory);box(.54,.012,.54,0,.065,0,silver);mesh(new T.CylinderGeometry(.025,.025,.01,10),black,0,.075,0);for(const x of [-.31,.31])rod([x,.08,-.3],[x,1.8,-.3],.014,silver);rod([-.31,1.8,-.3],[.31,1.8,-.3],.016,silver);clothPanel(.60,1.65,[-.30,.94,0],Math.PI/2,{fold:.025,color:ivory});seam([[.16,1.52,-.29],[.20,1.2,-.29],[.15,.8,-.29],[.04,.48,-.28]],black,.009);const head=mesh(new T.CylinderGeometry(.055,.055,.025,12),frame,.16,1.56,-.25);head.rotation.x=Math.PI/3;box(.14,.06,.04,.15,1.08,-.3,silver);
 }
 else throw new Error('Unknown accessory '+id);
 root.updateMatrixWorld(true);return root;
}
export function mountAccessory(id,group){
 const poses={awning:[.76,0,1.16],annex:[.9,0,1.16],showerAwning:[1.8,0,-1.76],extraSolar:[1.45,.15,0],outdoorLights:[1.45,2.26,1.09],molle:[2.79,1.52,-.65],accessDoor:[1.42,1.20,1.10],kitchen:[1.45,1.25,-.73],mosquito:[2.79,1.28,.04],indoorShower:[2.14,1.28,.58]};group.position.set(...poses[id]);if(id==='showerAwning')group.rotation.y=Math.PI;if(id==='molle'||id==='mosquito')group.rotation.y=Math.PI/2;return group;
}
