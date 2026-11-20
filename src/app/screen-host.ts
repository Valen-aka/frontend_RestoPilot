import {Component,DestroyRef,Type,inject,signal} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import manifest from './screen-manifest.json';
import {ClientLoadingSkeleton, ClientSkeletonKind} from './components/client-loading-skeleton/client-loading-skeleton';
import {SCREEN_LOADERS} from './screen-loaders';
/** Infraestructura inicial para seleccionar un frame. No implementa pantallas ni negocio. */
@Component({selector:'rp-screen-host',imports:[NgComponentOutlet,ClientLoadingSkeleton],
 template: `
  @if (component()) {
    <ng-container *ngComponentOutlet="component()" />
  } @else if (panelLoading()) {
    <div class="rp-container rp-page">
      <rp-client-loading-skeleton [kind]="panelKind" label="Cargando sección…" />
    </div>
  } @else if (panelLoadFailed()) {
    <p class="rp-container rp-page" role="alert">No pudimos cargar esta sección. Vuelve a abrirla o recarga la página.</p>
  }
 `})
export class ScreenHost{
 readonly component=signal<Type<unknown>|null>(null);private version=0;
 readonly panelLoading = signal(false);
 readonly panelLoadFailed = signal(false);
 panelKind: ClientSkeletonKind = 'list';
 constructor(){const route=inject(ActivatedRoute);const destroyRef=inject(DestroyRef);
  route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe(async params=>{
   const version=++this.version;this.component.set(null);const base=route.snapshot.data['base'] as string;
   const frame=manifest.find(s=>s.slug===params.get('vista')&&s.base===base)||manifest.find(s=>s.base===base&&s.canonical);
   const panel = /^\/(operacion|dueno)(\/|$)/.test(base);
   this.panelLoadFailed.set(false);
   this.panelLoading.set(panel && Boolean(frame));
   if (!frame) return;
   this.panelKind = base === '/dueno' || base === '/operacion' || base.startsWith('/operacion/reportes')
     ? 'dashboard'
     : base === '/dueno/administradores/nuevo' || base === '/operacion/asistente' ? 'payment' : 'list';
   try {
    const component=await SCREEN_LOADERS[frame.slug as keyof typeof SCREEN_LOADERS]();
    if (version===this.version && !destroyRef.destroyed) this.component.set(component);
   } catch (error) {
    if (!panel) throw error;
    if (version===this.version && !destroyRef.destroyed) this.panelLoadFailed.set(true);
   } finally {
    if (version===this.version && !destroyRef.destroyed) this.panelLoading.set(false);
   }
  });
 }
}
