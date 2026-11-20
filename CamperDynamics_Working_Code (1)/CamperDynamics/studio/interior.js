import {createInteriorKit} from './interior-kit.js';
export function createCabin(T){
 const scene=new T.Scene();scene.background=new T.Color('#dad8ca');const kit=createInteriorKit();scene.add(kit.root);scene.userData.renderRoot=kit.root;
 const hemi=new T.HemisphereLight('#fff9e8','#9f8e71',2.4);scene.add(hemi);const sun=new T.DirectionalLight('#fff4db',2.3);sun.position.set(-3,4,1);scene.add(sun);
 return {...kit,scene,hemi,sun,hotspots:[{id:'sleep',feature:'bed',label:'Sleeping nook',point:new T.Vector3(0,.89,-1.64),text:'Bed, mattress, bedding, pillows and bedside fittings can be edited individually in Interior.'},{id:'galley',feature:'galleyCabinets',label:'Compact galley',point:new T.Vector3(-.74,1,-.6),text:'Edit cupboards, worktop, sink, mixer tap, hob and chopping board independently.'},{id:'lounge',feature:'seating',label:'Dinette & storage',point:new T.Vector3(.73,.68,.4),text:'Customise seating, cushions, table shape, decor and storage in the interior panel.'}]};
}
