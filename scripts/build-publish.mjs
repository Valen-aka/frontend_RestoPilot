import {existsSync,readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
export function publicSupabaseUrl(value){
 if(!value)throw new Error('Configura la URL pública de Supabase.');const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw new Error('La URL de Supabase debe ser HTTPS, sin credenciales, ruta ni parámetros.');return url.origin;
}
export function publicSupabaseKey(value){if(typeof value!=='string'||!/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(value))throw new Error('Usa solo una clave sb_publishable_ de Supabase. Nunca una clave secreta o service_role.');return value;}

export function publicAssistantApiUrl(value) {
 const configured = value?.trim();
 if (!configured) return undefined;
 const url = URL.parse(configured);
 const path = url?.pathname.replace(/\/+$/, '');
 if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
     || path !== '/api/ia' || /^(?:localhost|0\.0\.0\.0|127\..*|\[::1\])\.?$/i.test(url.hostname)
     || /\.localhost\.?$/i.test(url.hostname)) {
  throw new Error('RP_PUBLIC_ASSISTANT_API_URL debe ser una URL HTTPS de producción terminada en /api/ia, sin credenciales ni parámetros.');
 }
 return url.origin + path;
}

function main(){
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
 const supabase={url:publicSupabaseUrl(process.env.RP_PUBLIC_SUPABASE_URL||'https://unvxosrwqmcwrtxplrsf.supabase.co'),publishableKey:publicSupabaseKey(process.env.RP_PUBLIC_SUPABASE_KEY||'sb_publishable_IL42_jF4ncdOOtxCAjnooA_du9sKJul')};
 const assistantApiUrl = publicAssistantApiUrl(process.env.RP_PUBLIC_ASSISTANT_API_URL);
 if (!assistantApiUrl) console.warn('RP_PUBLIC_ASSISTANT_API_URL está sin configurar. El asistente queda deshabilitado en este build.');
 const environment = { production: true, transport: 'supabase', apiUrl: '/restopilot-api', assistantApiUrl, supabase };
 const target=resolve(root,'src/environments/environment.publish.ts'),previous=existsSync(target)?readFileSync(target):null;
 try{writeFileSync(target,`import type {EnvironmentConfig} from './environment.model';\n// Public configuration only.\nexport const environment:EnvironmentConfig=${JSON.stringify(environment)};\n`);const r=spawnSync(process.execPath,[resolve(root,'node_modules/@angular/cli/bin/ng.js'),'build','--configuration','publish'],{cwd:root,stdio:'inherit'});if(r.error)throw r.error;process.exitCode=r.status??1;}
 finally{if(previous)writeFileSync(target,previous);else if(existsSync(target))unlinkSync(target);}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
