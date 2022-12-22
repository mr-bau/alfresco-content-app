import { TestBed } from '@angular/core/testing';

import { MrbauActionService } from './mrbau-action.service';

describe('MrbauActionService', () => {
  let service: MrbauActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
