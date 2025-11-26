import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface ReporteResponse {
  mensaje: string;
  spreadsheetId: string;
  url: string;
  totalProductos: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private baseUrl = environment.apiBaseUrl + '/api/reportes';
  constructor(private http: HttpClient) {}

  exportarProductos(spreadsheetId?: string | null): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(`${this.baseUrl}/productos`, { spreadsheetId: spreadsheetId || null });
  }

  descargarExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/productos/excel`, { responseType: 'blob' });
  }
}
