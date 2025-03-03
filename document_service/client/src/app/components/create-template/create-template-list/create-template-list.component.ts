import { Component, OnInit } from '@angular/core';
import { Template, TypeAction } from '../create-template';
import { CreateTemplateService } from '../create-template.service';

@Component({
  selector: 'app-create-template-list',
  templateUrl: './create-template-list.component.html',
  styleUrls: ['./create-template-list.component.scss']
})
export class CreateTemplateListComponent implements OnInit {
  listTemplate: Template[] = [];
  activeTemplate: Template | any;

  constructor(
    public createTemplateService: CreateTemplateService
  ) { }

  ngOnInit(): void {
    this.createTemplateService.listen_change_list_element().subscribe((res: Template[]) => {
      this.listTemplate = res;
    });
    this.createTemplateService.listen_active_template().subscribe((res: Template) => {
      this.activeTemplate = res;
    })
  }

  fullScreen(event: MouseEvent) {
    event.stopPropagation();
    this.createTemplateService.fullScreen.next(true);
  }

  changeActiveTemplate(template: Template | null) {
    if (template) {
      if (template.id !== this.activeTemplate?.id) {
        this.createTemplateService.active_template.next(template);
      }
    } else {
      this.createTemplateService.active_template.next(template);
    }
  }

  copyEle(template: Template) {
    this.createTemplateService.changeTemplate(TypeAction.COPY, template)
  }

  hidden(template: Template) {
    template.hidden = !template.hidden;
  }

  save() {
    console.log({
      background: this.createTemplateService.background,
      listElement: this.createTemplateService.listElement
    });
  }

  saveToImg() {
    this.createTemplateService.save_to_img.next(true);
  }

  deleteELe(ele: Template) {
    console.log(ele);

    this.createTemplateService.changeTemplate(TypeAction.DELETE, ele);
  }

  addEle() {
    this.createTemplateService.addTemplate();
  }

}
