import type{Dataset,Match,Player}from'./types';
export type ScoutedPlayer={
 key:string;name:string;team:string;league:string;jersey?:number;position?:string;
 matches:number;scoredMatches:number;points:number|null;pointsPerMatch:number|null;
 attackAttempts:number|null;attackKills:number|null;attackErrors:number|null;attacksBlocked:number|null;
 killPct:number|null;efficiency:number|null;aces:number|null;serveAttempts:number|null;serveErrors:number|null;
 blocks:number|null;breakPoints:number|null;receptionAttempts:number|null;
 receptionPositivePct:number|null;receptionExcellentPct:number|null;receptionErrors:number|null;
 appearances:{match:Match;stat:Player}[];
};
export type ScoutTeam={name:string;league:string;matches:number;wins:number;losses:number;setWins:number;setLosses:number;fixtures:Match[];hasFull:number};
function sumKnown(vals:(number|null|undefined)[]):number|null{
 const valid=vals.filter((v):v is number=>typeof v==='number'&&Number.isFinite(v));
 return valid.length?valid.reduce((a,b)=>a+b,0):null;
}
export function percentage(n:number|null,d:number|null):number|null{
 return n!==null&&d!==null&&d>0?100*n/d:null;
}
function weighed(rows:{match:Match;stat:Player}[],field:'receptionPositivePercent'|'receptionExcellentPercent'){
 const list=rows.filter(r=>typeof r.stat.receptionAttempts==='number'&&typeof r.stat[field]==='number');
 const count=list.reduce((s,r)=>s+r.stat.receptionAttempts!,0);
 return count>0?list.reduce((s,r)=>s+r.stat.receptionAttempts!*r.stat[field]!,0)/count:null;
}
export function scoutPlayers(data:Dataset):ScoutedPlayer[]{
 const map=new Map<string,{name:string,team:string,league:string,jersey?:number,position?:string,appearances:{match:Match;stat:Player}[]}>();
 for(const match of data.matches)for(const stat of match.players){
  const key=match.league+'|'+stat.team+'|'+stat.name.trim().toLocaleLowerCase();
  if(!map.has(key))map.set(key,{name:stat.name,team:stat.team,league:match.league,jersey:stat.jersey,position:stat.position,appearances:[]});
  map.get(key)!.appearances.push({match,stat});
 }
 return [...map.entries()].map(([key,p])=>{
  const rows=p.appearances, vals=(field:keyof Player)=>sumKnown(rows.map(r=>r.stat[field] as number|null|undefined));
  const scored=rows.filter(r=>typeof r.stat.points==='number');
  const points=vals('points'),att=vals('attackAttempts'),kills=vals('attacksSuccessful'),errs=vals('attackErrors'),blocked=vals('attacksBlocked');
  // A partial match lacking its attempts must not be silently combined with a full one.
  const attackRows=rows.filter(r=>typeof r.stat.attackAttempts==='number');
  const hasKills=attackRows.length>0&&attackRows.every(r=>typeof r.stat.attacksSuccessful==='number');
  const completeErrors=attackRows.length>0&&attackRows.every(r=>typeof r.stat.attackErrors==='number'&&typeof r.stat.attacksBlocked==='number');
  return {
   ...p,key,matches:rows.length,scoredMatches:scored.length,points,pointsPerMatch:points!==null&&scored.length?points/scored.length:null,
   attackAttempts:att,attackKills:hasKills?kills:null,attackErrors:errs,attacksBlocked:blocked,
   killPct:hasKills?percentage(kills,att):null,
   efficiency:completeErrors&&hasKills&&att!==null&&att>0?100*((kills||0)-(errs||0)-(blocked||0))/att:null,
   aces:vals('aces'),serveAttempts:vals('serveAttempts'),serveErrors:vals('serveErrors'),blocks:vals('blocks'),breakPoints:vals('breakPoints'),
   receptionAttempts:vals('receptionAttempts'),receptionPositivePct:weighed(rows,'receptionPositivePercent'),
   receptionExcellentPct:weighed(rows,'receptionExcellentPercent'),receptionErrors:vals('receptionErrors')
  };
 }).sort((a,b)=>(b.points??-1)-(a.points??-1)||a.name.localeCompare(b.name));
}
export function scoutTeams(data:Dataset,league?:string):ScoutTeam[]{
 const map=new Map<string,ScoutTeam>();
 for(const m of data.matches.filter(m=>!league||league==='all'||m.league===league)){
  for(const isHome of[true,false]){
   const name=isHome?m.home:m.away,key=m.league+'|'+name,win=isHome?m.homeSets>m.awaySets:m.awaySets>m.homeSets;
   if(!map.has(key))map.set(key,{name,league:m.league,matches:0,wins:0,losses:0,setWins:0,setLosses:0,fixtures:[],hasFull:0});
   const t=map.get(key)!;t.matches++;t.wins+=Number(win);t.losses+=Number(!win);
   t.setWins+=isHome?m.homeSets:m.awaySets;t.setLosses+=isHome?m.awaySets:m.homeSets;
   t.fixtures.push(m);if(m.teamStats)t.hasFull++;
  }
 }
 return [...map.values()].sort((a,b)=>b.wins-a.wins||(b.setWins-b.setLosses)-(a.setWins-a.setLosses)||a.name.localeCompare(b.name));
}
export function coverage(m:Match):'full'|'partial'|'score'{
 return m.teamStats&&m.players.length>0?'full':m.players.some(p=>typeof p.points==='number')?'partial':'score';
}
export function validateDataset(data:Dataset):string[]{
 const problems:string[]=[],ids=new Set<string>();
 for(const m of data.matches){
  if(ids.has(m.id))problems.push('Duplicate match '+m.id);ids.add(m.id);
  if(m.home===m.away)problems.push(m.id+' has identical teams');
  if(m.sets.length){
   if(m.sets.filter(s=>s[0]>s[1]).length!==m.homeSets||m.sets.filter(s=>s[1]>s[0]).length!==m.awaySets)problems.push(m.id+' set winners do not match result');
  }
  if(m.teamStats){
   for(const [name,team] of [['home',m.home],['away',m.away]] as const){
    const rows=m.players.filter(p=>p.team===team&&typeof p.points==='number');
    const total=rows.reduce((s,p)=>s+p.points!,0);
    if(m.coverage?.roster==='full-actions'&&total!==(m.teamStats[name].points??NaN))problems.push(m.id+' '+name+' player sum mismatches team');
    const calc=(m.teamStats[name].attacksSuccessful??0)+(m.teamStats[name].aces??0)+(m.teamStats[name].blocks??0);
    if(calc!==(m.teamStats[name].points??NaN))problems.push(m.id+' '+name+' attack+serve+block mismatch team');
   }
  }
  for(const p of m.players){
   if(![m.home,m.away].includes(p.team))problems.push(m.id+' unknown player team '+p.team);
   if([p.points,p.aces,p.blocks,p.attacksSuccessful].every(v=>typeof v==='number')){
    if(p.points!==p.aces!+p.blocks!+p.attacksSuccessful!)problems.push(m.id+' '+p.name+' incorrect points');
   }
  }
 }
 return problems;
}
