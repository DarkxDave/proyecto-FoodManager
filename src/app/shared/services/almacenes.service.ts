import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface Almacen {
  id_almacen: number;
  nombre: string;
  direccion: string | null;
}

@Injectable({ providedIn: 'root' })
export class AlmacenesService {
  private baseUrl = environment.apiBaseUrl + '/api/almacenes';
  constructor(private http: HttpClient) {}

  listar(): Observable<Almacen[]> { return this.http.get<Almacen[]>(this.baseUrl); }
  crear(nombre: string, direccion?: string): Observable<{ mensaje: string }> { return this.http.post<{ mensaje: string }>(this.baseUrl, { nombre, direccion }); }
  actualizar(id: number, nombre: string, direccion?: string): Observable<{ mensaje: string }> { return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, { nombre, direccion }); }
  eliminar(id: number): Observable<{ mensaje: string }> { return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`); }
  metrics(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/${id}/metrics`); }
  sse(id: number): Observable<any> {
    return new Observable(observer => {
      const es = new EventSource(`${this.baseUrl}/${id}/sse`, { withCredentials: false });
      es.onmessage = ev => {
        try { observer.next(JSON.parse(ev.data)); } catch { /* ignore */ }
      };
      es.onerror = err => { observer.error(err); es.close(); };
      return () => es.close();
    });
  }
}
