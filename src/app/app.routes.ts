import {Routes} from '@angular/router';
export const routes:Routes=[
{path:'',pathMatch:'full',loadComponent:()=>import('./home/home').then(m=>m.Home)},
{path:'estructura',loadComponent:()=>import('./structure-index/structure-index').then(m=>m.StructureIndex)},
{path:"auth",loadChildren:()=>import('./routes/auth/auth.routes').then(m=>m.ROUTES)},
{path:"dueno",loadChildren:()=>import('./routes/dueno/dueno.routes').then(m=>m.ROUTES)},
{path:"cliente",loadChildren:()=>import('./routes/cliente/cliente.routes').then(m=>m.ROUTES)},
{path:"operacion",loadChildren:()=>import('./routes/operacion/operacion.routes').then(m=>m.ROUTES)},
{path:"estado",loadChildren:()=>import('./routes/estado/estado.routes').then(m=>m.ROUTES)},
{path:'**',redirectTo:'estructura'}
];
