import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BelegsammlungComponent } from './belegsammlung.component';

describe('BelegsammlungComponent', () => {
  let component: BelegsammlungComponent;
  let fixture: ComponentFixture<BelegsammlungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BelegsammlungComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BelegsammlungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
