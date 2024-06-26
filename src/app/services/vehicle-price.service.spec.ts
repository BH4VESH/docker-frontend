import { TestBed } from '@angular/core/testing';

import { VehiclePriceService } from './vehicle-price.service';

describe('VehiclePriceService', () => {
  let service: VehiclePriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiclePriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
