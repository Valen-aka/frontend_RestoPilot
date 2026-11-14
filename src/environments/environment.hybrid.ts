import type {EnvironmentConfig} from './environment.model';

// Solo para pruebas locales cuando Spring valide JWT de Supabase y use la misma base.
export const environment:EnvironmentConfig={
 production:false,
 transport:'hybrid',
 apiUrl:'/restopilot-api',
 springApiUrl:'http://localhost:8081/api',
 supabase:{url:'https://unvxosrwqmcwrtxplrsf.supabase.co',publishableKey:'sb_publishable_IL42_jF4ncdOOtxCAjnooA_du9sKJul'}
};
