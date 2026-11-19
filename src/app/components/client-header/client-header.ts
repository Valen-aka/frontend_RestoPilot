import {Brand} from '../brand/brand';
import {afterNextRender, Component, computed, DestroyRef, DOCUMENT, effect, inject, signal, ElementRef} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../core/services/auth.service';
import {UiIcon} from '../ui-icon/ui-icon';
import {NotificacionesStore} from '../../pages/notificaciones-ui/notificaciones-store';
@Component({selector:'rp-client-header',imports: [Brand,UiIcon,RouterLink,MatButtonModule],providers:[NotificacionesStore],templateUrl:'./client-header.html',styleUrl:'./client-header.css'})
export class ClientHeader {
  readonly menuOpen=signal(false);
  readonly notificationsOpen=signal(false);
  readonly notificationAlert=signal('');
  readonly newCount=signal(0);
  readonly notifications=inject(NotificacionesStore);
  private readonly document=inject(DOCUMENT);
  private readonly destroyRef=inject(DestroyRef);
  private notificationIdentity='';
  private latestNotificationId=0;
  private notificationsInitialized=false;
  private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
  closeMenu(event:Event):void {
    if(this.notificationsOpen()){event.preventDefault();this.notificationsOpen.set(false);this.host.nativeElement.querySelector<HTMLButtonElement>('.notification-toggle')?.focus();return;}
    if(this.menuOpen()){event.preventDefault();this.menuOpen.set(false);this.host.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();}
  }

  readonly auth = inject(AuthService);
  readonly accountName=computed(()=>this.auth.session()?.nombreCompleto?.trim()||'Mi cuenta');
  readonly initials=computed(()=>this.accountName().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0].toLocaleUpperCase('es')).join(''));
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(this.router.events.pipe(
    filter((event):event is NavigationEnd => event instanceof NavigationEnd),
    map(event=>event.urlAfterRedirects)
  ),{initialValue:this.router.url});
  readonly links = [
    {label:'Inicio',url:'/cliente',paths:['/cliente']},
    {label:'La carta',url:'/cliente/carta',paths:['/cliente/carta','/cliente/plato']},
    {label:'Mis reservas',url:'/cliente/reservas',paths:['/cliente/reservas','/cliente/reservar','/cliente/reserva','/cliente/plano']},
    {label:'Mis pedidos',url:'/cliente/pedidos',paths:['/cliente/pedidos','/cliente/pedido','/cliente/carrito','/cliente/entrega','/cliente/pago']},
    {label:'Asistente IA',url:'/cliente/asistente',paths:['/cliente/asistente','/cliente/notificaciones/ia']}
  ];
  active(link: typeof this.links[number]): boolean {
    const path = this.currentUrl().split(/[?#]/)[0];
    return link.paths.some(candidate => path === candidate || (candidate !== '/cliente' && candidate !== '/cliente/notificaciones' && path.startsWith(candidate + '/')));
  }
  logout(): void {this.auth.logout(); void this.router.navigate(['/auth/login']); }
  toggleNotifications():void {
    this.menuOpen.set(false);
    this.notificationsOpen.update(open=>!open);
    if(this.notificationsOpen()){this.newCount.set(0);this.notificationAlert.set('');this.refreshNotifications();}
  }
  refreshNotifications():void {if(this.auth.session()?.role==='CLIENTE'&&this.notifications.state()!=='loading')this.notifications.load(0);}
  dismissAlert():void {this.notificationAlert.set('');}
  date(value:string):string {const [date,time]=value.split('T');const [year,month,day]=date.split('-');return `${day}/${month}/${year} · ${time.slice(0,5)}`;}
  constructor(){
    effect(()=>{
      const session=this.auth.session(),identity=session?session.subject+':'+session.accessToken:'';
      const state=this.notifications.state(),current=this.notifications.current(),messages=this.notifications.messages();
      if(identity!==this.notificationIdentity){this.notificationIdentity=identity;this.notificationsInitialized=false;this.latestNotificationId=0;this.newCount.set(0);this.notificationAlert.set('');this.notificationsOpen.set(false);}
      if(!identity||!current||(state!=='ready'&&state!=='empty'))return;
      const latest=messages.reduce((id,message)=>Math.max(id,message.id),0);
      if(!this.notificationsInitialized){this.latestNotificationId=latest;this.notificationsInitialized=true;return;}
      if(latest>this.latestNotificationId){
        const added=messages.filter(message=>message.id>this.latestNotificationId);
        this.latestNotificationId=latest;
        this.newCount.set(this.notificationsOpen()?0:this.newCount()+added.length);
        this.notificationAlert.set(added[0]?.mensaje??'Tienes una nueva notificación.');
      }
    });
    afterNextRender(()=>{
      const poll=()=>{if(!this.document.hidden&&!this.notificationsOpen())this.refreshNotifications();};
      const timer=setInterval(poll,30000);
      this.document.addEventListener('visibilitychange',poll);
      this.destroyRef.onDestroy(()=>{clearInterval(timer);this.document.removeEventListener('visibilitychange',poll);});
    });
  }
}
