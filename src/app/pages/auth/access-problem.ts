import {HttpErrorResponse} from '@angular/common/http';
import {FormGroup} from '@angular/forms';

/** Asocia únicamente campos conocidos del DTO; no conserva el cuerpo de la solicitud. */
export function applyRegistrationErrors(form:FormGroup,error:unknown,fields:Record<string,string>):void {
 if(!(error instanceof HttpErrorResponse)||error.status!==400||!Array.isArray(error.error?.detalles))return;
 for(const detail of error.error.detalles){
  if(typeof detail!=='string')continue;
  const separator=detail.indexOf(':');if(separator<0)continue;
  const control=form.get(fields[detail.slice(0,separator).trim()]??'');
  if(control){control.setErrors({...control.errors,server:detail.slice(separator+1).trim()});control.markAsTouched();}
 }
}
export function accessProblem(error:unknown,login=false):string {
 if(error instanceof HttpErrorResponse&&error.error?.code==='email_address_not_authorized')return 'El servicio de correo no permite enviar la confirmación a esta dirección. Contacta con el responsable del restaurante.';
 if(error instanceof HttpErrorResponse){if(error.error?.code==='email_not_confirmed')return 'Confirma tu correo antes de iniciar sesión.';if(error.status===429)return 'Espera un momento antes de volver a intentarlo.';if(login&&[400,401,403].includes(error.status))return 'Correo o contraseña incorrectos. Revisa tus datos.';if(error.status===409)return 'El correo ya está registrado o existe un conflicto con estos datos.';if(error.status===400&&typeof error.error?.mensaje==='string')return error.error.mensaje;if(error.status===401)return 'La sesión ya no está vigente. Inicia sesión nuevamente.';if(error.status===403)return 'Tu cuenta no tiene permiso para realizar esta operación.';if(error.status===404)return 'No se encontró el recurso solicitado. Vuelve al inicio e inténtalo nuevamente.';}
 return login?'No pudimos iniciar sesión. Verifica la conexión y vuelve a intentarlo.':'No pudimos confirmar el registro. Es posible que se haya creado; intenta iniciar sesión antes de volver a enviarlo.';
}
export const uncertainRegistration=(error:unknown)=>!(error instanceof HttpErrorResponse)||error.status===0||error.status>=500;
