import { TestBed } from '@angular/core/testing';

import { MrbauExtensionService } from './mrbau-extension.service';

describe('MrbauExtensionService', () => {
  let service: MrbauExtensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauExtensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
