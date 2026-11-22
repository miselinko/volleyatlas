import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{
 ArrowLeft,ArrowRight,ArrowUpRight,BarChart3,Bookmark,CalendarDays,Check,ChevronDown,ChevronLeft,ChevronRight,
 ClipboardList,Filter,Globe2,Home,Info,Layers2,LayoutGrid,Minus,Moon,Search,SlidersHorizontal,Sun,
 Target,Trophy,UsersRound,Volleyball,X,Gauge,GitCompareArrows,ExternalLink
}from'lucide-react';
import type{Dataset,League,Match,Player}from'./types';
import{loadData}from'./data';
import{scoutPlayers,scoutTeams,coverage,percentage,validateDataset}from'./scout';
import type{ScoutedPlayer,ScoutTeam}from'./scout';
import{ClubLogo,LeagueLogo,StatBox,SetChart,MatchInsights,PlayerInsights,LeagueDashboard}from'./Insights';
import'./insights.css';
import'./style.css';

type View='home'|'matches'|'players'|'leagues'|'compare'|'match'|'player'|'league';
type MatchTab='scout'|'roster'|'sets';
type Sort='points'|'pointsPerMatch'|'killPct'|'efficiency'|'aces'|'blocks'|'receptionPositivePct';
type PlayerMetric='points'|'killPct'|'efficiency'|'aces'|'blocks'|'receptionPositivePct';
const menu=[{id:'home',label:'Pregled',icon:Home},{id:'matches',label:'Utakmice',icon:CalendarDays},{id:'players',label:'Igrači',icon:UsersRound},{id:'leagues',label:'Lige',icon:Globe2},{id:'compare',label:'Uporedi',icon:GitCompareArrows}] as const;
const labels:{[key in Sort]:string}={points:'Poeni',pointsPerMatch:'Poena/meč',killPct:'Napad %',efficiency:'Efikasnost',aces:'Asovi',blocks:'Blok',receptionPositivePct:'Prijem %'};
const norm=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
const fmt=(n:number|null|undefined,decimal=0)=>typeof n==='number'?n.toLocaleString('sr-RS',{minimumFractionDigits:decimal,maximumFractionDigits:decimal}):'—';
const date=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('sr-RS',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
const navTitle=(v:View)=>({home:'Pregled',matches:'Utakmice',players:'Igrači',leagues:'Lige',compare:'Poređenje',match:'Utakmica',player:'Igrač',league:'Liga'})[v];
const matchInfo=(m:Match)=>coverage(m)==='full'?'DETALJNA STATISTIKA':coverage(m)==='partial'?'DELIMIČNA STATISTIKA':'REZULTAT';
const baseline=(v:View):View=>v==='match'?'matches':v==='player'?'players':v==='league'?'leagues':v;
function App(){
 const[data,setData]=useState<Dataset|null>(null),[loadError,setLoadError]=useState('');
 const[theme,setTheme]=useState<'light'|'dark'>(()=>{try{return localStorage.getItem('volleyatlas:theme')==='dark'?'dark':'light'}catch{return'light'}});
 const[view,setView]=useState<View>('home'),[gender,setGender]=useState<'M'|'W'>('M'),[league,setLeague]=useState('all');
 const[query,setQuery]=useState(''),[onlyFull,setOnlyFull]=useState(false),[sort,setSort]=useState<Sort>('points');
 const[round,setRound]=useState('all'),[matchTab,setMatchTab]=useState<MatchTab>('scout'),[activeMatch,setActiveMatch]=useState<Match|null>(null);
 const[activePlayer,setActivePlayer]=useState<ScoutedPlayer|null>(null),[activeLeague,setActiveLeague]=useState<League|null>(null);
 const[side,setSide]=useState<'all'|'home'|'away'>('all'),[rosterMetric,setRosterMetric]=useState<'points'|'attacksSuccessful'|'aces'|'blocks'|'receptionPositivePercent'>('points');
 const[sortDirection,setSortDirection]=useState<'desc'|'asc'>('desc');
 const[compareA,setCompareA]=useState(''),[compareB,setCompareB]=useState('');
 const[starred,setStarred]=useState<string[]>([]);
 useEffect(()=>{
  loadData().then(x=>{const problems=validateDataset(x);if(problems.length)console.warn('Data validation',problems);setData(x)}).catch(e=>setLoadError(String(e)));
  try{const arr=JSON.parse(localStorage.getItem('volleyatlas:saved')||'[]');if(Array.isArray(arr))setStarred(arr.filter(v=>typeof v==='string'))}catch{}
 },[]);
 useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;try{localStorage.setItem('volleyatlas:theme',theme)}catch{}},[theme]);
 const allPlayers=useMemo(()=>data?scoutPlayers(data):[],[data]);
 const leagues=(data?.leagues||[]).filter(l=>l.gender===gender);
 const getLeague=(id:string)=>data?.leagues.find(l=>l.id===id);
 const genderMatches=(data?.matches||[]).filter(m=>getLeague(m.league)?.gender===gender);
 const filteredMatches=genderMatches.filter(m=>(league==='all'||m.league===league)&&
 (round==='all'||m.round===round)&&(!onlyFull||coverage(m)==='full')&&
 norm([m.home,m.away,m.round,getLeague(m.league)?.name||''].join(' ')).includes(norm(query))).sort((a,b)=>b.date.localeCompare(a.date));
 const filteredPlayers=allPlayers.filter(p=>getLeague(p.league)?.gender===gender&&
 (league==='all'||p.league===league)&&norm([p.name,p.team].join(' ')).includes(norm(query))).
 sort((a,b)=>{const av=a[sort],bv=b[sort];if(av===null)return 1;if(bv===null)return -1;return sortDirection==='desc'?bv-av:av-bv});
 const roundOptions=[...new Set(genderMatches.filter(m=>league==='all'||m.league===league).map(m=>m.round))].sort((a,b)=>b.localeCompare(a,'sr',{numeric:true}));
 const matchesByDate=useMemo(()=>{
  const map=new Map<string,Match[]>();
  for(const m of filteredMatches){const id=m.league+'|'+m.date+'|'+m.round;map.set(id,[...(map.get(id)||[]),m]);}
  return [...map.entries()];
 },[data,league,round,query,onlyFull,gender]);
 const playerOne=allPlayers.find(p=>p.key===compareA)||filteredPlayers[0];
 const playerTwo=allPlayers.find(p=>p.key===compareB&&p.key!==playerOne?.key)||filteredPlayers.find(p=>p.key!==playerOne?.key);
 const totalFull=genderMatches.filter(m=>coverage(m)==='full').length;
 const navigate=(next:View)=>{setView(next);setActiveMatch(null);setActivePlayer(null);setActiveLeague(null);setQuery('');setRound('all');window.scrollTo({top:0,behavior:'instant'})};
 const openMatch=(m:Match)=>{setActiveMatch(m);setView('match');setMatchTab(coverage(m)==='full'?'roster':'scout');setSide('all');window.scrollTo({top:0,behavior:'instant'})};
 const openPlayer=(p:ScoutedPlayer)=>{setActivePlayer(p);setView('player');window.scrollTo({top:0,behavior:'instant'})};
 const openLeague=(l:League)=>{setActiveLeague(l);setView('league');window.scrollTo({top:0,behavior:'instant'})};
 const switchGender=(g:'M'|'W')=>{setGender(g);setLeague('all');setRound('all');setQuery('');navigate('home')};
 const mark=(id:string)=>setStarred(prev=>{const newIds=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];try{localStorage.setItem('volleyatlas:saved',JSON.stringify(newIds))}catch{}return newIds});
 const topFull=genderMatches.filter(m=>coverage(m)==='full').sort((a,b)=>b.date.localeCompare(a.date))[0];
 const teamSummary=data?scoutTeams(data,league):[];

 return <div className="va-app">
 <header className="va-header"><div className="va-header-inner">
  <button className="va-logo" onClick={()=>navigate('home')} aria-label="VolleyAtlas početna"><span className="va-mark">VA<span>.</span></span><span className="va-name">VOLLEYATLAS<small>VOLLEYBALL DATA PLATFORM</small></span></button>
  <nav className="va-nav-desktop" aria-label="Glavna navigacija">{menu.map(item=><button key={item.id} onClick={()=>navigate(item.id)} aria-current={baseline(view)===item.id?'page':undefined} className={baseline(view)===item.id?'active':''}>{item.label}</button>)}</nav>
  <div className="va-header-end"><span className="va-season">2026—27</span><button className="va-theme-button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} title={theme==='dark'?'Svetla tema':'Tamna tema'} aria-label={theme==='dark'?'Uključi svetlu temu':'Uključi tamnu temu'}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button></div>
 </div></header>

 <main className="va-main">
 {view==='home'&&<section className="va-intro"><div className="va-intro-content">
  <div className="va-eyebrow"><span/> VOLLEYATLAS / SKAUTSKA ANALITIKA</div>
  <h1>Odbojka. <em>U brojkama.</em></h1>
  <p>Utakmice, učinak igrača i poređenje liga. Podaci iz zvaničnih zapisnika, organizovani za analizu — ne samo za gledanje rezultata.</p>
  <div className="va-hero-buttons"><button className="va-primary" onClick={()=>navigate('matches')}>Istraži utakmice <ArrowRight size={17}/></button><button className="va-outline" onClick={()=>navigate('players')}>Analiza igrača</button></div>
 </div><div className="va-editorial-side">
  <div className="va-side-top"><span>NAJNOVIJI DETALJNI ZAPISNIK</span><BarChart3 size={18}/></div>
  {topFull&&<button onClick={()=>openMatch(topFull)} className="va-lead-match"><span>{getLeague(topFull.league)?.flag} {getLeague(topFull.league)?.name}</span><div><b>{topFull.home}</b><strong>{topFull.homeSets} : {topFull.awaySets}</strong><b>{topFull.away}</b></div><small>{date(topFull.date)} · Puna statistika meča <ArrowUpRight size={14}/></small></button>}
 </div></section>}

 <div className="va-section-heading">
  <div><div className="va-eyebrow">{view==='home'?'OVERVIEW':view==='match'?'MATCH REPORT':view==='player'?'SCOUT PROFILE':view==='league'?'LEAGUE REPORT':navTitle(view).toUpperCase()+' / 2026—27'}</div>
   <h2>{view==='home'?'Kontrolna tabla':view==='match'?'Detalji utakmice':view==='player'?'Profil igrača':view==='league'?activeLeague?.name:navTitle(view)}</h2>
  </div>
  {view!=='home'&&<span className="va-period">SEZONA 2026/27</span>}
 </div>

 {!['match','player','league'].includes(view)&&<div className="va-universal-bar">
  <div className="va-seg" role="group" aria-label="Konkurencija"><button className={gender==='M'?'active':''} onClick={()=>switchGender('M')}>Muškarci</button><button className={gender==='W'?'active':''} onClick={()=>switchGender('W')}>Žene</button></div>
  <div className="va-league-strip"><button className={league==='all'?'active':''} onClick={()=>{setLeague('all');setRound('all')}}>Sve lige</button>{leagues.map(l=><button key={l.id} className={league===l.id?'active':''} onClick={()=>{setLeague(l.id);setRound('all')}}><span>{l.flag}</span>{l.name.replace(' Credem Banca','')}</button>)}</div>
 </div>}

 {loadError&&<div className="va-state"><Info size={21}/><h3>Ne mogu da učitam podatke.</h3><p>{loadError}</p></div>}
 {!data&&!loadError&&<div className="va-state">Učitavanje utakmica i statistike…</div>}
 {data&&gender==='W'&&!['match','player','league'].includes(view)&&<div className="va-state"><Volleyball size={27}/><h3>Ženska konkurencija</h3><p>Ovaj deo je spreman za prve kompletne zapisnike. Ne prikazujemo izmišljene rezultate.</p><button className="va-primary" onClick={()=>switchGender('M')}>Pogledaj muške lige <ArrowRight size={15}/></button></div>}

 {data&&gender==='M'&&<>
 {view==='home'&&<>
  <div className="va-home-stats"><Summary label="MEČEVA U BAZI" value={genderMatches.filter(m=>league==='all'||m.league===league).length}/><Summary label="KOMPLETNIH ZAPISNIKA" value={genderMatches.filter(m=>(league==='all'||m.league===league)&&coverage(m)==='full').length} accent/><Summary label="IGRAČA" value={filteredPlayers.length}/><Summary label="LIGA" value={league==='all'?leagues.length:1}/></div>
  <div className="va-home-grid">
   <section className="va-surface"><PanelTitle title="Poslednje utakmice" right="Svi mečevi" onRight={()=>navigate('matches')}/><div className="va-match-stack">{filteredMatches.slice(0,5).map(m=><MatchRow key={m.id} m={m} l={getLeague(m.league)} saved={starred.includes(m.id)} onOpen={()=>openMatch(m)} onSave={()=>mark(m.id)}/>)}</div></section>
   <section className="va-surface"><PanelTitle title="Igrači na radaru" right="Svi igrači" onRight={()=>navigate('players')}/><div className="va-small-description">Poeni samo iz mečeva koje imamo. Za kompletne zapisnike vidi napad, prijem i servis.</div><div className="va-radar-list">{filteredPlayers.slice(0,7).map((p,i)=><button key={p.key} onClick={()=>openPlayer(p)}><span className="va-index">{String(i+1).padStart(2,'0')}</span><ClubLogo name={p.team} size="xs"/><span className="va-person-label"><b>{p.name}</b><small>{p.team}</small></span><strong>{fmt(p.points)}</strong><ChevronRight size={15}/></button>)}</div></section>
  </div>
  <div className="va-home-bottom"><div><div className="va-eyebrow">DETALJNA ANALITIKA</div><h3>Šta je već moguće analizirati?</h3><p>U kompletnim zapisnicima: napadačke akcije i greške, prijem, servis, blokovi i razlike po setovima.</p></div><button onClick={()=>topFull&&openMatch(topFull)}>Otvori detaljan meč <ArrowRight size={17}/></button></div>
 </>}

 {view==='matches'&&<>
 <div className="va-controls"><label className="va-search"><Search size={18}/><input placeholder="Pretraži klub ili ligu…" aria-label="Pretraži utakmice" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Obriši" onClick={()=>setQuery('')}><X size={16}/></button>}</label>
 <label className="va-select"><select aria-label="Kolo" value={round} onChange={e=>setRound(e.target.value)}><option value="all">Sva kola</option>{roundOptions.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={15}/></label>
 <label className="va-checkbox"><input type="checkbox" checked={onlyFull} onChange={e=>setOnlyFull(e.target.checked)}/><span>Samo detaljni zapisnici</span></label></div>
 <div className="va-results-count"><strong>{filteredMatches.length}</strong> utakmica <span>{filteredMatches.filter(m=>coverage(m)==='full').length} sa kompletnom statistikom</span></div>
 {matchesByDate.map(([key,list])=><section className="va-day" key={key}><div className="va-day-heading"><span>{date(list[0].date)}</span><b>{getLeague(list[0].league)?.flag} {getLeague(list[0].league)?.name}</b><small>{list[0].round}</small></div><div className="va-day-list">{list.map(m=><MatchRow key={m.id} m={m} l={getLeague(m.league)} saved={starred.includes(m.id)} onSave={()=>mark(m.id)} onOpen={()=>openMatch(m)}/>)}</div></section>)}
 {!filteredMatches.length&&<div className="va-state"><Search size={24}/><p>Nema utakmica za izabrane filtere.</p></div>}
 </>}

 {view==='players'&&<>
 <div className="va-controls"><label className="va-search"><Search size={18}/><input placeholder="Igrač ili klub…" aria-label="Pretraži igrače" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Obriši" onClick={()=>setQuery('')}><X size={16}/></button>}</label>
 <label className="va-select"><select value={sort} onChange={e=>{setSort(e.target.value as Sort);setSortDirection('desc')}} aria-label="Sortiraj igrače">{(Object.entries(labels) as [Sort,string][]).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select><ChevronDown size={15}/></label>
 <button className="va-secondary" onClick={()=>setSortDirection(sortDirection==='desc'?'asc':'desc')}>{sortDirection==='desc'?'Najviše ↓':'Najmanje ↑'}</button></div>
 <p className="va-disclosure"><Info size={15}/> Statistika iz trenutno uvezenih utakmica. „—“ znači da taj podatak za igrača nije dostupan. Ne radi se o sezonskoj rang-listi.</p>
 <div className="va-surface va-table-surface"><ScoutPlayerTable players={filteredPlayers} onOpen={openPlayer} sort={sort} onSort={s=>{setSort(s);setSortDirection('desc')}}/></div>
 </>}

 {view==='leagues'&&<>
 <p className="va-disclosure"><Info size={15}/> Učinak klubova iz trenutno dostupnih utakmica, ne zvaničan sezonski plasman.</p>
 <div className="va-league-grid">{leagues.filter(l=>league==='all'||l.id===league).map(l=><button className="va-league-card" key={l.id} onClick={()=>openLeague(l)}><div><LeagueLogo league={l} size="lg"/><ArrowUpRight size={18}/></div><h3>{l.name}</h3><span>{l.country} · {l.season}</span><footer><b>{genderMatches.filter(m=>m.league===l.id).length}</b> utakmica <i>{genderMatches.filter(m=>m.league===l.id&&coverage(m)==='full').length} detaljnih</i></footer></button>)}</div>
 <section className="va-surface"><PanelTitle title="Klubovi u bazi"/><div className="va-club-table">{teamSummary.map(t=><div key={t.league+t.name}><ClubLogo name={t.name} size="xs"/><span><b>{t.name}</b><small>{getLeague(t.league)?.name}</small></span><strong>{t.wins}–{t.losses}</strong><small>{t.setWins}:{t.setLosses} setovi</small></div>)}</div></section>
 </>}

 {view==='match'&&activeMatch&&<>
 <button className="va-back" onClick={()=>navigate('matches')}><ArrowLeft size={17}/> Sve utakmice</button>
 <section className="va-match-detail-top"><div className="va-detail-meta"><span>{getLeague(activeMatch.league)?.flag} {getLeague(activeMatch.league)?.name}</span><span>{activeMatch.round} · {date(activeMatch.date)}</span></div>
 <div className="va-scoreboard"><div><ClubLogo name={activeMatch.home} size="xl"/><h3>{activeMatch.home}</h3></div><div className="va-total-score"><span>ZAVRŠENO</span><b>{activeMatch.homeSets} <i>:</i> {activeMatch.awaySets}</b><small>{activeMatch.sets.length?activeMatch.sets.map(s=>s.join(':')).join('  ·  '):'Setovi nisu uvezeni'}</small></div><div><ClubLogo name={activeMatch.away} size="xl"/><h3>{activeMatch.away}</h3></div></div>
 <div className="va-score-footer"><span className={'va-coverage '+(coverage(activeMatch)==='full'?'good':'')}>{matchInfo(activeMatch)}</span>{activeMatch.venue&&<small>{activeMatch.venue}</small>}{typeof activeMatch.attendance==='number'&&<small>{fmt(activeMatch.attendance)} gledalaca</small>}<button onClick={()=>mark(activeMatch.id)}><Bookmark size={17} fill={starred.includes(activeMatch.id)?'currentColor':'none'}/>{starred.includes(activeMatch.id)?'Sačuvano':'Sačuvaj'}</button></div></section>
 <div className="va-match-tabs" role="tablist" aria-label="Statistika meča">{[['roster','Igrači'],['scout','Analiza meča'],['sets','Setovi']] .map(([key,name])=><button key={key} role="tab" aria-selected={matchTab===key} className={matchTab===key?'active':''} onClick={()=>setMatchTab(key as MatchTab)}>{name}</button>)}</div>
 {matchTab==='roster'&&<section className="va-surface"><PanelTitle title="Statistika igrača" subtitle={activeMatch.teamStats?'Svi aktivni igrači · Poeni, napad, servis, prijem i blok':'Dostupni poeni igrača iz ovog meča'}/>
 <div className="va-roster-tools"><div className="va-seg small"><button className={side==='all'?'active':''} onClick={()=>setSide('all')}>Svi</button><button className={side==='home'?'active':''} onClick={()=>setSide('home')}>Domaći</button><button className={side==='away'?'active':''} onClick={()=>setSide('away')}>Gosti</button></div><label className="va-select"><select aria-label="Statistika za sortiranje" value={rosterMetric} onChange={e=>setRosterMetric(e.target.value as typeof rosterMetric)}><option value="points">Poeni</option><option value="attacksSuccessful">Napad – poeni</option><option value="aces">Asovi</option><option value="blocks">Blokovi</option><option value="receptionPositivePercent">Pozitivan prijem</option></select><ChevronDown size={14}/></label></div>
 <RosterTable match={activeMatch} players={allPlayers} side={side} sort={rosterMetric} onPlayer={openPlayer}/>
 </section>}
 {matchTab==='scout'&&<div className="va-match-analytics"><section className="va-surface"><PanelTitle title="Statistika ekipa"/><MatchInsights match={activeMatch}/></section></div>}
 {matchTab==='sets'&&<section className="va-surface"><PanelTitle title="Analiza po setovima"/><SetChart match={activeMatch}/>{activeMatch.setStats&&<div className="va-set-summary">{activeMatch.setStats.map(s=><div key={s.set}><strong>SET {s.set}</strong><span>Napad <b>{s.home.attacksSuccessful}:{s.away.attacksSuccessful}</b></span><span>Asovi <b>{s.home.aces}:{s.away.aces}</b></span><span>Blok <b>{s.home.blocks}:{s.away.blocks}</b></span></div>)}</div>}{!activeMatch.sets.length&&<div className="va-state">Podaci po setovima nisu dostupni.</div>}</section>}
 <div className="va-match-foot"><span>Podaci se preuzimaju iz zvaničnih zapisnika, kada su dostupni.</span><a href={activeMatch.source} target="_blank" rel="noreferrer">Otvori zapisnik <ExternalLink size={14}/></a></div>
 </>}

 {view==='player'&&activePlayer&&<>
 <button className="va-back" onClick={()=>navigate('players')}><ArrowLeft size={17}/> Svi igrači</button>
 <section className="va-player-head"><ClubLogo name={activePlayer.team} size="xl"/><div><div className="va-eyebrow">SKAUTSKI PROFIL {activePlayer.jersey?' / #'+activePlayer.jersey:''}{activePlayer.position?' / '+activePlayer.position:''}</div><h2>{activePlayer.name}</h2><p>{activePlayer.team} · {getLeague(activePlayer.league)?.name}</p></div></section>
 <div className="va-scout-kpis"><Summary label="POENI" value={fmt(activePlayer.points)}/><Summary label="POENA PO MEČU" value={fmt(activePlayer.pointsPerMatch,1)}/><Summary label="NAPAD %" value={fmt(activePlayer.killPct,1)+(activePlayer.killPct===null?'':'%')}/><Summary label="ASOVI" value={fmt(activePlayer.aces)}/><Summary label="BLOKOVI" value={fmt(activePlayer.blocks)}/></div>
 <section className="va-surface"><PanelTitle title="Profil učinka" subtitle="Napad, prijem, servis, blok i promena po utakmicama"/><PlayerInsights data={data} player={{key:activePlayer.key,name:activePlayer.name,team:activePlayer.team,league:activePlayer.league,points:activePlayer.points??0,matches:activePlayer.matches,matchIds:activePlayer.appearances.map(a=>a.match.id)}}/></section>
 <section className="va-surface va-spacer-top"><PanelTitle title="Utakmice igrača"/><div className="va-match-stack">{activePlayer.appearances.sort((a,b)=>b.match.date.localeCompare(a.match.date)).map(({match,row})=><button className="va-appearance" key={match.id} onClick={()=>openMatch(match)}><span><b>{match.home} – {match.away}</b><small>{date(match.date)} · {match.homeSets}:{match.awaySets}</small></span><strong>{fmt(row.points)} <small>poena</small></strong><ChevronRight size={16}/></button>)}</div></section>
 </>}

 {view==='league'&&activeLeague&&<>
 <button className="va-back" onClick={()=>navigate('leagues')}><ArrowLeft size={17}/> Sve lige</button>
 <section className="va-surface"><LeagueDashboard key={activeLeague.id} data={data} league={activeLeague}/></section>
 <section className="va-surface va-spacer-top"><PanelTitle title="Utakmice lige"/><div className="va-match-stack">{genderMatches.filter(m=>m.league===activeLeague.id).sort((a,b)=>b.date.localeCompare(a.date)).map(m=><MatchRow key={m.id} m={m} l={activeLeague} saved={starred.includes(m.id)} onSave={()=>mark(m.id)} onOpen={()=>openMatch(m)}/>)}</div></section>
 </>}

 {view==='compare'&&<>
 <p className="va-disclosure"><Info size={16}/> Poređenje važi samo za trenutno dostupne utakmice. Za skautske procene uzmi u obzir broj mečeva i pokušaja.</p>
 {playerOne&&playerTwo?<section className="va-surface">
 <div className="va-compare-select"><label><small>IGRAČ A</small><select value={playerOne.key} onChange={e=>setCompareA(e.target.value)}>{filteredPlayers.map(p=><option key={p.key} value={p.key}>{p.name} — {p.team}</option>)}</select></label><span>VS</span><label><small>IGRAČ B</small><select value={playerTwo.key} onChange={e=>setCompareB(e.target.value)}>{filteredPlayers.filter(p=>p.key!==playerOne.key).map(p=><option key={p.key} value={p.key}>{p.name} — {p.team}</option>)}</select></label></div>
 <div className="va-compare-head"><div><ClubLogo name={playerOne.team} size="lg"/><b>{playerOne.name}</b><small>{playerOne.team}</small></div><span>UPOR. STATISTIKA</span><div><ClubLogo name={playerTwo.team} size="lg"/><b>{playerTwo.name}</b><small>{playerTwo.team}</small></div></div>
 {(['points','pointsPerMatch','killPct','efficiency','aces','blocks','receptionPositivePct'] as Sort[]).map(key=><ComparisonRow key={key} label={labels[key]} a={playerOne[key]} b={playerTwo[key]} suffix={['killPct','efficiency','receptionPositivePct'].includes(key)?'%':''}/>)}
 </section>:<div className="va-state">Izaberi najmanje dva igrača.</div>}
 </>}
 </>}

 <footer className="va-footer"><span>© VolleyAtlas · BETA / 2026</span><span>Statistika je ograničena na uvezene utakmice. Za kompletnu sezonu potrebno je nastaviti uvoz zapisnika.</span></footer>
 </main>

 <nav className="va-bottom-nav" aria-label="Mobilna navigacija">{menu.map(item=><button key={item.id} onClick={()=>navigate(item.id)} className={baseline(view)===item.id?'active':''} aria-current={baseline(view)===item.id?'page':undefined}><item.icon size={20}/><small>{item.label}</small></button>)}</nav>
 </div>;
}
function Summary({label,value,accent}:{label:string;value:number|string;accent?:boolean}){return <div className={'va-summary '+(accent?'highlight':'')}><small>{label}</small><strong>{value}</strong></div>}
function PanelTitle({title,subtitle,right,onRight}:{title:string;subtitle?:string;right?:string;onRight?:()=>void}){return <div className="va-panel-title"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{right&&<button onClick={onRight}>{right}<ArrowRight size={16}/></button>}</div>}
function MatchRow({m,l,saved,onOpen,onSave}:{m:Match;l?:League;saved:boolean;onOpen:()=>void;onSave:()=>void}){
 return <article className="va-match-row"><button className="va-match-click" onClick={onOpen}>
 <div className="va-match-teams"><div><ClubLogo name={m.home} size="xs"/><b className={m.homeSets>m.awaySets?'winner':''}>{m.home}</b></div><div><ClubLogo name={m.away} size="xs"/><b className={m.awaySets>m.homeSets?'winner':''}>{m.away}</b></div></div>
 <div className="va-match-score"><b className={m.homeSets>m.awaySets?'winner':''}>{m.homeSets}</b><b className={m.awaySets>m.homeSets?'winner':''}>{m.awaySets}</b></div>
 <div className="va-match-meta"><span>{date(m.date)} · {l?.flag||''} {l?.name||''}</span><small>{m.sets.length?m.sets.map(s=>s[0]+':'+s[1]).join(' · '):'Setovi nisu dostupni'}</small><em className={coverage(m)==='full'?'full':''}>{matchInfo(m)}</em></div><ChevronRight size={17} className="va-match-chevron"/></button>
 <button className={'va-bookmark '+(saved?'active':'')} title={saved?'Ukloni iz sačuvanih':'Sačuvaj meč'} aria-label={saved?'Ukloni iz sačuvanih':'Sačuvaj meč'} onClick={onSave}><Bookmark size={15} fill={saved?'currentColor':'none'}/></button></article>;
}
function RosterTable({match,players,side,sort,onPlayer}:{match:Match;players:ScoutedPlayer[];side:'all'|'home'|'away';sort:'points'|'attacksSuccessful'|'aces'|'blocks'|'receptionPositivePercent';onPlayer:(p:ScoutedPlayer)=>void}){
 const rows=match.players.filter(p=>side==='all'||p.team===(side==='home'?match.home:match.away)).
 sort((a,b)=>(typeof b[sort]==='number'?b[sort] as number:-1)-(typeof a[sort]==='number'?a[sort] as number:-1));
 const attack=(p:Player)=>percentage(typeof p.attacksSuccessful==='number'?p.attacksSuccessful:null,typeof p.attackAttempts==='number'?p.attackAttempts:null);
 const eff=(p:Player)=>p.attackAttempts&&typeof p.attacksSuccessful==='number'&&typeof p.attackErrors==='number'&&typeof p.attacksBlocked==='number'?100*(p.attacksSuccessful-p.attackErrors-p.attacksBlocked)/p.attackAttempts:null;
 if(!rows.length)return <div className="va-state">Za izabranu ekipu još nemamo statistiku igrača.</div>;
 return <div className="va-scroll-table" role="region" aria-label="Statistika igrača — skroluj vodoravno za dodatne kolone" tabIndex={0}>
 <table><thead><tr><th>IGRAČ</th><th>PTS</th><th>NAPAD</th><th>KILL %</th><th>EF %</th><th>AS</th><th>BL</th><th>PRIJEM</th><th>ERR SERV</th><th>BP</th></tr></thead>
 <tbody>{rows.map(p=><tr key={p.team+p.name}>
 <td><button className="va-roster-player" onClick={()=>{const person=players.find(a=>a.team===p.team&&a.league===match.league&&norm(a.name)===norm(p.name));if(person)onPlayer(person)}}><ClubLogo name={p.team} size="xs"/><span><b>{p.name}</b><small>{p.team===match.home?'Domaći':'Gosti'} {p.jersey?'· #'+p.jersey:''} {p.position?'· '+p.position:''}</small></span><ChevronRight size={13}/></button></td>
 <td className="va-number standout">{fmt(p.points)}</td>
 <td className="va-number">{typeof p.attackAttempts==='number'?fmt(p.attacksSuccessful)+'/'+fmt(p.attackAttempts):'—'}</td>
 <td className="va-number">{fmt(attack(p),1)}{attack(p)!==null?'%':''}</td>
 <td className="va-number">{fmt(eff(p),1)}{eff(p)!==null?'%':''}</td>
 <td className="va-number">{fmt(p.aces)}</td><td className="va-number">{fmt(p.blocks)}</td>
 <td className="va-number">{fmt(p.receptionPositivePercent)}{typeof p.receptionPositivePercent==='number'?'%':''}</td>
 <td className="va-number">{fmt(p.serveErrors)}</td><td className="va-number">{fmt(p.breakPoints)}</td>
 </tr>)}</tbody></table><div className="va-table-legend">KILL % = uspešni napadi / pokušaji · EF % = (poeni − greške − blokirani napadi) / pokušaji · BP = break poeni</div></div>;
}
function ScoutPlayerTable({players,onOpen,sort,onSort}:{players:ScoutedPlayer[];onOpen:(p:ScoutedPlayer)=>void;sort:Sort;onSort:(key:Sort)=>void}){
 return <div className="va-scroll-table" tabIndex={0} role="region" aria-label="Skautska tabela igrača, pomeri ulevo za detaljne kolone">
 <table><thead><tr><th>IGRAČ / KLUB</th><th>MEČ.</th>{(['points','pointsPerMatch','killPct','efficiency','aces','blocks','receptionPositivePct'] as Sort[]).map(k=><th key={k}><button className={sort===k?'sorted':''} onClick={()=>onSort(k)}>{labels[k]} {sort===k?'↓':''}</button></th>)}</tr></thead><tbody>
 {players.map(p=><tr key={p.key}><td><button className="va-table-player" onClick={()=>onOpen(p)}><ClubLogo name={p.team} size="xs"/><span><b>{p.name}</b><small>{p.team}{p.position?' · '+p.position:''}</small></span><ChevronRight size={14}/></button></td><td className="va-number">{p.matches}</td>
 {(['points','pointsPerMatch','killPct','efficiency','aces','blocks','receptionPositivePct'] as Sort[]).map(k=><td className={'va-number '+(sort===k?'standout':'')} key={k}>{fmt(p[k],['pointsPerMatch','killPct','efficiency','receptionPositivePct'].includes(k)?1:0)}{p[k]!==null&&['killPct','efficiency','receptionPositivePct'].includes(k)?'%':''}</td>)}</tr>)}
 </tbody></table><div className="va-table-legend">Sačuvaj broj mečeva uz svaki rezultat. Procenti su iz dostupnih pokušaja i prijema; nisu procene za sezonu.</div></div>;
}
function ComparisonRow({label,a,b,suffix}:{label:string;a:number|null;b:number|null;suffix:string}){
 const max=Math.max(Math.abs(a??0),Math.abs(b??0),1),ap=a===null?0:Math.max(0,a)/max*100,bp=b===null?0:Math.max(0,b)/max*100;
 return <div className="va-compare-row"><div><strong>{fmt(a, suffix?1:0)}{a!==null?suffix:''}</strong><b>{label}</b><strong>{fmt(b,suffix?1:0)}{b!==null?suffix:''}</strong></div><div className="va-compare-bars"><span><i style={{width:ap+'%'}}/></span><span><i style={{width:bp+'%'}}/></span></div></div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
