import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { TranslatePopupComponent } from './translate-popup/translate-popup.component';


@Directive({
  selector: '[appHighlightNoteV2]'
})

//
// Để sửa dụng phải đặt id cho element sử dụng directive này
//

export class HighlightNoteV2Directive implements OnInit {
  @Input() placeHolder = 'Comment...';

  //element
  divContentHTMl: HTMLDivElement;
  divContentMenu: HTMLDivElement;
  divNoteTextarea: HTMLDivElement;
  Textarea: ElementRef;
  BtnHighlight: ElementRef;
  BtnHighlightPink: ElementRef;
  BtnHighlightGreen: ElementRef;
  BtnNote: ElementRef;
  BtnClean: ElementRef;
  BtnCleanAll: ElementRef;
  BtnTranslate: HTMLElement;

  // id element
  idContentHtml: string;
  idContentMenu: string;
  idNoteTextarea: string;
  idTextarea: string;
  idBtnHighlight: string;
  idBtnHighlightPink: string;
  idBtnHighlightGreen: string;
  idDivTranslate: string;
  idNote: string;
  idClean: string;
  idCleanALl: string;
  idBtnTranslate: string

  // Array id note and highlight
  arrIdSpecialVersion: Array<any>;
  multiIdSpecial: Array<string> = [];

  //position 
  position = {
    start: 0,
    end: 0
  };
  positionFixed = {
    x: 0,
    y: 0,
    id: ''
  };

  // event create menu when right click
  @HostListener('contextmenu', ['$event']) contextmenu(event: any) {
    event.preventDefault();
    this.openMenu(event);
  }

  // check element is in range
  checkEleInRange(selection: Selection) {
    let booleanValue = false;
    this.arrIdSpecialVersion.forEach((item) => {
      item.id.forEach((id: string) => {
        const ele = document.getElementById(id);
        if (ele) {
          if (selection.containsNode(ele, true)) {
            booleanValue = true;
          }
        }
      });
    });
    return booleanValue;
  }

  // Event when after selection
  @HostListener('mousedown', ['$event']) mousedown(event: MouseEvent) {
    const translate = document.getElementById(this.idDivTranslate);
    if (translate) {
      if (!translate.contains((event.target as Node))) {
        this.viewContainerRef.clear();
      }
    }
    this.positionFixed.x = event.clientX;
    this.positionFixed.y = event.clientY;
  }

  // Event when after selection
  @HostListener('mouseup', ['$event']) mouseup(event: MouseEvent) {
    if ((event?.target as HTMLElement).id !== this.idContentMenu) {
      this.render.setStyle(this.divContentMenu, 'display', 'none');
    }
    if ((event?.target as HTMLElement).id !== this.idTextarea) {
      this.render.setStyle(this.divNoteTextarea, 'display', 'none');
      this.positionFixed.id = (event?.target as HTMLElement).id;
    }
    const range = document.getSelection();
    if (range?.toString() !== '') {
      if (this.positionFixed.y > event.clientY) {
        this.positionFixed.x = event.clientX;
        this.positionFixed.y = event.clientY;
      }
      if (!this.checkIsClickContextMenuBtn(event)) {
        setTimeout(() => {
          this.openMenu(event);
        })
      }
    }
  }

