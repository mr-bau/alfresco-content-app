import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksTableComponent } from './taskstable.component';

describe('TaskstableComponent', () => {
  let component: TasksTableComponent;
  let fixture: ComponentFixture<TasksTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasksTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});