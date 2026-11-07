export interface EnvironmentConfig {
 readonly production:boolean;
 readonly transport:'spring'|'supabase';
 readonly apiUrl:string;
 readonly supabase:{readonly url:string;readonly publishableKey:string;};
}
