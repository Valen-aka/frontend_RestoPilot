import {Routes} from '@angular/router';
import {AuthLayout} from '../../layouts/auth-layout/auth-layout';
const children:Routes=[
{path:"403",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/estado/403"}},
{path:"404",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/estado/404"}},
{path:"sesion",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/estado/sesion"}},
{path:"error",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/estado/error"}},
{path:"cargando",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/estado/cargando"}}
];

export const ROUTES:Routes=[{path:'',component:AuthLayout,children}];
