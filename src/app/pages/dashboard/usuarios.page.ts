import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuariosService, Usuario, Rol, CrearUsuarioDto, ActualizarUsuarioDto } from 'src/app/shared/services/usuarios.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: false
})
export class UsuariosPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  cargando = false;
  error = '';
  
  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  total = 0;
  limite = 10;
  
  // Filtros
  busqueda = new FormControl('');
  rolFiltro = new FormControl('');
  
  // Modal
  mostrarModal = false;
  modoEdicion = false;
  usuarioSeleccionado: Usuario | null = null;
  
  usuarioForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl(''),
    contrasena: new FormControl(''),
    id_rol: new FormControl<number | null>(null, [Validators.required]),
    activo: new FormControl(true)
  });

  constructor(
    private usuariosService: UsuariosService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Debounce en búsqueda
    this.busqueda.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.paginaActual = 1;
      this.cargarUsuarios();
    });

    // Debounce en filtro de rol
    this.rolFiltro.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.paginaActual = 1;
      this.cargarUsuarios();
    });

    this.cargarUsuarios();
    this.cargarRoles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = '';
    
    this.usuariosService.listar({
      q: this.busqueda.value || '',
      rol: this.rolFiltro.value || '',
      page: this.paginaActual,
      limit: this.limite
    }).subscribe({
      next: (response) => {
        this.usuarios = response.usuarios;
        this.total = response.pagination.total;
        this.totalPaginas = response.pagination.totalPages;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  cargarRoles() {
    this.usuariosService.listarRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
      }
    });
  }

  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
    this.cargarUsuarios();
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.usuarioForm.reset({ activo: true });
    this.usuarioForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario) {
    this.modoEdicion = true;
    this.usuarioSeleccionado = usuario;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || '',
      id_rol: usuario.id_rol,
      activo: usuario.activo
    });
    this.usuarioForm.get('contrasena')?.clearValidators();
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioForm.reset();
  }

  async guardarUsuario() {
    if (this.usuarioForm.invalid) {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos requeridos',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    const formValue = this.usuarioForm.value;

    if (this.modoEdicion && this.usuarioSeleccionado) {
      const dto: ActualizarUsuarioDto = {
        nombre: formValue.nombre!,
        email: formValue.email!,
        telefono: formValue.telefono || undefined,
        activo: formValue.activo!
      };

      this.usuariosService.actualizar(this.usuarioSeleccionado.id_usuario, dto).subscribe({
        next: async (response) => {
          // Actualizar rol si cambió
          if (formValue.id_rol !== this.usuarioSeleccionado!.id_rol) {
            this.usuariosService.cambiarRol(this.usuarioSeleccionado!.id_usuario, formValue.id_rol!).subscribe({
              next: async () => {
                this.cerrarModal();
                this.cargarUsuarios();
                const toast = await this.toastCtrl.create({
                  message: 'Usuario actualizado correctamente',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                toast.present();
              },
              error: async (err) => {
                const errorMsg = err.error?.mensaje || 'Error al cambiar rol';
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
            this.cerrarModal();
            this.cargarUsuarios();
            const toast = await this.toastCtrl.create({
              message: 'Usuario actualizado correctamente',
              duration: 2000,
              color: 'success',
              position: 'bottom'
            });
            toast.present();
          }
        },
        error: async (err) => {
          const errorMsg = err.error?.mensaje || 'Error al actualizar usuario';
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
      const dto: CrearUsuarioDto = {
        nombre: formValue.nombre!,
        email: formValue.email!,
        telefono: formValue.telefono || undefined,
        contrasena: formValue.contrasena!,
        id_rol: formValue.id_rol!
      };

      this.usuariosService.crear(dto).subscribe({
        next: async (response) => {
          this.cerrarModal();
          this.cargarUsuarios();
          const toast = await this.toastCtrl.create({
            message: 'Usuario creado correctamente',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          toast.present();
        },
        error: async (err) => {
          const errorMsg = err.error?.mensaje || 'Error al crear usuario';
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

  async confirmarEliminar(usuario: Usuario) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Estás seguro de eliminar al usuario ${usuario.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.usuariosService.eliminar(usuario.id_usuario).subscribe({
              next: async (response) => {
                this.cargarUsuarios();
                const toast = await this.toastCtrl.create({
                  message: 'Usuario eliminado correctamente',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                toast.present();
              },
              error: async (err) => {
                const errorMsg = err.error?.mensaje || 'Error al eliminar usuario';
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

  trackById(index: number, item: Usuario): number {
    return item.id_usuario;
  }

  getRolColor(rol: string): string {
    const colores: { [key: string]: string } = {
      'admin': 'danger',
      'editor': 'warning',
      'visualizador': 'primary',
      'usuario': 'medium'
    };
    return colores[rol.toLowerCase()] || 'medium';
  }
}
