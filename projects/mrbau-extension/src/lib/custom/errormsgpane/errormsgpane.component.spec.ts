// tslint:disable-next-line: adf-license-banner

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrormsgpaneComponent } from './errormsgpane.component';

describe('ErrormsgpaneComponent', () => {
  let component: ErrormsgpaneComponent;
  let fixture: ComponentFixture<ErrormsgpaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrormsgpaneComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrormsgpaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
