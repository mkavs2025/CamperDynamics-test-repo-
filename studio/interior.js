import {createInteriorKit} from './interior-kit.js';
export function createCabin(T){
 const scene=new T.Scene();scene.background=new T.Color('#19252c');const kit=createInteriorKit();scene.add(kit.root);scene.userData.renderRoot=kit.root;

 const sphereGeo=new T.SphereGeometry(30,60,40);
 sphereGeo.scale(-1,1,1);
 const textureLoader=new T.TextureLoader();
 let panoramaTexture=null;
 const panoramaMat=new T.MeshBasicMaterial({side:T.DoubleSide,depthWrite:false});
 const panoramaMesh=new T.Mesh(sphereGeo,panoramaMat);
 panoramaMesh.renderOrder=-10;
 scene.add(panoramaMesh);

 let customizing=false;
 function applyCustomizingState(){
  if(customizing){
   kit.root.visible=true;
   panoramaMesh.visible=false;
   scene.background=new T.Color('#dad8ca');
  }else{
   kit.root.visible=false;
   panoramaMesh.visible=true;
   if(panoramaTexture)scene.background=panoramaTexture;
  }
 }

 textureLoader.load('assets/real.jpg',tex=>{
  tex.colorSpace=T.SRGBColorSpace;
  tex.mapping=T.EquirectangularReflectionMapping;
  panoramaTexture=tex;
  panoramaMat.map=tex;
  panoramaMat.needsUpdate=true;
  if(!customizing){
   scene.background=tex;
  }
 });

 function setCustomizing(val){
  customizing=val;
  applyCustomizingState();
 }
 setCustomizing(false);

 const hemi=new T.HemisphereLight('#fff9e8','#9f8e71',2.4);scene.add(hemi);const sun=new T.DirectionalLight('#fff4db',2.3);sun.position.set(-3,4,1);scene.add(sun);
 return {
  ...kit,
  scene,
  hemi,
  sun,
  panoramaMesh,
  setCustomizing,
  get customizing(){return customizing;},
  hotspots:[
   {id:'sleep',feature:'bed',label:'Sleeping nook',point:new T.Vector3(0,.89,-1.64),text:'Bed, mattress, bedding, pillows and bedside fittings can be edited individually in Interior.'},
   {id:'galley',feature:'galleyCabinets',label:'Compact galley',point:new T.Vector3(-.74,1,-.6),text:'Edit cupboards, worktop, sink, mixer tap, hob and chopping board independently.'},
   {id:'lounge',feature:'seating',label:'Dinette & storage',point:new T.Vector3(.73,.68,.4),text:'Customise seating, cushions, table shape, decor and storage in the interior panel.'}
  ]
 };
}
