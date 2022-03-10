import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcaMrbauExtensionComponent } from './aca-mrbau-extension.component';

describe('AcaMrbauExtensionComponent', () => {
  let component: AcaMrbauExtensionComponent;
  let fixture: ComponentFixture<AcaMrbauExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcaMrbauExtensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcaMrbauExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
