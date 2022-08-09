import { TestBed } from '@angular/core/testing';

import { MrbauWorkflowService } from './mrbau-workflow.service';

describe('MrbauWorkflowService', () => {
  let service: MrbauWorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrbauWorkflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
