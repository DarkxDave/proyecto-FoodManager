import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  id_rol: number;
  activo: boolean;
  created_at: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  telefono?: string;
  contrasena: string;
  id_rol: number;
}

export interface ActualizarUsuarioDto {
  nombre?: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private baseUrl = environment.apiBaseUrl + '/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(options: {
    q?: string;
    rol?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<UsuariosResponse> {
    let params = new HttpParams();
    
    if (options.q) params = params.set('q', options.q);
    if (options.rol) params = params.set('rol', options.rol);
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<UsuariosResponse>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crear(dto: CrearUsuarioDto): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.baseUrl, dto);
  }

  actualizar(id: number, dto: ActualizarUsuarioDto): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, dto);
  }

  cambiarRol(id: number, id_rol: number): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}/rol`, { id_rol });
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/roles/list`);
  }
}
