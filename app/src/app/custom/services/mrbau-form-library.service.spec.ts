import { TestBed } from '@angular/core/testing';

import { MrbauFormLibraryService } from './mrbau-form-library.service';

describe('MrbauFormLibraryService', () => {
  let service: MrbauFormLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauFormLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
