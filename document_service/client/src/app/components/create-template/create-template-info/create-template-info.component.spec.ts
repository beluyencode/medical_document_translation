import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateInfoComponent } from './create-template-info.component';

describe('CreateTemplateInfoComponent', () => {
  let component: CreateTemplateInfoComponent;
  let fixture: ComponentFixture<CreateTemplateInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTemplateInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTemplateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
