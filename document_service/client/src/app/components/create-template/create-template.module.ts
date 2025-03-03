import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTemplateComponent } from './create-template.component';
import { CreateTemplateInfoComponent } from './create-template-info/create-template-info.component';
import { CreateTemplateListComponent } from './create-template-list/create-template-list.component';
import { CreateTemplateService } from './create-template.service';
import { CreateTemplateViewComponent } from './create-template-view/create-template-view.component';
import { FormsModule } from '@angular/forms';
import { CreateTemplateViewEleComponent } from './create-template-view/create-template-view-ele/create-template-view-ele.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    CreateTemplateComponent,
    CreateTemplateInfoComponent,
    CreateTemplateListComponent,
    CreateTemplateViewComponent,
    CreateTemplateViewEleComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  exports: [
    CreateTemplateComponent
  ],
  providers: []
})
export class CreateTemplateModule { }
