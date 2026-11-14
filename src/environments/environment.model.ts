export interface EnvironmentConfig {
 readonly production:boolean;
 readonly transport:'spring'|'supabase'|'hybrid';
 readonly apiUrl:string;
 readonly springApiUrl?:string;
 readonly supabase:{readonly url:string;readonly publishableKey:string;};
}
