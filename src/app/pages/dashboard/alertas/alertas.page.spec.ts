import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertasPage } from './alertas.page';

describe('AlertasPage', () => {
  let component: AlertasPage;
  let fixture: ComponentFixture<AlertasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertasPage]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
