import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlmacenesService, Almacen } from 'src/app/shared/services/almacenes.service';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.page.html',
  styleUrls: ['./bodegas.page.scss'],
  standalone: false
})
export class BodegasPage {
  cargando = false;
  creando = false;
  almacenes: Almacen[] = [];
  almacenesFiltrados: Almacen[] = [];
  error: string | null = null;
  exito: string | null = null;
  editId: number | null = null;
  isAdmin = false;
  filtroTexto = '';

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    direccion: new FormControl('')
  });

  constructor(private svc: AlmacenesService, private http: HttpClient) {
    // Obtener rol para habilitar acciones de admin
    this.http.get<any>(`${environment.apiBaseUrl}/api/auth/me`).subscribe({
      next: u => { this.isAdmin = (u?.rol || '').toLowerCase() === 'admin'; },
      error: () => { this.isAdmin = false; }
    });
    this.cargar();
  }

  cargar(){
    this.cargando = true;
    this.error = null;
    this.svc.listar().pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => { this.almacenes = data; this.aplicarFiltro(); },
      error: (e) => this.error = e?.error?.mensaje || 'No se pudo cargar'
    });
  }

  iniciarCrear(){
    this.creando = true;
    this.editId = null;
    this.form.reset();
  }

  iniciarEditar(a: Almacen){
    this.creando = true;
    this.editId = a.id_almacen;
    this.form.patchValue({ nombre: a.nombre, direccion: a.direccion || '' });
  }

  cancelar(){
    this.creando = false;
    this.editId = null;
    this.form.reset();
  }

  guardar(){
    if(this.form.invalid) return;
    const { nombre, direccion } = this.form.value;
    const obs = this.editId ?
      this.svc.actualizar(this.editId, nombre!, direccion || undefined) :
      this.svc.crear(nombre!, direccion || undefined);
    obs.subscribe({
      next: r => { this.exito = r.mensaje; this.cancelar(); this.cargar(); setTimeout(()=> this.exito=null, 1500); },
      error: e => this.error = e?.error?.mensaje || 'Error al guardar'
    });
  }

  eliminar(a: Almacen){
    if(!confirm('Eliminar almacén "'+a.nombre+'"?')) return;
    this.svc.eliminar(a.id_almacen).subscribe({
      next: r => { this.exito = r.mensaje; this.cargar(); setTimeout(()=> this.exito=null, 1500); },
      error: e => this.error = e?.error?.mensaje || 'Error al eliminar'
    });
  }

  filtrar(ev: any){
    this.filtroTexto = (ev?.detail?.value || '').toString().trim().toLowerCase();
    this.aplicarFiltro();
  }

  private aplicarFiltro(){
    const t = this.filtroTexto;
    if(!t){
      this.almacenesFiltrados = [...this.almacenes];
      return;
    }
    this.almacenesFiltrados = this.almacenes.filter(a => (a.nombre || '').toLowerCase().includes(t));
  }

  trackById(_i: number, a: Almacen){ return a.id_almacen; }
}
