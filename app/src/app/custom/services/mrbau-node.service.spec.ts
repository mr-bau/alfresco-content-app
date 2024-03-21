import { TestBed } from '@angular/core/testing';

import { MrbauNodeService } from './mrbau-node.service';

describe('MrbauNodeService', () => {
  let service: MrbauNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
