import {normalizePlacements} from './layout-config.js';
import options from './interior-options.json' with {type:'json'};
export const INTERIOR_OPTIONS=options,INTERIOR_FEATURES=options.features,INTERIOR_THEMES=options.themes;
const hex=v=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v);
export function normalizeInterior(raw={},legacy={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};const theme=Object.hasOwn(options.themes,raw.theme)?raw.theme:'beige';const finishes={...options.themes[theme].colors};
 for(const role of Object.keys(finishes))if(hex(raw.finishes?.[role]))finishes[role]=raw.finishes[role].toLowerCase();
 if(!raw.theme&&!raw.finishes){if(hex(legacy.wood))finishes.wood=legacy.wood.toLowerCase();if(hex(legacy.upholstery))finishes.upholstery=legacy.upholstery.toLowerCase();}
 const items=Object.fromEntries(options.features.map(f=>[f.id,{enabled:typeof raw.items?.[f.id]?.enabled==='boolean'?raw.items[f.id].enabled:f.default,color:hex(raw.items?.[f.id]?.color)?raw.items[f.id].color.toLowerCase():null}]));
 const state={theme,finishes,items,placements:normalizePlacements(raw.placements)};for(const [id,values] of Object.entries(options.styles))state[id]=values.includes(raw[id])?raw[id]:values[0];return state;
}
export function interiorEnabled(s,id){const data=s.interior||normalizeInterior(),f=options.features.find(f=>f.id===id);if(!f||!data.items[id]?.enabled)return false;if(f.kitchen&&s.model==='backpack'&&!s.addons.includes('kitchen'))return false;return !f.parent||interiorEnabled(s,f.parent);}
export function applyInteriorTheme(s,id){if(!Object.hasOwn(options.themes,id))return s;return {...s,theme:id,finishes:{...options.themes[id].colors},items:Object.fromEntries(Object.entries(s.items).map(([k,v])=>[k,{...v,color:null}]))};}
export function interiorSummary(s){const i=s.interior;return `${options.themes[i.theme].name}${JSON.stringify(i.finishes)!==JSON.stringify(options.themes[i.theme].colors)?' · custom palette':''}\n${options.features.map(f=>`${f.name}: ${interiorEnabled(s,f.id)?'Included':'Removed'}${i.items[f.id].color?' / '+i.items[f.id].color:''}`).join('\n')}\nBed: ${i.bedStyle}; Table: ${i.tableShape}; Curtains: ${i.curtainStyle}; Cupboards: ${i.cabinetStyle}\nFinishes: ${Object.entries(i.finishes).map(([k,v])=>k+' '+v).join(', ')}`;}
