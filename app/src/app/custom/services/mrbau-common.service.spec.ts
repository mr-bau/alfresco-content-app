import { TestBed } from '@angular/core/testing';

import { MrbauCommonService } from './mrbau-common.service';

describe('MrbauCommonService', () => {
  let service: MrbauCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
