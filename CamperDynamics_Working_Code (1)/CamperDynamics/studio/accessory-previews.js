import * as T from './three.module.js';
import {createAccessory} from './accessories.js';
import {themeInteriorAccessory} from './interior-kit.js';
import {SoftwareRenderer} from './software-renderer.js';
const cache=new Map(),pending=new Set();let renderer,busy=false,style={wood:'#bfa47d',body:'#c4aa7e'};const key=id=>id+'|'+style.wood+'|'+style.body+(['indoorShower','mosquito'].includes(id)?JSON.stringify(style.interior||{}):'');
export const accessoryImage=id=>cache.get(key(id));
function makePreview(id){
 if(!renderer){try{renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true})}catch{renderer=new SoftwareRenderer()}renderer.setPixelRatio(1);renderer.setSize(320,260);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}
 const scene=new T.Scene();scene.background=new T.Color('#182125');const root=createAccessory(id,{wood:new T.MeshStandardMaterial({color:style.wood,roughness:.8}),body:new T.MeshStandardMaterial({color:style.body,roughness:.48,metalness:.18})});if(['indoorShower','mosquito'].includes(id)&&style.interior)themeInteriorAccessory(root,style.interior);scene.add(root);scene.userData.renderRoot=root;scene.userData.cacheKey=id;const box=new T.Box3().setFromObject(root),center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());root.position.sub(center);root.updateMatrixWorld(true);
 const camera=new T.PerspectiveCamera(35,320/260,.03,80),dist=Math.max(size.y,size.x/1.23,size.z)*2.15;camera.position.set(dist*.65,dist*.42,dist*.85);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 scene.add(new T.HemisphereLight('#eff1e5','#30332b',2));const key=new T.DirectionalLight('#fff0d6',3);key.position.set(-3,5,5);scene.add(key);const rim=new T.DirectionalLight('#bec9ce',2);rim.position.set(3,3,-3);scene.add(rim);renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');root.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m?.dispose())});return url;
}
function apply(){document.querySelectorAll('[data-accessory-preview]').forEach(img=>{const url=cache.get(key(img.dataset.accessoryPreview));if(url){img.src=url;img.dataset.modelSource='shared-3d';}})}
async function work(){if(busy)return;busy=true;while(pending.size){const id=pending.values().next().value;pending.delete(id);if(!cache.has(key(id))){try{cache.set(key(id),makePreview(id))}catch(e){console.error('Accessory preview failed',id,e)}}apply();await new Promise(resolve=>setTimeout(resolve,25));}busy=false;}
export function renderAccessoryPreviews(colors){if(colors)style=colors;document.querySelectorAll('[data-accessory-preview]').forEach(img=>{if(!cache.has(key(img.dataset.accessoryPreview)))pending.add(img.dataset.accessoryPreview)});apply();work();}
