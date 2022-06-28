import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskVersionlistComponent } from './task-versionlist.component';

describe('TaskVersionlistComponent', () => {
  let component: TaskVersionlistComponent;
  let fixture: ComponentFixture<TaskVersionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskVersionlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskVersionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
