import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateListComponent } from './create-template-list.component';

describe('CreateTemplateListComponent', () => {
  let component: CreateTemplateListComponent;
  let fixture: ComponentFixture<CreateTemplateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTemplateListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
