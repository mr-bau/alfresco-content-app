import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfpreviewComponent } from './pdfpreview.component';

describe('PdfpreviewComponent', () => {
  let component: PdfpreviewComponent;
  let fixture: ComponentFixture<PdfpreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfpreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfpreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
