import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateViewEleComponent } from './create-template-view-ele.component';

describe('CreateTemplateViewEleComponent', () => {
  let component: CreateTemplateViewEleComponent;
  let fixture: ComponentFixture<CreateTemplateViewEleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTemplateViewEleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTemplateViewEleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
