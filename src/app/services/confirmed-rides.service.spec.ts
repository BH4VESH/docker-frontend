import { TestBed } from '@angular/core/testing';

import { ConfirmedRidesService } from './confirmed-rides.service';

describe('ConfirmedRidesService', () => {
  let service: ConfirmedRidesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmedRidesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
