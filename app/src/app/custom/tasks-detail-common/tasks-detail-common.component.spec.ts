import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksDetailCommonComponent } from './tasks-detail-common.component';

describe('TasksDetailCommonComponent', () => {
  let component: TasksDetailCommonComponent;
  let fixture: ComponentFixture<TasksDetailCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasksDetailCommonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksDetailCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
