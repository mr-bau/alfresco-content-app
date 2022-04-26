import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabgroupComponent } from './tabgroup.component';

describe('TabgroupComponent', () => {
  let component: TabgroupComponent;
  let fixture: ComponentFixture<TabgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabgroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
