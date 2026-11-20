import {cp,mkdir} from 'node:fs/promises';await mkdir('public/studio',{recursive:true});await cp('studio','public/studio',{recursive:true});
