import {Component,DestroyRef,Type,inject,signal} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import manifest from './screen-manifest.json';
import {SCREEN_LOADERS} from './screen-loaders';
/** Infraestructura inicial para seleccionar un frame. No implementa pantallas ni negocio. */
@Component({selector:'rp-screen-host',imports:[NgComponentOutlet],template:'@if(component()){<ng-container *ngComponentOutlet="component()"/>}'})
export class ScreenHost{
 readonly component=signal<Type<unknown>|null>(null);private version=0;
 constructor(){const route=inject(ActivatedRoute);const destroyRef=inject(DestroyRef);
  route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe(async params=>{
   const version=++this.version;this.component.set(null);const base=route.snapshot.data['base'] as string;
   const frame=manifest.find(s=>s.slug===params.get('vista')&&s.base===base)||manifest.find(s=>s.base===base&&s.canonical);
   if(frame){const component=await SCREEN_LOADERS[frame.slug as keyof typeof SCREEN_LOADERS]();if(version===this.version)this.component.set(component);}
  });
 }
}
