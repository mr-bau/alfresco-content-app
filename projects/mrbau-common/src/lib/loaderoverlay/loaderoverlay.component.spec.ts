// tslint:disable-next-line: adf-license-banner

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderoverlayComponent } from './loaderoverlay.component';

describe('LoaderoverlayComponent', () => {
  let component: LoaderoverlayComponent;
  let fixture: ComponentFixture<LoaderoverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoaderoverlayComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderoverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