  // Event when click anywhere
  @HostListener('window:click', ['$event']) documentCLick(event: MouseEvent) {
    if (document.getSelection()?.toString() === '') {

      if ((event.target as HTMLElement).parentElement?.id !== this.idContentMenu) {
        this.render.setStyle(this.divContentMenu, 'display', 'none');
      }
      if (!this.checkIsClickContextMenuBtn(event)) {
        if ((event.target as HTMLElement).id !== this.idTextarea) {
          this.positionFixed.id = (event.target as HTMLElement).id;
        }
        if ((event.target as HTMLElement).parentElement) {
          if ((event.target as HTMLElement).parentElement?.id !== this.idNoteTextarea && !this.includeArrIdSpecial((event.target as HTMLElement).id).isInclude) {
            this.render.setStyle(this.divNoteTextarea, 'display', 'none');
          }
        }
      }
      const notePosition = this.includeArrIdSpecial((event.target as HTMLElement).id);
      if (notePosition.isInclude && this.arrIdSpecialVersion[notePosition.index].note) {
        event.preventDefault();
        this.render.setStyle(this.divNoteTextarea, 'left', ((this.positionFixed.x + 200 > window.innerWidth) ? this.positionFixed.x - 200 : this.positionFixed.x) + 'px');
        this.render.setStyle(this.divNoteTextarea, 'top', this.positionFixed.y + 'px');
        this.render.setStyle(this.divNoteTextarea, 'display', 'block');
        this.render.setProperty(this.Textarea, 'value', this.arrIdSpecialVersion[notePosition.index].comment);
        this.render.selectRootElement(this.Textarea).focus();
      }
    }
  }

  constructor(private ele: ElementRef, private render: Renderer2, private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
    this.arrIdSpecialVersion = [];
    this.idContentMenu = this.ele.nativeElement.id + 'contentMenu';
    this.idBtnHighlight = this.ele.nativeElement.id + 'highlight';
    this.idBtnHighlightPink = this.ele.nativeElement.id + 'highlight_pink';
    this.idBtnHighlightGreen = this.ele.nativeElement.id + 'highlight_green';
    this.idNote = this.ele.nativeElement.id + 'note';
    this.idClean = this.ele.nativeElement.id + 'clean';
    this.idNoteTextarea = this.ele.nativeElement.id + 'noteTextarea';
    this.idTextarea = this.ele.nativeElement.id + 'textarea';
    this.idCleanALl = this.ele.nativeElement.id + 'cleanALl';
    this.idBtnTranslate = this.ele.nativeElement.id + 'translate';
    this.idDivTranslate = this.ele.nativeElement.id + 'translate_div'
    this.render.appendChild(this.ele.nativeElement, this.createViewContextMenu());
    this.render.appendChild(this.ele.nativeElement, this.createViewNote());
    this.render.listen(window, 'scroll', () => {
      this.render.setStyle(this.divContentMenu, 'display', 'none');
      this.render.setStyle(this.divNoteTextarea, 'display', 'none');
      this.viewContainerRef.clear();
    });
  }

  openMenu(event: MouseEvent) {
    if ((event.target as HTMLElement)?.parentElement?.id === this.idContentMenu || (event.target as HTMLElement).parentElement?.id === this.idNoteTextarea) {
      return;
    } else {
      const getSelection = document.getSelection()!;
      if (getSelection.rangeCount > 0) {
        const getRangeAt = getSelection?.getRangeAt(0);
        this.render.setStyle(this.divContentMenu, 'left', ((this.positionFixed.x + 335 > window.innerWidth) ? this.positionFixed.x - 334 : this.positionFixed.x) + 'px');
        this.render.setStyle(this.divContentMenu, 'top', ((this.positionFixed.y - 50 > 0) ? (this.positionFixed.y - 50) : this.positionFixed.y) + 'px');
        this.render.setStyle(this.divContentMenu, 'display', 'none');
        this.render.setStyle(this.divNoteTextarea, 'display', 'none');
        this.viewContainerRef.clear();
        if (getRangeAt.toString() === ''
          || getRangeAt!.commonAncestorContainer!.parentElement!.id === ''
          || getRangeAt!.commonAncestorContainer!.parentElement!.id === this.ele.nativeElement.id
          || this.ele.nativeElement.contains(getRangeAt.commonAncestorContainer)) {
          if (getRangeAt.toString().trim() !== '' && !this.checkEleInRange(getSelection)) {
            this.render.setProperty(this.BtnHighlight, 'disabled', false);
            this.render.setProperty(this.BtnNote, 'disabled', false);
            this.render.setProperty(this.BtnHighlightPink, 'disabled', false);
            this.render.setProperty(this.BtnHighlightGreen, 'disabled', false);
            this.render.setProperty(this.BtnTranslate, 'disabled', false);
            this.position.start = getRangeAt.startOffset;
            this.position.end = getRangeAt.endOffset;
          } else {
            this.render.setProperty(this.BtnHighlight, 'disabled', true);
            this.render.setProperty(this.BtnHighlightPink, 'disabled', true);
            this.render.setProperty(this.BtnHighlightGreen, 'disabled', true);
            this.render.setProperty(this.BtnNote, 'disabled', true);
            this.render.setProperty(this.BtnTranslate, 'disabled', true);
          }
        } else {
          this.render.setProperty(this.BtnHighlight, 'disabled', false);
          this.render.setProperty(this.BtnHighlightPink, 'disabled', false);
          this.render.setProperty(this.BtnHighlightGreen, 'disabled', false);
          this.render.setProperty(this.BtnNote, 'disabled', false);
          this.render.setProperty(this.BtnTranslate, 'disabled', false);
          this.position.start = getSelection.anchorOffset;
          this.position.end = getSelection.focusOffset;
          this.positionFixed.id = (event.target as HTMLElement).id;
        }
        this.render.setStyle(this.divContentMenu, 'display', 'flex');
      }
    }
  }

