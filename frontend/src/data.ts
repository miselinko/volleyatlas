import type {Dataset,PlayerSummary,Match} from './types';
export async function loadData():Promise<Dataset>{
 const res=await fetch(import.meta.env.BASE_URL+'data/verified.json');
 if(!res.ok) throw Error('Učitavanje podataka nije uspelo');
 const data=await res.json() as Dataset;
 if(!Array.isArray(data.matches)||!Array.isArray(data.leagues))throw Error('Neispravan format podataka');
 return data;
}
export function aggregate(data:Dataset):PlayerSummary[]{
 const map=new Map<string,PlayerSummary>();
 for(const match of data.matches)for(const p of match.players){
  if(p.points===null)continue;
  const key=match.league+'|'+p.team+'|'+p.name.toLowerCase();
  const prev=map.get(key);
  if(prev){prev.points+=p.points;prev.matches++;prev.matchIds.push(match.id)}
  else map.set(key,{key,name:p.name,team:p.team,league:match.league,points:p.points,matches:1,matchIds:[match.id]});
 }
 return [...map.values()].sort((a,b)=>b.points-a.points);
}
export function validSets(m:Match):boolean{
 if(!m.sets.length)return true;
 return m.sets.filter(s=>s[0]>s[1]).length===m.homeSets&&m.sets.filter(s=>s[1]>s[0]).length===m.awaySets;
}
