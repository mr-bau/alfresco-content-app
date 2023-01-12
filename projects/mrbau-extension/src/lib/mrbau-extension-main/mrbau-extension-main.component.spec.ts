import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrbauExtensionMainComponent } from './mrbau-extension-main.component';

describe('MrbauExtensionMainComponent', () => {
  let component: MrbauExtensionMainComponent;
  let fixture: ComponentFixture<MrbauExtensionMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MrbauExtensionMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MrbauExtensionMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
