import type {EnvironmentConfig} from './environment.model';
// Solo configuración pública. Las claves administrativas permanecen en Supabase Vault.
export const environment:EnvironmentConfig={production:false,transport:'supabase',apiUrl:'/restopilot-api',supabase:{url:'https://unvxosrwqmcwrtxplrsf.supabase.co',publishableKey:'sb_publishable_IL42_jF4ncdOOtxCAjnooA_du9sKJul'}};
