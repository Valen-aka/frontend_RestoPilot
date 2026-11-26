import {test} from 'node:test';import assert from 'node:assert/strict';import {publicAssistantApiUrl,publicSupabaseUrl,publicSupabaseKey} from './build-publish.mjs';
test('publicación acepta solo URL HTTPS sin credenciales ni rutas auxiliares',()=>{assert.equal(publicSupabaseUrl('https://project.supabase.co/'),'https://project.supabase.co');for(const value of ['', 'http://localhost:8081/api','https://localhost/','https://user:secret@project.supabase.co/','https://project.supabase.co/?key=x','https://project.supabase.co/#token','https://project.supabase.co/rest/v1'])assert.throws(()=>publicSupabaseUrl(value));});
test('publicación rechaza claves secretas y service_role',()=>{const key='sb_publishable_'+'a'.repeat(32);assert.equal(publicSupabaseKey(key),key);for(const value of ['',undefined,'sb_secret_'+'a'.repeat(32),'eyJserviceRole','service_role'])assert.throws(()=>publicSupabaseKey(value));});

test('publicación acepta una base HTTPS del asistente y elimina barras finales', () => {
 const base = 'https://api.example.com/api/ia';
 assert.equal(publicAssistantApiUrl(` ${base}/ `), base);
 assert.equal(publicAssistantApiUrl(undefined), undefined);
 assert.equal(publicAssistantApiUrl(' '), undefined);
});

test('publicación rechaza URLs del asistente inválidas sin exponer el valor recibido', () => {
 const invalid = [
  '/api/ia', 'http://api.example.com/api/ia', 'https://localhost/api/ia',
  'https://backend.localhost/api/ia', 'https://127.0.0.2/api/ia', 'https://[::1]/api/ia',
  'https://api.example.com/api/ia/admin/chat', 'https://api.example.com/api',
  'https://user:secret@api.example.com/api/ia', 'https://api.example.com/api/ia?key=x',
  'https://api.example.com/api/ia#token',
 ];
 for (const value of invalid) {
  assert.throws(() => publicAssistantApiUrl(value), {
   message: 'RP_PUBLIC_ASSISTANT_API_URL debe ser una URL HTTPS de producción terminada en /api/ia, sin credenciales ni parámetros.',
  });
 }
});
