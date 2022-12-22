import { TestBed } from '@angular/core/testing';

import { MrbauConventionsService } from './mrbau-conventions.service';

describe('MrbauServiceService', () => {
  let service: MrbauConventionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauConventionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
