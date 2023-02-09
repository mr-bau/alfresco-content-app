import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocInboxBookComponent } from './doc-inbox-book.component';

describe('DocInboxBookComponent', () => {
  let component: DocInboxBookComponent;
  let fixture: ComponentFixture<DocInboxBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocInboxBookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocInboxBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
