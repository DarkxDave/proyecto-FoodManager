import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductosService, Producto, ProductosResponse } from 'src/app/shared/services/productos.service';
import { ReportesService } from '../../../shared/services/reportes.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  cargando = false;
  error: string | null = null;
  data: Producto[] = [];
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  q = new FormControl('');
  isAdminOrEditor = false;
  isAdmin = false;
  exportando = false;

  // Modal crear producto
  mostrarModal = false;
  modoEdicion = false;
  productoEditando: Producto | null = null;
  crearForm = new FormGroup({
    sku: new FormControl('', [Validators.required, Validators.minLength(3)]),
    codigo_barras: new FormControl(''),
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    unidad: new FormControl('unidad', [Validators.required]),
    costo: new FormControl(0, [Validators.required, Validators.min(0)]),
    precio: new FormControl(0, [Validators.required, Validators.min(0)]),
    impuesto: new FormControl(19, [Validators.min(0)]),
    descripcion: new FormControl(''),
    stock_minimo: new FormControl(0, [Validators.min(0)]),
    stock_maximo: new FormControl<number | null>(null),
    id_categoria: new FormControl<number | null>(null),
    id_proveedor: new FormControl<number | null>(null)
  });

  constructor(
    private svc: ProductosService, 
    private reportes: ReportesService, 
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.http.get<any>(`${environment.apiBaseUrl}/api/auth/me`).subscribe({
      next: u => {
        const r = (u?.rol || '').toLowerCase();
        this.isAdminOrEditor = r === 'admin' || r === 'editor';
        this.isAdmin = r === 'admin';
      },
      error: () => { this.isAdminOrEditor = false; this.isAdmin = false; }
    });
    
    // Debounce en búsqueda
    this.q.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.cargar();
    });
    
    this.cargar();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar() {
    this.cargando = true; this.error = null;
    this.svc.listar({ page: this.page, limit: this.limit, q: this.q.value || undefined }).subscribe({
      next: (res: ProductosResponse) => { this.data = res.data; this.total = res.pagination.total; this.totalPages = res.pagination.totalPages; this.cargando = false; },
      error: e => { this.error = e?.error?.mensaje || 'Error al cargar'; this.cargando = false; }
    });
  }

  siguiente() { if (this.page < this.totalPages) { this.page++; this.cargar(); } }
  anterior() { if (this.page > 1) { this.page--; this.cargar(); } }

  trackById(_i: number, p: Producto) { return p.id_producto; }

  abrirCrearProducto() {
    if (!this.isAdmin) { return; }
    this.modoEdicion = false;
    this.productoEditando = null;
    this.crearForm.reset({ unidad: 'unidad', impuesto: 19, stock_minimo: 0 });
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.crearForm.reset({ unidad: 'unidad', impuesto: 19, stock_minimo: 0 });
    this.modoEdicion = false;
    this.productoEditando = null;
  }

  

  async guardarProducto() {
    if (!this.isAdminOrEditor) { return; }
    if (this.crearForm.invalid) {
      Object.keys(this.crearForm.controls).forEach(k => this.crearForm.get(k)?.markAsTouched());
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos requeridos',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      toast.present();
      return;
    }
    const v = this.crearForm.value;
    const dto: any = {
      sku: v.sku!,
      codigo_barras: v.codigo_barras || null,
      nombre: v.nombre!,
      id_categoria: v.id_categoria || null,
      id_proveedor: v.id_proveedor || null,
      unidad: v.unidad!,
      costo: Number(v.costo || 0),
      precio: Number(v.precio || 0),
      impuesto: Number(v.impuesto || 0),
      descripcion: v.descripcion || null,
      stock_minimo: Number(v.stock_minimo || 0),
      stock_maximo: v.stock_maximo !== null ? Number(v.stock_maximo) : null
    };
    this.cargando = true; this.error = null;
    if (this.modoEdicion && this.productoEditando) {
      this.svc.actualizar(this.productoEditando.id_producto, dto).subscribe({
        next: async () => { 
          this.cargando = false; 
          this.cerrarModal(); 
          this.cargar();
          const toast = await this.toastCtrl.create({
            message: 'Producto actualizado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          toast.present();
        },
        error: async (err) => { 
          this.cargando = false; 
          const errorMsg = err?.error?.mensaje || 'Error al actualizar producto';
          this.error = errorMsg;
          const toast = await this.toastCtrl.create({
            message: errorMsg,
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          toast.present();
        }
      });
    } else {
      this.svc.crear(dto).subscribe({
        next: async () => { 
          this.cargando = false; 
          this.cerrarModal(); 
          this.cargar();
          const toast = await this.toastCtrl.create({
            message: 'Producto creado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          toast.present();
        },
        error: async (err) => { 
          this.cargando = false; 
          const errorMsg = err?.error?.mensaje || 'Error al crear producto';
          this.error = errorMsg;
          const toast = await this.toastCtrl.create({
            message: errorMsg,
            duration: 3000,
            color: 'danger',
            position: 'bottom'
          });
          toast.present();
        }
      });
    }
  }

  editarProducto(p: Producto) {
    if (!this.isAdminOrEditor) { return; }
    this.modoEdicion = true;
    this.productoEditando = p;
    this.crearForm.patchValue({
      sku: p.sku,
      codigo_barras: p.codigo_barras || '',
      nombre: p.nombre,
      unidad: 'unidad', // suponer unidad por defecto si no está en interface
      costo: p.precio, // sin costo en interface original; usar precio como placeholder
      precio: p.precio,
      impuesto: 19,
      descripcion: p.descripcion || '',
      stock_minimo: p.stock_minimo || 0,
      stock_maximo: p.stock_maximo ?? null,
      id_categoria: p.id_categoria || null,
      id_proveedor: p.id_proveedor || null
    });
    this.mostrarModal = true;
  }

  async eliminarProducto(p: Producto) {
    if (!this.isAdminOrEditor) { return; }
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Eliminar producto ${p.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.cargando = true; this.error = null;
            this.svc.eliminar(p.id_producto).subscribe({
              next: async () => { 
                this.cargando = false; 
                this.cargar();
                const toast = await this.toastCtrl.create({
                  message: 'Producto eliminado correctamente',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                toast.present();
              },
              error: async (err) => { 
                this.cargando = false; 
                const errorMsg = err?.error?.mensaje || 'Error al eliminar producto';
                this.error = errorMsg;
                const toast = await this.toastCtrl.create({
                  message: errorMsg,
                  duration: 3000,
                  color: 'danger',
                  position: 'bottom'
                });
                toast.present();
              }
            });
          }
        }
      ]
    });
    
    await alert.present();
  }

  descargarExcel() {
    if (!this.isAdmin) { return; }
    this.exportando = true; this.error = null;
    this.reportes.descargarExcel().subscribe({
      next: (blob: Blob) => {
        this.exportando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Productos_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.exportando = false;
        this.error = err?.error?.mensaje || 'Error descargando Excel';
      }
    });
  }
}
