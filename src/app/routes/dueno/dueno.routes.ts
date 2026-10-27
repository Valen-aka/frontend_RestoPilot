import {Routes} from '@angular/router';
import {DuenoLayout} from '../../layouts/dueno-layout/dueno-layout';
const children:Routes=[
{path:"bienvenida",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/dueno/bienvenida"}},
{path:"",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/dueno"}},
{path:"administradores/nuevo",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/dueno/administradores/nuevo"}}
];

export const ROUTES:Routes=[{path:'',component:DuenoLayout,children}];
