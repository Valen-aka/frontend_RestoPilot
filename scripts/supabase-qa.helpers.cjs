// Solo CLI de QA. Este archivo nunca forma parte del bundle Angular.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const file=process.env.RP_QA_ADMIN_CONFIG||path.join(os.tmpdir(),'RestoPilot-Supabase-Admin.json');
if(!fs.existsSync(file))throw Error('Configura RP_QA_ADMIN_CONFIG con un archivo privado fuera de Git.');
const cfg=JSON.parse(fs.readFileSync(file,'utf8')),database=cfg.database,psqlBinary=process.env.PSQL_BINARY||(process.platform==='win32'?'C:/Program Files/PostgreSQL/17/bin/psql.exe':'psql');
if(!cfg.url?.startsWith('https://')||!cfg.secretKey?.startsWith('sb_secret_')||!database?.password)throw Error('Falta configuración administrativa privada de QA.');
const ref=new URL(cfg.url).hostname.split('.')[0];if(!String(database.user).endsWith('.'+ref)&&!String(database.host).includes(ref))throw Error('La conexión SQL y el proyecto de Auth no coinciden.');
function sql(query){const r=cp.spawnSync(psqlBinary,['-X','-w','-qAt','-v','ON_ERROR_STOP=1'],{input:query,encoding:'utf8',timeout:30000,env:{...process.env,PGHOST:database.host,PGPORT:String(database.port),PGDATABASE:database.database,PGUSER:database.user,PGPASSWORD:database.password,PGSSLMODE:'require',PGCONNECT_TIMEOUT:'8'}});if(r.status!==0)throw Error('Falló una consulta de QA. Revisa los datos temporales antes de repetir.');return r.stdout.trim();}
module.exports={cfg,database,psqlBinary,sql};
