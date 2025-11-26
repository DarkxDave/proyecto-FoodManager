import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface OrdenResumen {
  id_oc: number;
  codigo: string | null;
  fecha: string; // ISO string
  proveedor: string;
  estado: 'pendiente' | 'borrador' | 'recibida' | 'cancelada';
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private baseUrl = environment.apiBaseUrl + '/api/ordenes';
  constructor(private http: HttpClient) {}

  listarPendientes(): Observable<OrdenResumen[]> {
    return this.http.get<OrdenResumen[]>(`${this.baseUrl}/pendientes`);
  }

  listarBorrador(): Observable<OrdenResumen[]> {
    return this.http.get<OrdenResumen[]>(`${this.baseUrl}/borrador`);
  }

  crearBorrador(dto: { id_proveedor: number; codigo?: string | null; subtotal: number; impuestos: number; total: number; fecha?: string }): Observable<{ mensaje: string; id_oc: number }>{
    return this.http.post<{ mensaje: string; id_oc: number }>(`${this.baseUrl}`, dto);
  }
}
