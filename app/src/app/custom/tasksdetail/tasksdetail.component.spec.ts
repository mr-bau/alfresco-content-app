import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksdetailComponent } from './tasksdetail.component';

describe('TasksdetailComponent', () => {
  let component: TasksdetailComponent;
  let fixture: ComponentFixture<TasksdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasksdetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