  // Generate id for element
  ObjectId(m = Math, d = Date, h = 16, s = (sELe: any) => m.floor(sELe).toString(h)) {
    return s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
  }

  // Create text area note
  createViewNote() {
    this.divNoteTextarea = this.render.createElement('div');
    this.render.setAttribute(this.divNoteTextarea, 'id', this.idNoteTextarea);
    this.render.addClass(this.divNoteTextarea, 'popupNote');
    this.Textarea = this.render.createElement('textarea');
    this.render.setAttribute(this.Textarea, 'id', this.idTextarea);
    this.render.setAttribute(this.Textarea, 'rows', '4');
    this.render.setAttribute(this.Textarea, 'cols', '30');
    this.render.setAttribute(this.Textarea, 'placeholder', this.placeHolder);
    this.render.listen(this.Textarea, 'keyup', (event) => {
      this.keyUpOnTextarea(event);
    });
    this.render.appendChild(this.divNoteTextarea, this.Textarea);
    return this.divNoteTextarea;
  }

  // onChange in text area
  keyUpOnTextarea(event: any) {
    const noteIndex = this.includeArrIdSpecial(this.positionFixed.id);
    if (noteIndex.isInclude && this.arrIdSpecialVersion[noteIndex.index].note) {
      this.arrIdSpecialVersion[noteIndex.index].comment = event.target.value;
    }
  }

