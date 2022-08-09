import { TestBed } from '@angular/core/testing';

import { MrbauArchiveModelService } from '../mrbau-archive-model.service';

describe('MrbauArchiveModelService', () => {
  let service: MrbauArchiveModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauArchiveModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
