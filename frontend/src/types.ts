export type Player={name:string;team:string;points:number|null;aces?:number;attacksSuccessful?:number;attackAttempts?:number};
export type League={id:string;name:string;country:string;flag:string;gender:'M'|'W';season:string;official:string};
export type Match={id:string;league:string;date:string;round:string;home:string;away:string;homeSets:number;awaySets:number;sets:number[][];source:string;players:Player[]};
export type Dataset={metadata:{as_of:string;status:string;disclaimer:string};leagues:League[];matches:Match[]};
export type PlayerSummary={key:string;name:string;team:string;league:string;points:number;matches:number;matchIds:string[]};