  // Create menu
  createViewContextMenu() {
    this.divContentMenu = this.render.createElement('div');
    this.render.setAttribute(this.divContentMenu, 'id', this.idContentMenu);
    this.render.addClass(this.divContentMenu, 'noselect');

    //create btn hightlight yellow
    this.BtnHighlight = this.render.createElement('button');
    this.render.setAttribute(this.BtnHighlight, 'id', this.idBtnHighlight);
    this.render.listen(this.BtnHighlight, 'click', () => {
      this.highlight(false);
    });
    const btnHighlightIcon = this.render.createElement('img');
    this.render.setAttribute(btnHighlightIcon, 'src', './assets/highlight-note/Highlighter.svg');
    this.render.appendChild(this.BtnHighlight, btnHighlightIcon);

    //create btn hightlight pink
    this.BtnHighlightPink = this.render.createElement('button');
    this.render.setAttribute(this.BtnHighlightPink, 'id', this.idBtnHighlightPink);
    this.render.listen(this.BtnHighlightPink, 'click', () => {
      this.highlight(false, 'highLightText-pink');
    });
    const btnHighlightIconPink = this.render.createElement('img');
    this.render.setAttribute(btnHighlightIconPink, 'src', './assets/highlight-note/Highlighter_pink.svg');
    this.render.appendChild(this.BtnHighlightPink, btnHighlightIconPink);

    //create btn hightlight green
    this.BtnHighlightGreen = this.render.createElement('button');
    this.render.setAttribute(this.BtnHighlightGreen, 'id', this.idBtnHighlightGreen);
    this.render.listen(this.BtnHighlightGreen, 'click', () => {
      this.highlight(false, 'highLightText-green');
    });
    const btnHighlightIconGreen = this.render.createElement('img');
    this.render.setAttribute(btnHighlightIconGreen, 'src', './assets/highlight-note/Highlighter_green.svg');
    this.render.appendChild(this.BtnHighlightGreen, btnHighlightIconGreen);

    //create btn note
    this.BtnNote = this.render.createElement('button');
    this.render.setAttribute(this.BtnNote, 'id', this.idNote);
    this.render.listen(this.BtnNote, 'click', () => {
      this.note();
    });
    const btnNoteIcon = this.render.createElement('img');
    this.render.setAttribute(btnNoteIcon, 'src', './assets/highlight-note/Sticky note.svg');
    this.render.appendChild(this.BtnNote, btnNoteIcon);

    //create btn clean
    this.BtnClean = this.render.createElement('button');
    this.render.setAttribute(this.BtnClean, 'id', this.idClean);
    this.render.listen(this.BtnClean, 'click', (event: MouseEvent) => {
      this.clean(event);
    });
    const btnCleanIcon = this.render.createElement('img');
    this.render.setAttribute(btnCleanIcon, 'src', './assets/highlight-note/Eraser.svg');
    this.render.appendChild(this.BtnClean, btnCleanIcon);

    //create btn clean all
    this.BtnCleanAll = this.render.createElement('button');
    this.render.setAttribute(this.BtnCleanAll, 'id', this.idCleanALl);
    this.render.listen(this.BtnCleanAll, 'click', () => {
      this.cleanAll();
    });
    const btnCleanAllIcon = this.render.createElement('img');
    this.render.setAttribute(btnCleanAllIcon, 'src', './assets/highlight-note/Bin.svg');
    this.render.appendChild(this.BtnCleanAll, btnCleanAllIcon);

    //create btn translate
    this.BtnTranslate = this.render.createElement('button');
    this.render.setAttribute(this.BtnTranslate, 'id', this.idBtnTranslate);
    this.render.listen(this.BtnTranslate, 'click', () => {
      this.translate();
    });
    const btnTranslateIcon = this.render.createElement('img');
    this.render.setAttribute(btnTranslateIcon, 'src', './assets/highlight-note/Language.svg');
    this.render.appendChild(this.BtnTranslate, btnTranslateIcon);

    //add class
    this.render.addClass(this.divContentMenu, 'popupOnRightClick');
    this.render.addClass(this.BtnHighlight, 'buttonFirst');
    this.render.addClass(this.BtnTranslate, 'buttonEnd');

    //append child
    this.render.appendChild(this.divContentMenu, this.BtnHighlight);
    this.render.appendChild(this.divContentMenu, this.BtnHighlightPink);
    this.render.appendChild(this.divContentMenu, this.BtnHighlightGreen);
    this.render.appendChild(this.divContentMenu, this.BtnNote);
    this.render.appendChild(this.divContentMenu, this.BtnClean);
    // this.render.appendChild(this.divContentMenu, this.BtnCleanAll);
    this.render.appendChild(this.divContentMenu, this.BtnTranslate);

    return this.divContentMenu;
  }

  checkIsClickContextMenuBtn(event: MouseEvent) {
    const boolean = [this.idBtnHighlight, this.idClean, this.idCleanALl, this.idNote, this.idBtnTranslate].some((ele: string) => {
      return ele === (event.target as HTMLElement).id || ele === (event.target as HTMLElement).parentElement?.id
    });
    return boolean
  }

