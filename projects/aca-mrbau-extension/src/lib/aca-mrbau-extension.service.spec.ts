import { TestBed } from '@angular/core/testing';

import { AcaMrbauExtensionService } from './aca-mrbau-extension.service';

describe('AcaMrbauExtensionService', () => {
  let service: AcaMrbauExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcaMrbauExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
