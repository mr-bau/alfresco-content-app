import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfbrowserComponent } from './pdfbrowser.component';

describe('PdfbrowserComponent', () => {
  let component: PdfbrowserComponent;
  let fixture: ComponentFixture<PdfbrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfbrowserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfbrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