  highlight(highlightNote?: boolean, className: string = 'highLightText') {
    const selection = document.getSelection()!;
    const range = selection.getRangeAt(0);
    if (selection.getRangeAt(0).commonAncestorContainer.constructor.name !== 'Text') {
      this.multiIdSpecial = [];
      const arrTextELe: any = [];
      const arrNode = Array.from(selection.getRangeAt(0).commonAncestorContainer.childNodes).filter(ele => selection.containsNode(ele, true));
      arrNode.forEach(ele => {
        this.recursiveFindChildELe(ele, arrTextELe, highlightNote);
      });
      arrTextELe.forEach((eleText: any, eleTextIndex: number) => {
        if (eleTextIndex === 0) {
          if (range.startContainer.constructor.name === 'Text') {
            eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className, range.startOffset, true));
          } else {
            if (arrTextELe.length === 1) {
              eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className));
            } else {
              range.startContainer.childNodes.forEach((ele, index) => {
                if (index > range.startOffset) {
                  if (ele.contains(eleText)) {
                    eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className));
                  }
                }
              });
            }
          }
        } else if (eleTextIndex === arrTextELe.length - 1) {
          if (range.endContainer.constructor.name === 'Text') {
            eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className, range.endOffset - 1, false));
          } else {
            if (range.endContainer.contains(eleText)) {
            } else {
              eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className));
            }
          }
        } else {
          eleText.replaceWith(this.createSpanHightLightWithStartOrEnd(eleText.textContent, highlightNote ?? false, className));
        }
      });
      this.arrIdSpecialVersion.push({ id: this.multiIdSpecial, note: highlightNote, comment: '' });
    } else {
      const newSpan = this.render.createElement('span');
      const id = this.ObjectId();
      this.arrIdSpecialVersion.push({ id: [id], note: highlightNote, comment: '' });
      if (highlightNote) {
        this.render.addClass(newSpan, 'noteText');
      } else {
        this.render.addClass(newSpan, className);
      }
      this.render.setAttribute(newSpan, 'id', id);
      selection.getRangeAt(0).surroundContents(newSpan);
    }
    document.getSelection()!.empty();
    this.render.setStyle(this.divContentMenu, 'display', 'none');
    this.viewContainerRef.clear();
  }

  // startOrEnd : true tính vị trí từ điểm position tới cuối / false tính vị trí từ điểm đàu tiên đến posiotion / undefined lấy all
  createSpanHightLightWithStartOrEnd(contentText: string, highlightNote: boolean, className: string, position?: number, startOrEnd?: boolean) {
    const newEle = this.render.createElement('tag-no-name');
    const arrContent = contentText.split('');
    let classCSS = className;
    if (highlightNote) {
      classCSS = 'noteText';
    }
    let newContent = '';
    const id = this.ObjectId();
    this.multiIdSpecial.push(id);
    if (startOrEnd && position !== undefined) {
      arrContent.forEach((ele, index) => {
        if (index === position) {
          newContent += `<span class="${classCSS}" id="${id}">`;
        }
        newContent += ele;
        if (index === arrContent.length - 1) {
          newContent += '</span>';
        }
      });
    } else if (startOrEnd === false && position !== undefined) {
      arrContent.forEach((ele, index) => {
        if (index === 0) {
          newContent += `<span class="${classCSS}"  id="${id}">`;
        }
        newContent += ele;
        if (index === position) {
          newContent += '</span>';
        }
      });
    } else {
      arrContent.forEach((ele, index) => {
        if (index === 0) {
          newContent += `<span class="${classCSS}"  id="${id}">`;
        }
        newContent += ele;
        if (index === arrContent.length - 1) {
          newContent += '</span>';
        }
      });
    }
    this.render.setProperty(newEle, 'innerHTML', newContent);
    return newEle;

  }

  recursiveFindChildELe(node: any, arr: Array<any>, highlightNote?: boolean) {
    const selection = document.getSelection();
    const parentGeneralConditions = node.constructor.name === 'Text' && node.textContent.trim().length > 0;
    if (parentGeneralConditions && selection!.containsNode(node, true)) {
      arr.push(node);
      return;
    } else if (node.childNodes.length > 0) {
      node.childNodes.forEach((eleChild: any) => {
        const generalConditions = eleChild.constructor.name === 'Text' && eleChild.textContent.trim().length > 0;
        if (generalConditions && selection!.containsNode(eleChild, true)) {
          arr.push(eleChild);
        } else {
          this.recursiveFindChildELe(eleChild, arr, highlightNote);
        }
      });
      return;
    } else {
      return;
    }
  }

  note() {
    this.render.setStyle(this.divContentMenu, 'display', 'none');
    this.render.setProperty(this.Textarea, 'value', '');
    this.render.setStyle(this.divNoteTextarea, 'left', this.divContentMenu['style'].left);
    this.render.setStyle(this.divNoteTextarea, 'top', +this.divContentMenu['style'].top.split('px')[0] - 40 + 'px');
    this.render.setStyle(this.divNoteTextarea, 'display', 'block');
    this.highlight(true);
    this.render.selectRootElement(this.Textarea).focus();
    this.positionFixed.id = this.arrIdSpecialVersion[this.arrIdSpecialVersion.length - 1].id[0];
  }

  clean(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation();
    const selection = document.getSelection()!.getRangeAt(0) as any;
    const includeArrId = this.includeArrIdSpecial(selection!.commonAncestorContainer?.parentElement?.id);
    if (includeArrId.isInclude) {
      if (this.arrIdSpecialVersion.length !== 1) {
        this.arrIdSpecialVersion[includeArrId.index].id.forEach((ele: any) => {
          const elementHtml = document.getElementById(ele);
          if (elementHtml) {
            elementHtml.outerHTML = elementHtml.outerText;
          }
        });
        this.arrIdSpecialVersion.splice(includeArrId.index, 1);
      } else {
        this.cleanAll();
      }
    }
    this.render.setStyle(this.divContentMenu, 'display', 'none');
  }

  includeArrIdSpecial(id: string) {
    let booleanValue = false;
    let position = -1;
    this.arrIdSpecialVersion.forEach((ele, index) => {
      ele.id.forEach((eleChild: any) => {
        if (id === eleChild) {
          booleanValue = true;
          position = index;
        }
      });
    });
    return { isInclude: booleanValue, index: position };
  }

  cleanAll() {
    this.render.setStyle(this.divContentMenu, 'display', 'none');
    this.arrIdSpecialVersion.forEach(item => {
      item.id.forEach((id: string) => {
        const ele = document.getElementById(id);
        if (ele) {
          ele.outerHTML = ele.outerText;
        }
      });
    });
    const arrTagNoName = document.getElementsByTagName('TAG-NO-NAME') as any;
    [...arrTagNoName].forEach(ele => {
      ele.outerHTML = ele.textContent;
    });
    document.getSelection()?.removeAllRanges();
    this.arrIdSpecialVersion = [];
  }

  translate() {
    const selection = document.getSelection()
    if (selection) {
      this.viewContainerRef.clear();
      const componentRef = this.viewContainerRef.createComponent(TranslatePopupComponent);
      componentRef.instance.id = this.idDivTranslate;
      componentRef.instance.text = selection.toString();
      componentRef.instance.positionFixed = {
        x: this.positionFixed.x - 380,
        y: this.positionFixed.y + 35 + 450 > window.innerHeight ? (this.positionFixed.y - 450 < 0 ? 0 : this.positionFixed.y - 450) : this.positionFixed.y + 35
      }
      componentRef.instance.close = () => {
        this.viewContainerRef.clear();
      }
    }
  }

}


