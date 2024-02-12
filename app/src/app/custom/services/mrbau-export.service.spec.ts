import { TestBed } from '@angular/core/testing';

import { MrbauExportService } from './mrbau-export.service';

describe('MrbauExportService', () => {
  let service: MrbauExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
