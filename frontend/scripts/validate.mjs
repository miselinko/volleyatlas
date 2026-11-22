import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync(new URL('../public/data/verified.json',import.meta.url),'utf8'));
const ids=new Set(),errors=[];
const snapshot=data.metadata.as_of;
for(const m of data.matches){
 if(ids.has(m.id))errors.push(m.id+': duplicate ID');ids.add(m.id);
 if(m.date>snapshot)errors.push(m.id+': future match in snapshot '+snapshot);
 if(m.home===m.away)errors.push(m.id+': same team');
 if(m.sets.length){
  if(m.sets.filter(([h,a])=>h>a).length!==m.homeSets||m.sets.filter(([h,a])=>a>h).length!==m.awaySets)errors.push(m.id+': mismatched sets');
 }
 if(m.teamStats){
  for(const side of ['home','away']){
   const t=m.teamStats[side];
   const expected=t.attacksSuccessful+t.aces+t.blocks;
   if(expected!==t.points)errors.push(m.id+' '+side+': team points '+expected+' != '+t.points);
   const players=m.players.filter(p=>p.team===m[side]&&typeof p.points==='number');
   const sum=players.reduce((s,p)=>s+p.points,0);
   if(sum!==t.points)errors.push(m.id+' '+side+': individual sum '+sum+' != '+t.points);
   if(m.setStats?.length){
    for(const k of ['aces','attacksSuccessful','blocks','attackAttempts']){
     const total=m.setStats.reduce((s,set)=>s+(set[side][k]||0),0);
     if(total!==t[k])errors.push(m.id+' '+side+': set '+k+' '+total+' != '+t[k]);
    }
   }
  }
 }
 for(const p of m.players){
  if(p.team!==m.home&&p.team!==m.away)errors.push(m.id+': player wrong team '+p.name);
  if(['points','aces','blocks','attacksSuccessful'].every(k=>typeof p[k]==='number')){
   if(p.points!==p.aces+p.blocks+p.attacksSuccessful)errors.push(m.id+': incorrect '+p.name+' point breakdown');
  }
 }
}
if(errors.length){console.error('DATA VALIDATION FAILED:\n'+errors.join('\n'));process.exit(1);}
console.log('Snapshot verified:',data.matches.length,'matches,',data.matches.filter(m=>m.teamStats).length,'full boxscores,',data.matches.reduce((s,m)=>s+m.players.length,0),'player records.');
