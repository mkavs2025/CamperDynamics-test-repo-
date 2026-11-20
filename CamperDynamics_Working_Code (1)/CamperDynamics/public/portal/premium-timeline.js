export const ease=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*t*(t*(t*6-15)+10)};
export const storyTime=q=>q<=.12?q/.12*.13:q<.36?.13:.13+(q-.36)/.64*.87;
export const storyPosition=p=>p<=.13?p/.13*.12:.36+(p-.13)/.87*.64;
export const exploded=q=>ease(.13,.18,q)*(1-ease(.30,.36,q));
export const explosionAngle=q=>Math.PI*2*ease(.18,.30,q);
export const FINISHES=[{id:'sand',name:'Sand',hex:'#c4aa7e'},{id:'sage',name:'Forest',hex:'#737e65'},{id:'midnight',name:'Midnight',hex:'#242c32'}];
export const chapterPosition=[0,.24,.50,.69,.84,.98];
