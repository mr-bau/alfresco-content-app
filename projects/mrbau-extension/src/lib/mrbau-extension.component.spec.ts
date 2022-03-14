import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauExtensionComponent } from './mrbau-extension.component';

describe('MrbauExtensionComponent', () => {
  let component: MrbauExtensionComponent;
  let fixture: ComponentFixture<MrbauExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauExtensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
