import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSingleViewComponent } from './task-single-view.component';

describe('TaskSingleViewComponent', () => {
  let component: TaskSingleViewComponent;
  let fixture: ComponentFixture<TaskSingleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskSingleViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskSingleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
