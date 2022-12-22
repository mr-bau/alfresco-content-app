import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitpaneComponent } from './splitpane.component';

describe('SplitpaneComponent', () => {
  let component: SplitpaneComponent;
  let fixture: ComponentFixture<SplitpaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitpaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitpaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
