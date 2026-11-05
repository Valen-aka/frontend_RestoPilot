export interface LoginRequest {readonly correo: string; readonly password: string;}
export interface AuthResponse {
  readonly mensaje: string;
  readonly token: string;
  readonly id: number;
  readonly nombreCompleto: string;
  readonly correo: string;
  readonly rol: 'CLIENTE' | 'ADMINISTRADOR' | 'DUENO';
  readonly restauranteId: number | null;
}
