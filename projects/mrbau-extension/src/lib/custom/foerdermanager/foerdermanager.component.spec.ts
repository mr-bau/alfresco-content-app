// tslint:disable-next-line: adf-license-banner

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoerdermanagerComponent } from './foerdermanager.component';

describe('FoerdermanagerComponent', () => {
  let component: FoerdermanagerComponent;
  let fixture: ComponentFixture<FoerdermanagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FoerdermanagerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoerdermanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
