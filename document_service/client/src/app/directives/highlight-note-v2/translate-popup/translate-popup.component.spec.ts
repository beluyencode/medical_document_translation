import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatePopupComponent } from './translate-popup.component';

describe('TranslatePopupComponent', () => {
  let component: TranslatePopupComponent;
  let fixture: ComponentFixture<TranslatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranslatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
