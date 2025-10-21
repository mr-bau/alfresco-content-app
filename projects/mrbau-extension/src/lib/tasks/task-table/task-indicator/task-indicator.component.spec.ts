import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskIndicatorComponent } from './task-indicator.component';

describe('TaskIndicatorComponent', () => {
  let component: TaskIndicatorComponent;
  let fixture: ComponentFixture<TaskIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskIndicatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
