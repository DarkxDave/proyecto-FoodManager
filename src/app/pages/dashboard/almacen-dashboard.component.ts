import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlmacenesService } from 'src/app/shared/services/almacenes.service';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-almacen-dashboard',
  templateUrl: './almacen-dashboard.component.html',
  styleUrls: ['./almacen-dashboard.component.scss'],
  standalone: false
})
export class AlmacenDashboardComponent implements OnChanges {
  @Input() almacenId: number | null = null;
  loading = false;
  data: any = null;
  error: string | null = null;
  private sub?: Subscription;

  constructor(private svc: AlmacenesService) {}

  ngOnChanges(ch: SimpleChanges) {
    if (ch['almacenId']) {
      this.iniciarStream();
    }
  }

  iniciarStream() {
    this.sub?.unsubscribe();
    if (!this.almacenId) return;
    this.loading = true;
    // Primer fetch y luego stream SSE
    this.sub = this.svc.metrics(this.almacenId).pipe(
      switchMap(initial => {
        this.data = initial; this.loading = false; this.error = null;
        return this.svc.sse(this.almacenId!);
      })
    ).subscribe({
      next: d => { this.data = d; },
      error: e => { this.error = 'Stream interrumpido'; this.loading = false; }
    });
  }
}
