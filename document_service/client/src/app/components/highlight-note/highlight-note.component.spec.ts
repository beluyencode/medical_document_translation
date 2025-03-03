import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightNoteComponent } from './highlight-note.component';

describe('HighlightNoteComponent', () => {
  let component: HighlightNoteComponent;
  let fixture: ComponentFixture<HighlightNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighlightNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighlightNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
