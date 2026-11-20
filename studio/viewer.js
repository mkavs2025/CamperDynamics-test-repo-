import * as T from './three.module.js';
import {createVehicle} from './model.js';
import {createCabin} from './interior.js';
import {newDrive,stepDrive,recoverDrive,TRAIL,ROAD,rewardRecord} from './trail.js';
import {createEnvironment} from './environment.js';
import {stepWalker} from './walking.js';
import {spawnPoint} from './campsite.js';
import {SoftwareRenderer} from './software-renderer.js';
export function createViewer(el,onMode){
 const scene=new T.Scene();scene.background=new T.Color('#252b2d');scene.fog=new T.Fog('#252b2d',17,45);const camera=new T.PerspectiveCamera(36,1,.05,70);let renderer,software=false;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false})}catch{renderer=new SoftwareRenderer();software=true}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive Hilux-reference camper model');
 const hemi=new T.HemisphereLight('#eaf2f5','#292a24',2.6);scene.add(hemi);const sun=new T.DirectionalLight('#fff1db',4.2);sun.position.set(-4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:30});sun.shadow.normalBias=.03;scene.add(sun);const rim=new T.DirectionalLight('#bfdaeb',3);rim.position.set(4,6,-5);scene.add(rim);const key=new T.DirectionalLight('#fff5e4',2.4);key.position.set(-5,3,-3);scene.add(key);
 const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:'#303638',roughness:.7}));floor.rotation.x=-Math.PI/2;floor.position.y=.015;floor.receiveShadow=true;scene.add(floor);
 const vehicle=createVehicle();const world=new T.Group();world.add(vehicle.root);const environment=createEnvironment();const campsite=environment.root;campsite.visible=false;world.add(campsite);scene.add(world);scene.userData.renderRoot=world;const cabin=createCabin(T,vehicle.wood,vehicle.fabric);cabin.scene.userData.interior=true;
 let driving=false,drive=newDrive(),assist=false,driverDoorOpen=false;
 const skyColor='#95b7bd';
 let exploring=false,inside=false,doorOpen=false,storageOpen=false,awningOpen=true,walker=spawnPoint('front');const keys=new Set();let campYaw=walker.yaw,campPitch=-.12;
 let gallery='front';let mode='exterior',state,catalog,roofOpen=true,night=false,auto=false,angle=-.9,elevation=.27,distance=12.0,yaw=-.1,pitch=-.12,fov=78,station='living';const stations={entry:[0,1.43,1.6],living:[-.05,1.4,.55],sleeping:[0,1.35,-.85]};const target=new T.Vector3(0,1.70,.25);
 const $=s=>document.querySelector(s);$('#loadMessage').remove();$('#hotspots').innerHTML=cabin.hotspots.map(h=>`<button class="hotspot" id="hot-${h.id}" aria-label="Explore ${h.label}">${h.label}</button>`).join('');cabin.hotspots.forEach(h=>$('#hot-'+h.id).onclick=()=>{const card=$('#featureCard');card.hidden=false;card.innerHTML=`<button aria-label="Close feature">×</button><strong>${h.label}</strong><p>${h.text}</p>`;card.querySelector('button').onclick=()=>card.hidden=true});
 function cameraUpdate(){if(driving){const c=Math.cos(drive.heading),sn=Math.sin(drive.heading);camera.position.set(drive.x+c*8,4.4,drive.z-sn*8);camera.fov=66;camera.far=300;camera.near=.08;camera.lookAt(drive.x-c*3,1.35,drive.z+sn*3);}else if(exploring){camera.position.set(walker.x,(inside?1.43:1.67)+(walker.y||0),walker.z);camera.fov=72;camera.far=300;camera.near=.035;camera.lookAt(camera.position.clone().add(new T.Vector3(Math.sin(campYaw)*Math.cos(campPitch),Math.sin(campPitch),-Math.cos(campYaw)*Math.cos(campPitch))));}else if(mode==='interior'){camera.position.set(...stations[station]);camera.fov=fov;camera.near=.035;camera.lookAt(camera.position.clone().add(new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))));}else{camera.fov=36;camera.near=.05;const r=distance*Math.cos(elevation);camera.position.set(target.x+Math.sin(angle)*r,target.y+Math.sin(elevation)*distance,target.z+Math.cos(angle)*r);camera.lookAt(target)}camera.updateProjectionMatrix();}
 function update(next,cat){state=JSON.parse(JSON.stringify(next));catalog=cat;const gameMode=exploring||driving;vehicle.update(state,catalog,{roofOpen,cutaway:mode==='cutaway',night,doorOpen,storageOpen,awningOpen:gameMode?false:awningOpen,driverDoorOpen,gameMode});cabin.update(state,{inspectStorage:storageOpen,gameMode});scene.userData.cacheKey=cabin.scene.userData.cacheKey=JSON.stringify([state,roofOpen,night,mode,doorOpen,storageOpen,awningOpen,driverDoorOpen,gameMode]);scene.userData.night=cabin.scene.userData.night=night;scene.userData.cutaway=mode==='cutaway';hemi.intensity=night?.6:1.4;sun.intensity=night?.3:2;rim.intensity=night?.4:.6;key.intensity=night?.3:.5;cabin.hemi.intensity=night?.75:2.4;cabin.sun.intensity=night?.15:2.3;cabin.lights.forEach(l=>l.intensity=night?5:1.8);if(exploring){scene.background=new T.Color(night?'#263a46':skyColor);scene.fog=new T.Fog(night?'#263a46':skyColor,65,210);refreshCamp();}}
 function setMode(next){document.body.classList.remove('accessory-focus');target.set(0,1.70,.25);stopExplore();document.body.classList.add('live-view');$('#live360Button').classList.toggle('active',next!=='interior');$('#live360Button').setAttribute('aria-pressed',next!=='interior');mode=next;auto=false;$('#orbit').setAttribute('aria-pressed',false);document.body.classList.toggle('immersive',mode==='interior');$('#hotspots').hidden=mode!=='interior';$('#stations').hidden=mode!=='interior';$('#featureCard').hidden=true;$('#studioLabel').textContent=mode==='interior'?'INTERIOR 360° · '+station.toUpperCase():'LIVE 3D CONFIGURATOR';$('.scene-headline p').textContent=mode==='interior'?'STEP INSIDE. STAY A WHILE.':'THE OPEN ROAD IS CALLING.';$('.scene-headline h2').innerHTML=mode==='interior'?'Your little home.<br>Anywhere.':'Make room<br>for adventure.';$('#viewerHint').textContent=mode==='interior'?'DRAG TO LOOK AROUND 360° · SELECT A VIEWPOINT · SCROLL FOR FIELD OF VIEW':'DRAG TO ROTATE · SCROLL TO ZOOM · YOUR NEXT CHAPTER, IN 360°';document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===mode);b.setAttribute('aria-pressed',b.dataset.view===mode)});if(mode==='cutaway'){distance=11.5;elevation=.64}else if(mode==='exterior'){distance=12.0;elevation=.27}cameraUpdate();if(state)update(state,catalog);if(next==='interior')syncGallery('interior');else if(next==='cutaway')syncGallery('cutaway');else syncGallery('front');onMode?.(mode);}
 function focusAccessory(id){
  if(exploring)return;setMode(['indoorShower','kitchen'].includes(id)?'cutaway':'exterior');document.body.classList.add('accessory-focus');
  const part=vehicle.parts[id];vehicle.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(part);if(box.isEmpty())return;box.getCenter(target);const size=box.getSize(new T.Vector3());distance=Math.max(4.5,size.length()*1.75);elevation=id==='extraSolar'?.65:.16;angle=id==='showerAwning'?2.85:['molle','mosquito'].includes(id)?1.35:-.65;cameraUpdate();$('#studioLabel').textContent='LIVE 3D / '+catalog.addons.find(a=>a.id===id).name.toUpperCase();
 }
 function zoom(delta){if(mode==='interior')fov=T.MathUtils.clamp(fov+delta*4,45,100);else distance=T.MathUtils.clamp(distance+delta,6.8,17);cameraUpdate()}
 function reset(){if(mode!=='interior'){target.set(0,1.70,.25);document.body.classList.remove('accessory-focus');}auto=false;$('#orbit').setAttribute('aria-pressed',false);if(mode==='interior'){yaw=-.1;pitch=-.12;fov=78}else{angle=-.9;elevation=mode==='cutaway'?.64:.27;distance=mode==='cutaway'?11.5:12.0}cameraUpdate()}
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setMode(b.dataset.view));document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>{station=b.dataset.station;yaw=station==='sleeping'?Math.PI:0;pitch=-.12;document.querySelectorAll('[data-station]').forEach(n=>n.classList.toggle('active',n===b));$('#studioLabel').textContent='INTERIOR 360° · '+station.toUpperCase();$('#featureCard').hidden=true;cameraUpdate()});
 function syncGallery(id){gallery=id;document.querySelectorAll('[data-gallery]').forEach(b=>b.classList.toggle('active',b.dataset.gallery===id));}
 function preset(id){setMode(id==='interior'?'interior':id==='cutaway'?'cutaway':'exterior');if(id==='rear'){angle=2.5;elevation=.22;distance=11.6}else if(id==='front'){angle=-.9;elevation=.24;distance=12.0}cameraUpdate();syncGallery(id);}
 $('#live360Button').onclick=()=>preset('front');document.querySelectorAll('[data-gallery]').forEach(b=>b.onclick=()=>preset(b.dataset.gallery));const order=['front','rear','interior','cutaway'];$('#galleryNext').onclick=()=>preset(order[(order.indexOf(gallery)+1)%order.length]);$('#galleryPrev').onclick=()=>preset(order[(order.indexOf(gallery)+order.length-1)%order.length]);
 $('#zoomIn').onclick=()=>zoom(-.7);$('#zoomOut').onclick=()=>zoom(.7);$('#cameraReset').onclick=reset;$('#orbit').onclick=()=>{auto=!auto;$('#orbit').setAttribute('aria-pressed',auto)};$('#roof').onclick=()=>{roofOpen=!roofOpen;$('#roof').setAttribute('aria-pressed',roofOpen);$('#roof span').textContent=roofOpen?'Roof open':'Roof closed';update(state,catalog)};$('#night').onclick=()=>{night=!night;$('#night').setAttribute('aria-pressed',night);$('#night').textContent=night?'☾':'☀';update(state,catalog)};
 function syncFullscreen(){const full=!!document.fullscreenElement||el.classList.contains('game-expanded');$('#gameFullscreen').textContent=full?'Exit fullscreen':'Fullscreen';$('#gameFullscreen').setAttribute('aria-pressed',full);}
 $('#fullscreen').onclick=async()=>{if(el.classList.contains('game-expanded')){el.classList.remove('game-expanded');document.body.classList.remove('game-expanded');syncFullscreen();return}try{if(document.fullscreenElement)await document.exitFullscreen();else await el.requestFullscreen()}catch{el.classList.add('game-expanded');document.body.classList.add('game-expanded');}syncFullscreen();};
 $('#gameFullscreen').onclick=()=>$('#fullscreen').click();
 document.addEventListener('fullscreenchange',syncFullscreen);

 function syncDayNightButton(){const btn=$('#gameDayNight'),icon=$('#dayNightIcon'),label=$('#dayNightLabel');if(!btn)return;btn.setAttribute('aria-pressed',night);if(icon)icon.textContent=night?'☾':'☀';if(label)label.textContent=night?'Night':'Day';}
 function toggleDayNight(){night=!night;syncDayNightButton();update(state,catalog);}
 if($('#gameDayNight'))$('#gameDayNight').onclick=toggleDayNight;

 let tutorialTimer=null,tutorialStage=1;
 function showTutorial(stage){
  tutorialStage=stage;const pop=$('#gameTutorialPop'),text=$('#gameTutorialText'),step=$('#gameTutorialStep');
  if(!pop||!text)return;
  clearTimeout(tutorialTimer);
  if(stage===1){
   text.textContent='Use WASD or arrow keys and space bar to jump to move';
   if(step)step.textContent='1 / 2';
   pop.hidden=false;pop.classList.remove('stage-2');
   pop.style.animation='none';void pop.offsetWidth;pop.style.animation='popSlideIn .35s cubic-bezier(0.16, 1, 0.3, 1)';
   tutorialTimer=setTimeout(()=>{showTutorial(2);},5000);
  }else if(stage===2){
   text.textContent='Tap on the drivers door to drive or tap on the rear door to get inside the camper.';
   if(step)step.textContent='2 / 2';
   pop.hidden=false;pop.classList.add('stage-2');
   pop.style.animation='none';void pop.offsetWidth;pop.style.animation='popSlideIn .35s cubic-bezier(0.16, 1, 0.3, 1)';
  }
 }
 if($('#closeTutorialPop'))$('#closeTutorialPop').onclick=e=>{e.stopPropagation();clearTimeout(tutorialTimer);const p=$('#gameTutorialPop');if(p)p.hidden=true;};

 function rideCamper(){driverDoorOpen=true;update(state,catalog);startDrive();}
 function enterRearDoor(){doorOpen=true;inside=true;keys.clear();mode='interior';walker={x:0,z:1.6};campYaw=0;campPitch=-.10;cameraUpdate();update(state,catalog);refreshCamp();}
 function exitCamper(){doorOpen=true;inside=false;keys.clear();mode='exterior';walker=spawnPoint('rear');campYaw=walker.yaw;campPitch=-.10;cameraUpdate();update(state,catalog);refreshCamp();}
 function useDoor(driver){if(driver)rideCamper();else if(inside)exitCamper();else enterRearDoor();}
 $('#worldDriverDoor').onclick=rideCamper;
 $('#worldRearDoor').onclick=()=>{if(inside)exitCamper();else enterRearDoor();};
 if($('#worldExitDoor'))$('#worldExitDoor').onclick=exitCamper;

 function positionDoorTargets(){
  if(inside){
   const b=$('#worldExitDoor');
   if(b){b.hidden=false;b.style.cssText='position:absolute;left:50%;bottom:95px;transform:translateX(-50%);width:auto;min-width:140px;height:42px;background:#182d28f0;border:1.5px solid #dfc282;border-radius:20px;color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;padding:0 18px;box-shadow:0 8px 24px #0008;z-index:45;cursor:pointer;backdrop-filter:blur(10px);';b.textContent='🚪 Tap to exit camper';}
   $('#worldDriverDoor').hidden=true;$('#worldRearDoor').hidden=true;return;
  }
  if($('#worldExitDoor'))$('#worldExitDoor').hidden=true;
  const targets=[['#worldDriverDoor',vehicle.parts.driverDoor,'driver'],['#worldRearDoor',vehicle.parts.door,'rear']];
  for(const [id,obj,name] of targets){const b=$(id);b.hidden=true;if(!exploring||inside||document.body.classList.contains('driving'))continue;obj.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(obj),center=box.getCenter(new T.Vector3());if(center.distanceTo(camera.position)>16)continue;const view=center.clone().applyMatrix4(camera.matrixWorldInverse);if(view.z>=0)continue;
   const screen=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])screen.push(new T.Vector3(x,y,z).project(camera));const xs=screen.map(p=>(p.x*.5+.5)*el.clientWidth),ys=screen.map(p=>(-.5*p.y+.5)*el.clientHeight),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
   if(left<0||top<0||left+width>el.clientWidth||top+height>el.clientHeight)continue;b.hidden=false;b.style.cssText=`left:${left}px;top:${top}px;width:${Math.max(28,width)}px;height:${Math.max(28,height)}px`;b.setAttribute('title',name==='driver'?'Tap driver door to drive':'Tap rear door to enter camper');b.setAttribute('aria-label',name==='driver'?'Tap driver door to drive':'Tap rear door to enter camper');
  }
 }
 const doorRay=new T.Raycaster(),doorMouse=new T.Vector2();let clickStart=null;
 el.addEventListener('pointerdown',e=>{if(!e.target.closest('button')&&!e.target.closest('#gameJoystick'))clickStart={x:e.clientX,y:e.clientY};});
 el.addEventListener('pointerup',e=>{if(!clickStart)return;const start=clickStart;clickStart=null;if(!exploring||inside||driving||e.target.closest('button')||e.target.closest('#gameJoystick')||Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)return;
  const bounds=el.getBoundingClientRect();doorMouse.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);camera.updateMatrixWorld();vehicle.root.updateMatrixWorld(true);doorRay.setFromCamera(doorMouse,camera);
  const hits=doorRay.intersectObjects([vehicle.parts.driverDoor,vehicle.parts.door],true);const hit=hits.find(h=>h.distance<15);if(!hit)return;let node=hit.object;while(node&&node!==vehicle.parts.driverDoor&&node!==vehicle.parts.door)node=node.parent;useDoor(node===vehicle.parts.driverDoor);
 });
 const pointers=new Map();let pinch=0;const pinchLength=()=>{const p=[...pointers.values()];return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};
 el.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.target.closest('#gameJoystick'))return;el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2)pinch=pinchLength();auto=false;$('#orbit').setAttribute('aria-pressed',false);});
 el.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const p=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const n=pinchLength();zoom((pinch-n)*.02);pinch=n;}else{const dx=e.clientX-p.x,dy=e.clientY-p.y;if(exploring&&!document.body.classList.contains('driving')){campYaw-=dx*.006;campPitch=T.MathUtils.clamp(campPitch-dy*.005,-1.25,1.25);}else if(mode==='interior'){yaw-=dx*.006;pitch=T.MathUtils.clamp(pitch+dy*.005,-1.35,1.35);}else{angle-=dx*.008;elevation=T.MathUtils.clamp(elevation+dy*.005,.05,1.2);}cameraUpdate();}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,e=>pointers.delete(e.pointerId));

 let joystickVector={x:0,y:0},joystickActive=false,joystickVisible=true;
 const joystickBase=$('#joystickBase'),joystickKnob=$('#joystickKnob'),toggleJoystickBtn=$('#toggleJoystickBtn');
 function updateJoystick(clientX,clientY){
  if(!joystickBase||!joystickKnob)return;
  const rect=joystickBase.getBoundingClientRect();
  const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
  let dx=clientX-centerX,dy=clientY-centerY;
  const maxRadius=rect.width/2-10;
  const dist=Math.hypot(dx,dy);
  if(dist>maxRadius){dx=(dx/dist)*maxRadius;dy=(dy/dist)*maxRadius;}
  joystickKnob.style.transform=`translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;
  joystickVector.x=dx/maxRadius;
  joystickVector.y=dy/maxRadius;
 }
 function resetJoystick(){
  joystickActive=false;
  joystickVector.x=0;joystickVector.y=0;
  if(joystickKnob){
   joystickKnob.style.transition='transform .18s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
   joystickKnob.style.transform='translate(-50%, -50%)';
   setTimeout(()=>{if(joystickKnob)joystickKnob.style.transition='';},200);
  }
 }
 if(joystickBase){
  joystickBase.addEventListener('pointerdown',e=>{
   e.stopPropagation();
   joystickActive=true;
   joystickBase.setPointerCapture(e.pointerId);
   if(joystickKnob)joystickKnob.style.transition='';
   updateJoystick(e.clientX,e.clientY);
  });
  joystickBase.addEventListener('pointermove',e=>{
   if(!joystickActive)return;
   e.stopPropagation();
   updateJoystick(e.clientX,e.clientY);
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture']){
   joystickBase.addEventListener(ev,()=>{resetJoystick();});
  }
 }
 if(toggleJoystickBtn&&joystickBase){
  toggleJoystickBtn.onclick=e=>{
   e.stopPropagation();
   joystickVisible=!joystickVisible;
   joystickBase.classList.toggle('joystick-collapsed',!joystickVisible);
   const label=toggleJoystickBtn.querySelector('.joystick-toggle-label');
   if(label)label.textContent=joystickVisible?'Look Joystick':'Show Joystick';
   toggleJoystickBtn.setAttribute('aria-pressed',joystickVisible);
  };
 }

 el.addEventListener('wheel',e=>{if(exploring&&!driving){e.preventDefault();walker=stepWalker(walker,{forward:e.deltaY<0,reverse:e.deltaY>0,left:false,right:false,run:false,jump:false,yaw:campYaw},Math.min(Math.abs(e.deltaY)*.0016,.08),{inside,roofOpen});if(tutorialStage===1)showTutorial(2);cameraUpdate();refreshCamp();return;}if(exploring)return;e.preventDefault();zoom(e.deltaY*.006);},{passive:false});
 el.addEventListener('keydown',e=>{if(exploring)return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)||e.target.closest('button'))return;e.preventDefault();const dx=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0,dy=e.key==='ArrowUp'?.08:e.key==='ArrowDown'?-.08:0;if(mode==='interior'){yaw+=dx;pitch=T.MathUtils.clamp(pitch+dy,-1.35,1.35);}else{angle+=dx;elevation=T.MathUtils.clamp(elevation+dy,.05,1.2);}if(e.key==='+'||e.key==='=')zoom(-.5);if(e.key==='-')zoom(.5);cameraUpdate();});

 function stopExplore(){el.classList.remove('game-expanded');document.body.classList.remove('game-expanded');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});syncFullscreen();stopDrive();clearTimeout(tutorialTimer);const pop=$('#gameTutorialPop');if(pop)pop.hidden=true;resetJoystick();exploring=false;inside=false;keys.clear();campsite.visible=false;floor.visible=true;scene.userData.explore=false;document.body.classList.remove('exploring');$('#exploreHud').hidden=true;$('#exploreButton').setAttribute('aria-pressed',false);scene.background=new T.Color('#252b2d');scene.fog=new T.Fog('#252b2d',17,45);}
 function refreshCamp(){
  const nearDriver=!inside&&Math.hypot(walker.x+.65,walker.z-1.85)<2.5;$('#campDriverDoor').disabled=!nearDriver;$('#campDriverDoor').textContent=driverDoorOpen?'Close driver door':'Open driver door';$('#campDrive').disabled=!nearDriver;
  const rear=Math.hypot(walker.x-3.2,walker.z)<2.7,side=Math.hypot(walker.x-1.3,walker.z-2)<3;
  $('#campDoor').disabled=inside||!rear;$('#campEnter').disabled=!inside&&!rear;
  $('#campEnter').textContent=inside?'Exit cabin':'Enter cabin';$('#campDoor').textContent=doorOpen?'Close door':'Open door';$('#campDoor').setAttribute('aria-pressed',doorOpen);
  $('#campRoof').textContent=roofOpen?'Lower roof':'Raise roof';$('#campStorage').disabled=inside||state.model!=='basecamp'||!side;$('#campStorage').textContent=storageOpen?'Close storage':'Open storage';
  const hasAwning=state.addons.includes('awning')||state.addons.includes('annex');$('#campAwning').disabled=!hasAwning||inside;$('#campAwning').textContent=hasAwning?(awningOpen?'Retract awning':'Deploy awning'):'Awning not selected';
  $('#campLights').textContent=night?'Daylight':'Evening lights';$('#campLights').setAttribute('aria-pressed',night);$('#studioLabel').textContent=inside?'CAMPSITE / INSIDE YOUR CAMPER':'CAMPSITE / WALK AROUND';
  $('#exploreStatus').textContent='';
 }
 function startExplore(){setMode('exterior');exploring=true;inside=false;awningOpen=false;walker=spawnPoint('front');campYaw=walker.yaw;campPitch=-.12;campsite.visible=true;floor.visible=false;scene.userData.explore=true;scene.background=new T.Color(skyColor);scene.fog=new T.Fog(skyColor,65,210);document.body.classList.add('exploring');$('#exploreHud').hidden=false;$('#exploreButton').setAttribute('aria-pressed',true);$('#live360Button').setAttribute('aria-pressed',false);$('#live360Button').classList.remove('active');syncDayNightButton();cameraUpdate();refreshCamp();showTutorial(1);el.focus({preventScroll:true});}
 $('#exploreButton').onclick=startExplore;$('#leaveExplore').onclick=()=>preset('front');
 document.querySelectorAll('[data-spawn]').forEach(b=>b.onclick=()=>{inside=false;mode='exterior';keys.clear();walker=spawnPoint(b.dataset.spawn);campYaw=walker.yaw;campPitch=-.12;cameraUpdate();update(state,catalog);});
 $('#campJump').onclick=()=>{keys.add('jump');if(tutorialStage===1)showTutorial(2);el.focus({preventScroll:true})};
 $('#campDriverDoor').onclick=rideCamper;$('#campDrive').onclick=startDrive;
 $('#campDoor').onclick=()=>{if(inside)exitCamper();else enterRearDoor();};
 $('#campEnter').onclick=()=>{if(inside)exitCamper();else enterRearDoor();};
 $('#campRoof').onclick=()=>$('#roof').click();$('#campLights').onclick=()=>$('#night').click();$('#campStorage').onclick=()=>{storageOpen=!storageOpen;update(state,catalog)};$('#campAwning').onclick=()=>{awningOpen=!awningOpen;update(state,catalog)};
 const movementKey=e=>({ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'}[e.key]||e.key.toLowerCase());
 window.addEventListener('keydown',e=>{if(!exploring||e.target.closest('input,textarea,select,dialog'))return;if(e.key==='Escape'){if(document.fullscreenElement)return;if(el.classList.contains('game-expanded')){$('#fullscreen').click();return}if(driving){endDrive();return}preset('front');return}if(e.code==='Space'){e.preventDefault();if(!driving&&!e.repeat)keys.add('jump');if(tutorialStage===1)showTutorial(2);return}if(e.key==='Shift'){keys.add('run');return}if(driving&&e.key.toLowerCase()==='b'){e.preventDefault();keys.add('brake');return}const k=movementKey(e);if('wasd'.includes(k)&&k.length===1){e.preventDefault();keys.add(k);if(tutorialStage===1)showTutorial(2);}});
 window.addEventListener('keyup',e=>{keys.delete(movementKey(e));if(e.key==='Shift')keys.delete('run');if(e.key.toLowerCase()==='b')keys.delete('brake')});window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
 document.querySelectorAll('[data-walk]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.walk);if(tutorialStage===1)showTutorial(2);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.walk));});

 function stopDrive(){driving=false;keys.clear();environment.trail.visible=false;vehicle.root.position.set(0,0,0);vehicle.root.rotation.y=0;vehicle.wheels.forEach(w=>w.rotation.z=0);scene.userData.vehiclePosition={x:0,z:0};document.body.classList.remove('driving');$('#driveHud').hidden=true;}
 function startDrive(){window.dispatchEvent(new CustomEvent('cd-game-start'));driving=true;inside=false;mode='exterior';keys.clear();drive=newDrive();assist=false;doorOpen=driverDoorOpen=false;roofOpen=false;storageOpen=false;awningOpen=false;night=false;environment.trail.visible=true;document.body.classList.add('driving');$('#driveHud').hidden=false;$('#exploreHud').hidden=true;$('#trailReward').hidden=true;$('#driveAssist').setAttribute('aria-pressed',false);update(state,catalog);cameraUpdate();refreshDrive();el.focus({preventScroll:true});}
 function endDrive(){stopDrive();inside=false;mode='exterior';walker=spawnPoint('driver');campYaw=walker.yaw;$('#exploreHud').hidden=false;update(state,catalog);cameraUpdate();}
 function refreshDrive(){
  $('#driveSpeed').textContent=Math.round(Math.abs(drive.speed)*3.6)+' km/h';$('#driveProgress').textContent=Math.min(drive.next,8)+' / 8';$('#driveMeter').value=drive.complete?8:drive.next-1;
  $('#driveInstruction').textContent=drive.offroad?'Off trail':drive.complete?'Trail complete':'';
  const ctx=$('#trailMap').getContext('2d');ctx.clearRect(0,0,180,100);const p=t=>[12+(-t.x)/160*154,52-t.z*2.1];ctx.strokeStyle='#788a81';ctx.lineWidth=6;ctx.beginPath();ROAD.forEach((t,i)=>{const [x,y]=p(t);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();TRAIL.slice(1).forEach((t,i)=>{const [x,y]=p(t);ctx.fillStyle=i<drive.next-1?'#b3cfa9':'#f4cd73';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill()});const [x,y]=p(drive);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();
 }
 function finishDrive(){window.dispatchEvent(new CustomEvent('cd-game-finish'));driving=false;keys.clear();let record;try{record=JSON.parse(localStorage.getItem('cd-trail-reward-v1'))}catch{}if(!record?.code){record=rewardRecord(crypto.randomUUID());try{localStorage.setItem('cd-trail-reward-v1',JSON.stringify(record))}catch{}}$('#rewardCode').textContent='';$('#rewardCode').hidden=true;$('#rewardCopy').hidden=true;$('#trailReward').hidden=false;$('#driveInstruction').textContent='All 8 checkpoints complete. Reward unlocked.';}
 $('#driveExit').onclick=endDrive;$('#driveRecover').onclick=()=>{drive=recoverDrive(drive);keys.clear();cameraUpdate();refreshDrive()};$('#driveAssist').onclick=()=>{assist=!assist;$('#driveAssist').setAttribute('aria-pressed',assist);$('#driveAssist').textContent=assist?'Drive assist on':'Drive assist off';};
 $('#rewardReturn').onclick=()=>{endDrive();$('#trailReward').hidden=true;};$('#rewardCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('#rewardCode').textContent);$('#rewardCopy').textContent='Copied'}catch{$('#rewardCopy').textContent='Select and copy the code above'}};
 new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)}).observe(el);camera.aspect=el.clientWidth/el.clientHeight;renderer.setSize(el.clientWidth,el.clientHeight);cameraUpdate();let last=0,lastRender=0;
 renderer.setAnimationLoop(time=>{const dt=Math.min((time-last)/1000,.1);last=time;
  if(joystickVector.x!==0||joystickVector.y!==0){
   const lookSpeedYaw=2.4,lookSpeedPitch=1.8;
   if(exploring&&!driving){
    campYaw+=joystickVector.x*dt*lookSpeedYaw;
    campPitch=T.MathUtils.clamp(campPitch-joystickVector.y*dt*lookSpeedPitch,-1.25,1.25);
    cameraUpdate();
   }else if(driving){
    campYaw+=joystickVector.x*dt*lookSpeedYaw;
    campPitch=T.MathUtils.clamp(campPitch-joystickVector.y*dt*lookSpeedPitch,-.6,.8);
   }else if(mode==='interior'){
    yaw+=joystickVector.x*dt*lookSpeedYaw;
    pitch=T.MathUtils.clamp(pitch-joystickVector.y*dt*lookSpeedPitch,-1.35,1.35);
    cameraUpdate();
   }
  }
  if(driving&&!document.hidden&&!document.querySelector('dialog[open]')){const previousGate=drive.next;drive=stepDrive(drive,{forward:keys.has('w'),reverse:keys.has('s'),left:keys.has('a'),right:keys.has('d'),brake:keys.has('brake'),assist},dt);if(drive.next!==previousGate||drive.complete){window.dispatchEvent(new CustomEvent('cd-game-checkpoint',{detail:{index:drive.complete?8:drive.next-1,position:{x:drive.x,z:drive.z}}}));}vehicle.root.position.set(drive.x,Math.sin(drive.distance*3)*.007,drive.z);vehicle.root.rotation.y=drive.heading;vehicle.wheels.forEach(w=>w.rotation.z=-drive.distance/.405);scene.userData.vehiclePosition={x:drive.x,z:drive.z};cameraUpdate();refreshDrive();if(drive.complete)finishDrive();}
  if(exploring&&!driving&&!document.body.classList.contains('driving')&&!document.hidden&&!document.querySelector('dialog[open]')){walker=stepWalker(walker,{forward:keys.has('w'),reverse:keys.has('s'),left:keys.has('a'),right:keys.has('d'),run:keys.has('run'),jump:keys.has('jump'),yaw:campYaw},dt,{inside,roofOpen});keys.delete('jump');el.dataset.playerPeak=Math.max(Number(el.dataset.playerPeak||0),walker.y).toFixed(2);el.dataset.playerHeight=walker.y.toFixed(2);el.dataset.playerX=walker.x.toFixed(2);el.dataset.playerZ=walker.z.toFixed(2);cameraUpdate();refreshCamp();}
  if(auto&&!document.hidden){if(mode==='interior')yaw+=dt*.17;else angle+=dt*.17;cameraUpdate()}if(software&&time-lastRender<50)return;lastRender=time;renderer.render(mode==='interior'?cabin.scene:scene,camera);camera.updateMatrixWorld();positionDoorTargets();
  if(mode==='interior'){for(const h of cabin.hotspots){const p=h.point.clone().project(camera),z=h.point.clone().applyMatrix4(camera.matrixWorldInverse).z,button=$('#hot-'+h.id);button.hidden=(h.feature&&!cabin.groups[h.feature]?.visible)||z>-.05||p.z>1||Math.abs(p.x)>.88||Math.abs(p.y)>.8;if(!button.hidden){button.style.left=(p.x*.5+.5)*100+'%';button.style.top=(-p.y*.5+.5)*100+'%';}}}
 });
 function capture(){renderer.render(mode==='interior'?cabin.scene:scene,camera);const c=document.createElement('canvas');c.width=600;c.height=Math.round(600*el.clientHeight/el.clientWidth);c.getContext('2d').drawImage(renderer.domElement,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7);}
 function captureViews(){const old={mode,angle,elevation,distance,station,target:target.clone()};mode='exterior';angle=-.9;elevation=.24;distance=12;target.set(0,1.7,.25);cameraUpdate();update(state,catalog);const exterior=capture();mode='interior';station='entry';cameraUpdate();const interior=capture();mode=old.mode;angle=old.angle;elevation=old.elevation;distance=old.distance;station=old.station;target.copy(old.target);cameraUpdate();update(state,catalog);return [exterior,interior];}
 function deployment(open){roofOpen=open;awningOpen=open;doorOpen=open;storageOpen=false;driverDoorOpen=false;update(state,catalog);}
 function inspectStorage(){storageOpen=!storageOpen;update(state,catalog);}
 function setQuality(q){renderer.setPixelRatio(q==='high'?Math.min(devicePixelRatio,2):q==='low'?.75:1);renderer.setSize(el.clientWidth,el.clientHeight);}
 setMode('exterior');
 return{update,setMode,reset,preset,focusAccessory,captureViews,deployment,inspectStorage,setQuality,showCampsite:startExplore,get mode(){return mode},get software(){return software}};
}
