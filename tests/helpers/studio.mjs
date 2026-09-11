import {command,normalizeGame,STUDIO_CATEGORIES} from '../../dist/engine.js';
export function completeVisit(input,id,choice={action:'skip'},seed=29){
 let g=normalizeGame(input);const act=(type,extra={})=>{g=command(g,id,{type,revision:g.revision,show:g.show,round:g.round,...extra},seed);};
 for(const category of STUDIO_CATEGORIES)if(!g.players.find(p=>p.id===id).studio[category])act('reward',choice.action===category?{...choice,category}:{action:'skip',category});
 act('studio-depart');return g;
}
