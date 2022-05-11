import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauNewTaskDialogComponent } from './mrbau-new-task-dialog.component';

describe('MrbauNewTaskDialogComponent', () => {
  let component: MrbauNewTaskDialogComponent;
  let fixture: ComponentFixture<MrbauNewTaskDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauNewTaskDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauNewTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
