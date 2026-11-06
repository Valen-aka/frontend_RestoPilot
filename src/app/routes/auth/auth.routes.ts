import {registrationPendingGuard} from '../../core/guards/session.guard';
import {Routes} from '@angular/router';
import {AuthLayout} from '../../layouts/auth-layout/auth-layout';
const children:Routes=[
{path:"login",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/auth/login"}},
{path:"registro",canDeactivate:[registrationPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/auth/registro"}},
{path:"registro-dueno",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/auth/registro-dueno"}},
{path:"restaurante",canDeactivate:[registrationPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/auth/restaurante"}}
];

export const ROUTES:Routes=[{path:'',component:AuthLayout,children}];
