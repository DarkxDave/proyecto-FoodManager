import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Producto {
  id_producto: number;
  sku: string;
  codigo_barras: string | null;
  nombre: string;
  precio: number;
  descripcion: string | null;
  id_categoria: number | null;
  categoria?: string | null;
  id_proveedor: number | null;
  proveedor?: string | null;
  stock_minimo: number | null;
  stock_maximo: number | null;
  activo: number;
}

export interface ProductosResponse {
  data: Producto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AlertaStock {
  id_producto: number;
  sku: string;
  nombre: string;
  stock_minimo: number;
  stock_actual: number;
  categoria: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private baseUrl = environment.apiBaseUrl + '/api/productos';
  constructor(private http: HttpClient) {}

  listar(opts: { page?: number; limit?: number; q?: string; categoria?: number; minPrecio?: number; maxPrecio?: number } = {}): Observable<ProductosResponse> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', String(opts.page));
    if (opts.limit) params = params.set('limit', String(opts.limit));
    if (opts.q) params = params.set('q', opts.q);
    if (opts.categoria) params = params.set('categoria', String(opts.categoria));
    if (opts.minPrecio != null) params = params.set('minPrecio', String(opts.minPrecio));
    if (opts.maxPrecio != null) params = params.set('maxPrecio', String(opts.maxPrecio));
    return this.http.get<ProductosResponse>(this.baseUrl, { params });
  }

  detalle(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  crear(dto: Partial<Producto> & { sku: string; nombre: string; costo: number; precio: number }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.baseUrl, dto);
  }

  actualizar(id: number, dto: Partial<Producto>): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, dto);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }

  alertas(): Observable<AlertaStock[]> {
    return this.http.get<AlertaStock[]>(`${this.baseUrl}/alertas`);
  }
}
