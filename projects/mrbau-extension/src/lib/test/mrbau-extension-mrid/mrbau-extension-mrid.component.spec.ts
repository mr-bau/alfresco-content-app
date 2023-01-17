import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauExtensionMridComponent } from './mrbau-extension-mrid.component';

describe('MrbauExtensionMridComponent', () => {
  let component: MrbauExtensionMridComponent;
  let fixture: ComponentFixture<MrbauExtensionMridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauExtensionMridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauExtensionMridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
