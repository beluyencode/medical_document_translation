import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateViewComponent } from './create-template-view.component';

describe('CreateTemplateViewComponent', () => {
  let component: CreateTemplateViewComponent;
  let fixture: ComponentFixture<CreateTemplateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTemplateViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTemplateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
