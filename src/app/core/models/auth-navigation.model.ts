export type AuthRole='CLIENTE'|'ADMINISTRADOR'|'DUENO';
export const roleHome=(role:string)=>role==='CLIENTE'?'/cliente':role==='DUENO'?'/dueno':'/operacion';
export function roleAllows(role:string,path:string):boolean {return role==='CLIENTE'?/^\/cliente(?:\/|$)/.test(path):role==='ADMINISTRADOR'?/^\/operacion(?:\/|$)/.test(path):role==='DUENO'?/^\/(?:dueno|operacion)(?:\/|$)/.test(path):false;}
export function safeReturn(role:string,raw:unknown):string {
 if(typeof raw!=='string'||!raw.startsWith('/')||raw.startsWith('//')||Array.from(raw).some(c=>c.charCodeAt(0)<=32||c.charCodeAt(0)===92))return roleHome(role);
 try {const url=new URL(raw,'https://restopilot.invalid'),decoded=decodeURIComponent(url.pathname);if(url.origin!=='https://restopilot.invalid'||/[\\();]/.test(decoded)||decoded.startsWith('//')||!roleAllows(role,decoded))return roleHome(role);return url.pathname+url.search+url.hash;}catch{return roleHome(role);}
}
