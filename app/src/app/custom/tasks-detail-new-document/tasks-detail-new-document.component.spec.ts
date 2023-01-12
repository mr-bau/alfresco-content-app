import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksDetailNewDocumentComponent } from './tasks-detail-new-document.component';

describe('TasksDetailNewDocumentComponent', () => {
  let component: TasksDetailNewDocumentComponent;
  let fixture: ComponentFixture<TasksDetailNewDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasksDetailNewDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksDetailNewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
