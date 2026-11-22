import React,{useState} from 'react';
import{Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis}from'recharts';
import{ArrowRight,ChevronRight,CircleHelp}from'lucide-react';
import type{Dataset,Match,League,PlayerSummary,Player}from'./types';

const clubImages:Record<string,string>={
 'Allianz Milano':'https://www.legavolley.it/GetLogo.aspx?Char=False&Field=LogoWeb&Key=6394&Proc=LogoSquadra',
 'Cucine Lube Civitanova':'https://r2.thesportsdb.com/images/media/team/badge/e76uzo1555615698.png',
 'Tours Volley-Ball':'https://www.toursvolleyball.com/wp-content/uploads/2024/10/cropped-Sans-titre-1.png',
 'Saint-Nazaire VBA':'https://www.lnv.fr/medias/sports/snvba-500px-907313531_20240920101816.png'
};
const leagueImages:Record<string,string>={
 it:'https://images.volleyballworld.com/image/upload/t_q_eco/v1726058387/assets/competition-logos/Super%20Lega/CREDEM-SUPERLEGA-logo-squared.png',
 fr:'https://lnv.fr/medias/articles/desktop-la-lnv-devoile-volstar-picture-20260901164607.jpg',
 pl:'https://www.plusliga.pl/_images/account/men/ogimage_tw.jpg'
};
const initial=(s:string)=>s.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('');
const fmt=(n:number|null|undefined,d=0)=>typeof n==='number'?n.toLocaleString('sr-RS',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const percent=(good:number|null|undefined,attempts:number|null|undefined)=>typeof good==='number'&&typeof attempts==='number'&&attempts>0?100*good/attempts:null;
const short=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('sr-RS',{day:'2-digit',month:'short',timeZone:'UTC'});
const tooltipStyle={backgroundColor:'var(--panel-bg)',border:'1px solid var(--line)',color:'var(--text)',borderRadius:12,fontSize:11,boxShadow:'0 13px 28px #131a2e22'};
const tick={fill:'var(--chart-label)',fontSize:10};
export function ClubLogo({name,size='sm'}:{name:string,size?:'xs'|'sm'|'lg'|'xl'}){
 const[bad,setBad]=useState(false);const url=clubImages[name];
 return <span className={'club-logo club-'+size}>{url&&!bad?<img src={url} loading="lazy" alt={name+' logo'} onError={()=>setBad(true)}/>:<span>{initial(name)}</span>}</span>;
}
export function LeagueLogo({league,size='sm'}:{league:League,size?:'sm'|'lg'}){
 const[bad,setBad]=useState(false);const url=leagueImages[league.id];
 return <span className={'league-logo league-'+size}>{url&&!bad?<img src={url} loading="lazy" alt={league.name+' logo'} onError={()=>setBad(true)}/>:<span>{league.flag}</span>}</span>;
}
export function StatBox({name,value,unit='',note=''}:{name:string;value:string|number;unit?:string;note?:string}){
 return <div className="statbox"><small>{name}</small><b>{value}<i>{unit}</i></b>{note&&<span>{note}</span>}</div>;
}
function ChartPanel({title,subtitle,children}:{title:string;subtitle?:string;children:React.ReactNode}){
 return <div className="chart-panel"><div className="chart-panel-head"><h4>{title}</h4><span>{subtitle}</span></div>{children}</div>;
}
function ScoreBars({rows,homeName,awayName}:{rows:{label:string,home:number,away:number}[];homeName:string;awayName:string}){
 return <><div className="rechart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{top:12,right:8,bottom:5,left:-28}} barGap={4}>
  <CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="3 3"/>
  <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false}/>
  <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false}/>
  <Tooltip contentStyle={tooltipStyle}/>
  <Bar name={homeName} dataKey="home" fill="var(--purple)" maxBarSize={28} radius={[6,6,0,0]}/>
  <Bar name={awayName} dataKey="away" fill="var(--mint)" maxBarSize={28} radius={[6,6,0,0]}/>
 </BarChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="key-purple"/>{homeName}</span><span><i className="key-mint"/>{awayName}</span></div></>;
}
export function SetChart({match}:{match:Match}){
 if(!match.sets.length)return null;
 return <ChartPanel title="Poeni po setovima" subtitle="Poređenje dve ekipe"><ScoreBars homeName={match.home} awayName={match.away} rows={match.sets.map((s,i)=>({label:'S'+(i+1),home:s[0],away:s[1]}))}/></ChartPanel>;
}
export function MatchInsights({match}:{match:Match}){
 const st=match.teamStats;
 if(!st)return <div className="metric-empty"><CircleHelp size={17}/> Za ovaj meč još nema kompletnog statističkog zapisnika. Setovi i rezultat su dostupni.</div>;
 const h=st.home,a=st.away;
 return <div className="insights-section">
  <div className="insights-title"><small>MATCH ANALYTICS</small><h3>Ekipna statistika</h3><p>Statistika jednog meča iz DataVolley zapisnika.</p></div>
  <div className="statbox-grid"><StatBox name="Napad domaći" value={fmt(percent(h.attacksSuccessful,h.attackAttempts),1)} unit="%" note={h.attacksSuccessful+' od '+h.attackAttempts+' pokušaja'}/><StatBox name="Napad gosti" value={fmt(percent(a.attacksSuccessful,a.attackAttempts),1)} unit="%" note={a.attacksSuccessful+' od '+a.attackAttempts+' pokušaja'}/><StatBox name="Asovi" value={h.aces+' : '+a.aces} note="Domaći / gosti"/><StatBox name="Blok poeni" value={h.blocks+' : '+a.blocks} note="Domaći / gosti"/></div>
  <div className="insight-charts"><ChartPanel title="Poeni po elementima" subtitle="Napad, servis i blok"><ScoreBars homeName={match.home} awayName={match.away} rows={[{label:'Napad',home:h.attacksSuccessful??0,away:a.attacksSuccessful??0},{label:'Asovi',home:h.aces??0,away:a.aces??0},{label:'Blok',home:h.blocks??0,away:a.blocks??0}]}/></ChartPanel>
  <div className="chart-panel"><div className="chart-panel-head"><h4>Prijem i napad</h4><span>Poređenje u procentima</span></div><div className="metric-comparison">
    {[
     ['Pozitivan prijem',h.receptionPositivePercent,a.receptionPositivePercent,'%'],
     ['Odličan prijem',h.receptionExcellentPercent,a.receptionExcellentPercent,'%'],
     ['Efikasnost napada',percent(h.attacksSuccessful,h.attackAttempts),percent(a.attacksSuccessful,a.attackAttempts),'%']
    ].map(([label,home,away,unit])=><div className="metric-comparison-row" key={String(label)}><b>{label}</b><div><strong>{fmt(home as number,1)}{unit}</strong><strong>{fmt(away as number,1)}{unit}</strong></div><div className="double-progress"><span><i style={{width:String(home||0)+'%'}}/></span><span><i style={{width:String(away||0)+'%'}}/></span></div></div>)}
    </div><div className="chart-legend"><span><i className="key-purple"/>{match.home}</span><span><i className="key-mint"/>{match.away}</span></div></div></div>
  {match.setStats?.length? <><div className="insights-title compact-title"><small>SET-BY-SET</small><h3>Raspodela po setovima</h3></div><div className="set-by-set">{match.setStats.map(st=><div className="set-detail" key={st.set}><b>SET {st.set}</b><span>Napad <strong>{st.home.attacksSuccessful}:{st.away.attacksSuccessful}</strong></span><span>Asovi <strong>{st.home.aces}:{st.away.aces}</strong></span><span>Blok <strong>{st.home.blocks}:{st.away.blocks}</strong></span></div>)}</div></>:null}
 </div>;
}
export function DetailedPlayerTable({match}:{match:Match}){
 if(!match.players.length)return null;
 const full=Boolean(match.teamStats);
 return <div className="stat-table-scroll"><table className="stat-table"><thead><tr><th>IGRAČ</th><th>TIM</th><th>POENI</th>{full&&<><th>NAPAD</th><th>NAPAD %</th><th>AS</th><th>BL</th><th>PRIJEM</th></>}</tr></thead><tbody>{[match.home,match.away].flatMap(team=>match.players.filter(p=>p.team===team&&p.points!==null||p.team===team&&p.receptionAttempts!==undefined).sort((a,b)=>(b.points??-1)-(a.points??-1)).map(p=><tr key={p.team+p.name}><td><b>{p.name}</b></td><td><span className="table-team"><ClubLogo name={team} size="xs"/>{team===match.home?'DOM':'GOST'}</span></td><td className="numeric highlight">{fmt(p.points)}</td>{full&&<><td className="numeric">{p.attackAttempts===undefined?'—':fmt(p.attacksSuccessful)+'/'+p.attackAttempts}</td><td className="numeric">{fmt(percent(p.attacksSuccessful,p.attackAttempts),1)}{p.attackAttempts?'%':''}</td><td className="numeric">{fmt(p.aces)}</td><td className="numeric">{fmt(p.blocks)}</td><td className="numeric">{p.receptionPositivePercent===undefined?'—':p.receptionPositivePercent+'%'}</td></>}</tr>))}</tbody></table><p className="table-note">Poeni, pokušaji napada, asovi, blokovi i pozitivan prijem. Crta znači da podatak nije dostupan.</p></div>;
}
export function getPlayerStats(data:Dataset,p:PlayerSummary){
 const matches=data.matches.filter(m=>m.league===p.league).flatMap(m=>m.players.filter(x=>x.name.toLowerCase()===p.name.toLowerCase()&&x.team===p.team).map(row=>({match:m,row})));
 const sum=(key:keyof Player)=>{const val=matches.map(x=>x.row[key]).filter((x):x is number=>typeof x==='number');return {value:val.length?val.reduce((a,b)=>a+b,0):null,games:val.length}};
 const attempts=sum('attackAttempts'),kills=sum('attacksSuccessful'),aces=sum('aces'),blocks=sum('blocks');
 const rec=matches.filter(x=>typeof x.row.receptionAttempts==='number'&&typeof x.row.receptionPositivePercent==='number');
 const total=rec.reduce((a,x)=>a+x.row.receptionAttempts!,0);
 const positive=total?rec.reduce((a,x)=>a+x.row.receptionAttempts!*x.row.receptionPositivePercent!,0)/total:null;
 return {matches,attempts,kills,aces,blocks,attackPct:attempts.games===kills.games?percent(kills.value,attempts.value):null,reception:positive,receptionAttempts:total};
}
export function PlayerInsights({data,player}:{data:Dataset;player:PlayerSummary}){
 const d=getPlayerStats(data,player);
 const chart=d.matches.filter(x=>typeof x.row.points==='number').sort((a,b)=>a.match.date.localeCompare(b.match.date)).map(x=>({label:short(x.match.date),points:x.row.points}));
 return <div className="insights-section"><div className="insights-title"><small>INDIVIDUALNA ANALITIKA</small><h3>Detaljna statistika</h3><p>Prikazujemo samo metrike evidentirane u dostupnim mečevima.</p></div><div className="statbox-grid">
  <StatBox name="Napad" value={fmt(d.attackPct,1)} unit={d.attackPct===null?'':'%'} note={d.attempts.value===null?'Nema detaljnog zapisnika':String(d.kills.value)+' / '+String(d.attempts.value)+' pokušaja'}/>
  <StatBox name="Asovi" value={fmt(d.aces.value)} note={d.aces.games+' meč. sa podacima'}/>
  <StatBox name="Blok poeni" value={fmt(d.blocks.value)} note={d.blocks.games+' meč. sa podacima'}/>
  <StatBox name="Pozitivan prijem" value={fmt(d.reception,1)} unit={d.reception===null?'':'%'} note={d.receptionAttempts?d.receptionAttempts+' prijema':'Nema podataka'}/>
  </div>{chart.length>0&&<ChartPanel title="Poeni kroz dostupne utakmice" subtitle={chart.length+' meč(eva) u uzorku'}><div className="rechart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{top:12,right:8,bottom:5,left:-28}} barSize={chart.length===1?54:32}><CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="3 3"/><XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false}/><YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="points" name="Poeni" fill="var(--purple)" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div></ChartPanel>}</div>;
}
export function PlayersDashboard({data,players,onPlayer}:{data:Dataset;players:PlayerSummary[];onPlayer:(p:PlayerSummary)=>void}){
 const top=players.slice(0,8).map(p=>({label:p.name.split(' ').slice(-1)[0],value:p.points}));
 const detailed=players.map(p=>({p,d:getPlayerStats(data,p)})).filter(x=>x.d.attackPct!==null).sort((a,b)=>(b.d.attackPct??0)-(a.d.attackPct??0));
 return <div className="insights-section"><div className="insights-title"><small>GLOBALNI PREGLED</small><h3>Statistika igrača</h3><p>Poređenje samo dostupnih mečeva. Ne predstavlja kompletnu sezonsku rang-listu.</p></div><div className="insight-charts"><ChartPanel title="Poznati poeni" subtitle="Igrači iz trenutnog uzorka"><div className="rechart-frame tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={top} margin={{top:9,right:8,bottom:5,left:-28}}><CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="3 3"/><XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} interval={0} angle={-18} height={42}/><YAxis tick={tick} tickLine={false} axisLine={false}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="value" name="Poeni" fill="var(--purple)" maxBarSize={30} radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></ChartPanel>
 <div className="chart-panel"><div className="chart-panel-head"><h4>Napadači sa detaljima</h4><span>Uspešnost napada · broj pokušaja</span></div><div className="attacker-list">{detailed.slice(0,7).map(({p,d})=><button key={p.key} onClick={()=>onPlayer(p)}><span><b>{p.name}</b><small>{p.team}</small></span><i><em style={{width:fmt(d.attackPct,1).replace(',','.')+'%'}}/></i><strong>{fmt(d.attackPct,1)}%</strong><ChevronRight size={14}/></button>)}{!detailed.length&&<p className="no-stats">Još nema podataka za napade.</p>}</div></div></div></div>;
}
type Team={name:string,played:number,wins:number,losses:number,setsFor:number,setsAgainst:number,fixtures:{match:Match,home:boolean,win:boolean}[]};
export function leagueTeams(data:Dataset,league:string):Team[]{
 const map=new Map<string,Team>();
 for(const match of data.matches.filter(m=>m.league===league))for(const home of [true,false]){
  const name=home?match.home:match.away, win=home?match.homeSets>match.awaySets:match.awaySets>match.homeSets;
  if(!map.has(name))map.set(name,{name,played:0,wins:0,losses:0,setsFor:0,setsAgainst:0,fixtures:[]});
  const t=map.get(name)!;t.played++;if(win)t.wins++;else t.losses++;t.setsFor+=home?match.homeSets:match.awaySets;t.setsAgainst+=home?match.awaySets:match.homeSets;t.fixtures.push({match,home,win});
 }
 return [...map.values()].sort((a,b)=>b.wins-a.wins||b.setsFor-a.setsFor||a.name.localeCompare(b.name));
}
export function LeagueDashboard({data,league}:{data:Dataset;league:League}){
 const all=leagueTeams(data,league.id),matches=data.matches.filter(m=>m.league===league.id);
 const[chosen,setChosen]=useState<string|null>(null);const club=all.find(x=>x.name===chosen);
 const chart=all.slice(0,7).map(x=>({label:x.name.split(' ').slice(0,2).join(' ').slice(0,14),home:x.wins,away:x.losses}));
 return <section className="insights-section league-dashboard"><div className="league-head"><LeagueLogo league={league} size="lg"/><div><small>{league.flag} {league.country} · {league.season}</small><h3>{league.name}</h3><p>{matches.length} mečeva · {all.length} klubova u ovom uzorku</p></div></div><div className="statbox-grid three"><StatBox name="Utakmice" value={matches.length}/><StatBox name="Klubovi" value={all.length}/><StatBox name="Odigrani setovi" value={matches.reduce((a,m)=>a+m.homeSets+m.awaySets,0)}/></div><div className="insight-charts"><ChartPanel title="Rezultati po klubovima" subtitle="Pobede / porazi iz uzorka"><ScoreBars rows={chart} homeName="Pobede" awayName="Porazi"/></ChartPanel><div className="chart-panel"><div className="chart-panel-head"><h4>Klubovi</h4><span>Izaberi klub za pregled</span></div><div className="team-list">{all.map(t=><button className={chosen===t.name?'selected':''} key={t.name} onClick={()=>setChosen(chosen===t.name?null:t.name)}><ClubLogo name={t.name}/><span><b>{t.name}</b><small>{t.played} meč. · {t.setsFor}:{t.setsAgainst} setovi</small></span><strong>{t.wins}–{t.losses}</strong><ChevronRight size={15}/></button>)}</div></div></div>{club&&<div className="club-panel"><div className="club-panel-head"><ClubLogo name={club.name} size="lg"/><div><small>KLUB / UZORAK</small><h4>{club.name}</h4></div></div><div className="statbox-grid"><StatBox name="Pobede" value={club.wins}/><StatBox name="Porazi" value={club.losses}/><StatBox name="Setovi +" value={club.setsFor}/><StatBox name="Setovi −" value={club.setsAgainst}/></div><div className="club-fixtures">{club.fixtures.sort((a,b)=>b.match.date.localeCompare(a.match.date)).map(f=><div key={f.match.id}><span><b>{f.home?f.match.away:f.match.home}</b><small>{short(f.match.date)}</small></span><strong className={f.win?'win':'lose'}>{f.win?'Pobeda':'Poraz'} {f.home?f.match.homeSets:f.match.awaySets}:{f.home?f.match.awaySets:f.match.homeSets}</strong></div>)}</div></div>}</section>;
}
