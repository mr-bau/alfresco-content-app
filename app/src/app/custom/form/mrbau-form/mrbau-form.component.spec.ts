import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauFormComponent } from './mrbau-form.component';

describe('MrbauFormComponent', () => {
  let component: MrbauFormComponent;
  let fixture: ComponentFixture<MrbauFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
