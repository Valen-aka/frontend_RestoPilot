import {afterNextRender, Component, DestroyRef, ElementRef, inject, signal, viewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'rp-home',
  imports: [RouterLink, MatButtonModule, MatMenuModule, MatExpansionModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  readonly compactNav = signal(false);
  readonly selectedSolution = signal(0);
  readonly selectedMoment = signal(0);
  readonly navigation = [
    {label: 'La experiencia', id: 'experiencia'},
    {label: 'Soluciones', id: 'soluciones'},
    {label: 'Asistente IA', id: 'asistente-ia'},
    {label: 'Preguntas', id: 'preguntas'}
  ];
  readonly moments = [
    {label: 'Reserva', time: '19:30 · Reserva confirmada', title: 'La noche empieza bien.',
      detail: 'Dos personas. Una mesa lista. El equipo ya está al tanto.', area: 'Salón', state: 'Reservada'},
    {label: 'Cocina', time: 'Pedido #1042 · Mesa 04', title: 'Del pedido al siguiente paso.',
      detail: '2 × Lomo saltado. 1 × Limonada. Listo para cocina.', area: 'Cocina', state: 'En preparación'},
    {label: 'A la mesa', time: 'Pedido #1042 · Mesa 04', title: 'Del salón a cocina.',
      detail: 'Sigue cada pedido hasta la entrega.', area: 'A la mesa', state: 'Listo'}
  ];
  readonly solutions = [
    {title: 'Pedidos que fluyen', description: 'Del antojo de tu cliente al ritmo de tu cocina. Sigue cada pedido hasta la entrega.'},
    {title: 'Reservas en orden', description: 'Una reserva que llega a tiempo. Una mesa lista. El equipo ya está al tanto.'},
    {title: 'Una carta con personalidad', description: 'Tu carta, siempre a mano. Hecho para disfrutar, a tu ritmo.'},
    {title: 'Reportes para decidir', description: 'Encuentra perspectiva en los resultados de tu restaurante.'}
  ];
  readonly steps = [
    {title: 'Presenta tu restaurante', text: 'Crea tu cuenta de dueño y registra el espacio que le da vida a tu cocina.'},
    {title: 'Dale tu personalidad', text: 'Organiza la carta, configura tus mesas e incorpora a tu administrador.'},
    {title: 'Conecta el servicio', text: 'Reúne pedidos, reservas y reportes en el día a día de tu equipo.'}
  ];
  readonly faqs = [
    {question: '¿Para quién está pensado RestoPilot?',
      answer: 'Para restaurantes que quieren reunir su carta, pedidos, mesas y reservas. Hay espacios específicos para clientes, dueños y administradores.'},
    {question: '¿Puedo gestionar distintos tipos de entrega?',
      answer: 'La experiencia contempla pedidos en salón, delivery, para llevar y para recoger. Cada pedido muestra su modalidad y estado.'},
    {question: '¿Cómo funciona el registro de pagos?',
      answer: 'El equipo registra los pagos recibidos por los medios del restaurante. Es un registro administrativo; no reemplaza una pasarela de pago.'},
    {question: '¿Qué puedo consultar al asistente IA?',
      answer: 'La funcionalidad prevista permitirá a los clientes explorar platos, ingredientes y recomendaciones. El equipo podrá consultar platos más vendidos, volumen de atención, demanda y pagos, según los datos disponibles. El asistente todavía no está conectado.'},
    {question: '¿Puedo ver la experiencia antes de registrarme?',
      answer: 'Sí. Explora las demostraciones ilustrativas de esta página. Usan datos de ejemplo, no guardan operaciones reales y no requieren iniciar sesión.'}
  ];

  constructor() {
    const destroyRef = inject(DestroyRef);
    const title = inject(Title);
    const previousTitle = title.getTitle();
    title.setTitle('RestoPilot — Buen servicio. Buenas historias.');
    destroyRef.onDestroy(() => title.setTitle(previousTitle));
    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => {
        this.compactNav.set(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      });
      observer.observe(this.hero().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  goTo(event: Event, id: string): void {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.focus({preventScroll: true});
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start'
    });
    history.replaceState(history.state, '', '#' + id);
    // A menu restores its trigger focus while closing; then focus the chosen section.
    requestAnimationFrame(() => {
      if (target.isConnected) target.focus({preventScroll: true});
    });
  }
}
