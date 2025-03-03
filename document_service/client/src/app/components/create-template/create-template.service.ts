import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BackgroundTemplate, Template, TypeAction, TypeTemplate } from './create-template';

@Injectable()
export class CreateTemplateService {
  //data
  background: BackgroundTemplate = new BackgroundTemplate();
  listElement: Template[] = []
  scaleDefault = 854;
  currentWidth = 0;
  currentHeight = 0;
  //event
  load_list_element;
  fullScreen;
  active_template;
  mouse_over_view;
  save_to_img;
  changeScaleScreen;

  constructor() {
    this.fullScreen = new BehaviorSubject<any>(false);
    this.active_template = new BehaviorSubject<any>(null);
    this.mouse_over_view = new BehaviorSubject<any>(false);
    this.save_to_img = new BehaviorSubject<any>(false);
    this.changeScaleScreen = new BehaviorSubject<any>(null);
    // this.listElement = [...Array(5)].map((ele: any, index: number) => {
    //   return new Template('element' + index);
    // });
    this.listElement = [
      new Template('element', 10),
      new Template('element 2', 60),
    ]
    this.load_list_element = new BehaviorSubject<any>(this.listElement);
  }

  ObjectId(m = Math, d = Date, h = 16, s = (sELe: any) => m.floor(sELe).toString(h)) {
    return s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
  }

  listen_full_screen() {
    return this.fullScreen.asObservable();
  }

  listen_active_template() {
    return this.active_template.asObservable();
  }

  listen_change_list_element() {
    return this.load_list_element.asObservable();
  }

  listen_save_to_img() {
    return this.save_to_img.asObservable();
  }

  listen_change_scale_screen() {
    return this.changeScaleScreen.asObservable();
  }

  changeTemplate(action: TypeAction, template: Template | BackgroundTemplate,) {
    console.log(template instanceof Template);

    if (template instanceof Template) {
      switch (action) {
        case TypeAction.COPY:
          const clone = template.clone();
          clone.id = this.ObjectId();
          clone.name = 'element ' + (this.listElement.length + 1);
          clone.content = 'element ' + (this.listElement.length + 1);
          this.listElement.push(clone);
          break;
        case TypeAction.CHANGE:
          this.listElement = this.listElement.map((ele: Template) => {
            if (ele.id === template.id) {
              return template
            }
            return ele;
          });
          break;
        case TypeAction.DELETE:
          this.listElement = this.listElement.filter((ele: Template) => ele.id !== template.id);
          this.load_list_element.next(this.listElement);
          this.active_template.next(null);
          break;
        default:
          break;
      }
    } else {
      if (template) {
        this.background = template
      }
    }
  }

  addTemplate() {
    this.listElement = [
      ...this.listElement,
      new Template('element ' + (this.listElement.length + 1), 70),
    ];
    this.load_list_element.next(this.listElement);
  }
}
