import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmedRidesComponent } from './confirmed-rides.component';

describe('ConfirmedRidesComponent', () => {
  let component: ConfirmedRidesComponent;
  let fixture: ComponentFixture<ConfirmedRidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmedRidesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmedRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
