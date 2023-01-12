import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauExtensionTasksComponent } from './mrbau-extension-tasks.component';

describe('MrbauExtensionTasksComponent', () => {
  let component: MrbauExtensionTasksComponent;
  let fixture: ComponentFixture<MrbauExtensionTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauExtensionTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauExtensionTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
