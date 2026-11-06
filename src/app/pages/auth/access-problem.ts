import {HttpErrorResponse} from '@angular/common/http';
export function accessProblem(error:unknown,login=false):string {
 if(error instanceof HttpErrorResponse){if(login&&[400,401,403].includes(error.status))return 'Correo o contraseña incorrectos. Revisa tus datos.';if(error.status===409)return 'El correo ya está registrado o existe un conflicto con estos datos.';if(error.status===400&&typeof error.error?.mensaje==='string')return error.error.mensaje;if(error.status===403)return 'Tu cuenta no tiene permiso para realizar esta operación.';}
 return login?'No pudimos iniciar sesión. Verifica la conexión y vuelve a intentarlo.':'No pudimos confirmar el registro. Es posible que se haya creado; intenta iniciar sesión antes de volver a enviarlo.';
}
export const uncertainRegistration=(error:unknown)=>!(error instanceof HttpErrorResponse)||error.status===0||error.status>=500;
