export type Player={
 name:string;team:string;points:number|null;
 aces?:number;attacksSuccessful?:number;attackAttempts?:number;
 blocks?:number;serveAttempts?:number;serveErrors?:number;attackErrors?:number;attacksBlocked?:number;
 receptionAttempts?:number;receptionPositivePercent?:number;receptionExcellentPercent?:number;receptionErrors?:number;breakPoints?:number
};
export type League={id:string;name:string;country:string;flag:string;gender:'M'|'W';season:string;official:string;logo?:string};
export type TeamDetailed={points?:number;breakPoints?:number;serveAttempts?:number;serveErrors?:number;aces?:number;receptionAttempts?:number;receptionErrors?:number;receptionPositivePercent?:number;receptionExcellentPercent?:number;attackAttempts?:number;attackErrors?:number;attacksBlocked?:number;attacksSuccessful?:number;blocks?:number};
export type SetDetail={set:number;aces:number;attacksSuccessful:number;blocks:number;attackAttempts:number;receptionAttempts:number;receptionPositivePercent:number|null;receptionExcellentPercent:number|null;receptionErrors:number;attackErrors:number;attacksBlocked:number};
export type Match={id:string;league:string;date:string;round:string;home:string;away:string;homeSets:number;awaySets:number;sets:number[][];source:string;players:Player[];venue?:string;attendance?:number;teamStats?:{home:TeamDetailed;away:TeamDetailed};setStats?:{set:number;home:SetDetail;away:SetDetail}[]};
export type Dataset={metadata:{as_of:string;status:string;disclaimer:string;statCoverage?:string};leagues:League[];matches:Match[];clubLogos?:Record<string,string>};
export type PlayerSummary={key:string;name:string;team:string;league:string;points:number;matches:number;matchIds:string[]};
