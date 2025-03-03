import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { TranslatePopupService } from './translate-popup.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-translate-popup',
  templateUrl: './translate-popup.component.html',
  styleUrls: ['./translate-popup.component.scss']
})
export class TranslatePopupComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('translate_div') eleTranslate: ElementRef;
  id: string;
  text: string | any;
  disableBtnSpeak = false;
  indexTab: number = 0;
  speaking: SpeechSynthesisUtterance;
  positionFixed = {
    x: 0,
    y: 0,
  };
  listTabConst = [
    'Anh - Việt',
    'Anh - Anh',
    'Ngữ pháp',
    'Đồng nghĩa'
  ];
  listTab: any = [];
  translate: string;
  subject: Subscription;
  tratu: string;
  sentences: any;
  tab: string;
  constructor(
    private translateService: TranslatePopupService,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit(): void {
    // var mutationObserver = new MutationObserver(function (mutations) {
    //   mutations.forEach(function (mutation) {
    //     console.log(mutation);
    //   });
    // });
    // mutationObserver.observe(this.eleTranslate.nativeElement, {
    //   attributes: true,
    //   characterData: true,
    //   childList: true,
    //   subtree: true,
    //   attributeOldValue: true,
    //   characterDataOldValue: true
    // })
  }

  load(event: any) {
    console.log(event);

  }

  ngOnDestroy(): void {
    window.speechSynthesis.cancel();
    this.subject?.unsubscribe();
  }

  ngOnInit() {
    window.speechSynthesis.cancel();
    this.translateService.translate(this.text).subscribe({
      next: (res: any) => {
        if (res.sentences[0] && this.text.trim().split(' ').length <= 4) {
          this.sentences = res.sentences;
          this.listTab = [
            'Tra câu',
          ];
        }
        if (res.tratu[0]) {
          this.tratu = res.tratu[0].fields.fulltext.split('</script>')[1] ?? res.tratu[0].fields.fulltext;
          this.eleTranslate.nativeElement.innerHTML = this.tratu;
          this.listTab = [
            ...this.listTabConst.filter((ele: string) => this.tratu.includes(ele)),
            ...this.listTab
          ];
        }
        this.tab = this.listTab[0];
        if (!res.tratu[0]) {
          this.translateService.translateGoogle(this.text).subscribe((res: any) => {
            this.translate = '';
            res[0].forEach((element: any) => {
              this.translate += element[0]
            });
            this.listTab = [
              ...this.listTab,
              'Dịch'
            ];
            this.tab = this.listTab[0];
          })
        } else {
          this.removeNode();
          this.changeTab(this.tab);
        }
      },
      error: (error) => {
        this.translateService.translateGoogle(this.text).subscribe((res: any) => {
          this.translate = '';
          res[0].forEach((element: any) => {
            this.translate += element[0];
          });
          this.listTab = [
            ...this.listTab,
            'Dịch'
          ];
          this.tab = this.listTab[0];
        })
      }
    })
  }

  removeNode() {
    if (this.tratu) {
      const arr: Array<any> = [];
      (this.eleTranslate.nativeElement as HTMLDivElement).childNodes.forEach((ele: Node, index: number) => {
        if (!this.listTab.includes((ele as HTMLElement).getAttribute('data-tab-name') ?? "")) {
          arr.push(ele)
        }
      });
      arr.forEach((ele: Node) => {
        (ele as HTMLElement).remove();
      });
    }
  }

  changeTab(tab: string) {
    this.tab = tab;
    if (this.tratu) {
      (this.eleTranslate.nativeElement as HTMLDivElement).childNodes.forEach((ele: Node) => {
        if ((ele as HTMLElement).getAttribute('data-tab-name') !== this.tab) {
          this.renderer.setStyle(ele, 'display', 'none');
        } else {
          this.renderer.setStyle(ele, 'display', 'block');
        }
      });
    }
  }

  close() { }

  speak() {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(this.text);
    msg.voice = window.speechSynthesis.getVoices()[4];
    speechSynthesis.speak(msg);
  }
}
