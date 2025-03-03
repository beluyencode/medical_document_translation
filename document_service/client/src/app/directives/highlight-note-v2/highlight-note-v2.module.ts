import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { TranslatePopupComponent } from './translate-popup/translate-popup.component';
import { TranslatePopupService } from './translate-popup/translate-popup.service';
import { HighlightNoteV2Directive } from './highlight-note-v2.directive';



@NgModule({
  declarations: [
    HighlightNoteV2Directive,
    TranslatePopupComponent,
    SanitizeHtmlPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    HighlightNoteV2Directive
  ],
  providers: [
    TranslatePopupService
  ]
})
export class HighlightNoteV2Module { }
