import {Component, computed, effect, input, signal} from '@angular/core';
@Component({selector:'rp-plato-imagen',templateUrl:'./plato-imagen.html',styleUrl:'./plato-imagen.css'})
export class PlatoImagen {
  readonly source=input<string|null>(null);readonly name=input.required<string>();readonly broken=signal(false);
  readonly url=computed(()=>{const src=this.source()?.trim()??'';return /^https?:\/\//i.test(src)||/^\/assets\//.test(src)?src:'';});
  constructor(){effect(()=>{this.source();this.broken.set(false);});}
}
