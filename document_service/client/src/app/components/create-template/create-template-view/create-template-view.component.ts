import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { BackgroundTemplate, Template, TypeScreen } from '../create-template';
import { CreateTemplateService } from '../create-template.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-create-template-view',
  templateUrl: './create-template-view.component.html',
  styleUrls: ['./create-template-view.component.scss']
})
export class CreateTemplateViewComponent implements OnInit, AfterViewInit {
  @Input() edit: boolean = true;
  @ViewChild('eleView') ele: ElementRef;
  @ViewChild('eleViewParent') eleParent: ElementRef;
  listTemplate: Template[];
  background: BackgroundTemplate;
  typeScreen = TypeScreen;
  scale: number;
  loading = false;

  constructor(
    public createTemplateService: CreateTemplateService,
    private renderer2: Renderer2
  ) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.changeScale();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.changeScale();
  }

  ngOnInit(): void {
    this.createTemplateService.listen_change_scale_screen().subscribe((res: any) => {
      if (res) {
        setTimeout(() => {
          this.changeScale();
        });
      }
    });
    this.createTemplateService.listen_change_list_element().subscribe((res: Template[]) => {
      if (res) {
        this.listTemplate = res;
      }
    });
    this.createTemplateService.listen_save_to_img().subscribe((res: boolean) => {
      this.edit = !res;
      if (res) {
        this.createTemplateService.active_template.next(null);
        this.renderer2.setStyle(this.ele.nativeElement, 'width', 99 + '%');
        this.loading = true;
        if (this.createTemplateService.background.scale === this.typeScreen.PC) {
          this.renderer2.setStyle(this.ele.nativeElement, 'width', 2560 + 'px');
        } else {
          this.renderer2.setStyle(this.ele.nativeElement, 'width', 1059 + 'px');
          this.renderer2.setStyle(this.ele.nativeElement, 'height', 2118 + 'px');
        }
        this.changeScale();
        setTimeout(() => {
          console.log((this.eleParent.nativeElement as HTMLDivElement).innerHTML);
        });
        setTimeout(() => {
          html2canvas(this.ele.nativeElement).then((canvas) => {
            const a = this.renderer2.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'test.png';
            a.click();
            this.renderer2.setStyle(this.ele.nativeElement, 'width', '100%');
            if (this.createTemplateService.background.scale === this.typeScreen.MOBILE) {
              this.renderer2.setStyle(this.ele.nativeElement, 'height', '100%');

            }
            this.changeScale();
            this.loading = false;
            this.createTemplateService.save_to_img.next(false);
          })
        });
      }
    })
    this.background = this.createTemplateService.background;
    this.createTemplateService.listen_full_screen().subscribe((res: boolean) => {
      if (res && this.createTemplateService.background.scale === TypeScreen.PC) {
        if (this.ele.nativeElement.requestFullscreen) {
          this.ele.nativeElement.requestFullscreen();
        } else if (this.ele.nativeElement.webkitRequestFullscreen) { /* Safari */
          this.ele.nativeElement.webkitRequestFullscreen();
        } else if (this.ele.nativeElement.msRequestFullscreen) { /* IE11 */
          this.ele.nativeElement.msRequestFullscreen();
        }
      }
    });
  }

  changeScale() {
    if (this.createTemplateService.background.scale === this.typeScreen.MOBILE) {
      this.createTemplateService.scaleDefault = 353;
    } else {
      this.createTemplateService.scaleDefault = 854;
    }
    this.scale = (this.ele.nativeElement as HTMLDivElement).clientWidth / this.createTemplateService.scaleDefault;
    this.createTemplateService.currentWidth = (this.ele.nativeElement as HTMLDivElement).clientWidth;
    this.createTemplateService.currentHeight = (this.ele.nativeElement as HTMLDivElement).clientHeight;
  }

  mouseOver(e: MouseEvent) {

  }

  wheel(event: WheelEvent) {
    // if (event.deltaY > 0) {
    //   // console.log(ele.clientWidth);
    //   this.renderer2.setStyle(this.ele.nativeElement, 'width', this.ele.nativeElement.clientWidth + 20 + 'px');
    // } else {
    //   console.log("Scrolling up");
    //   // Perform actions for scrolling up
    //   this.renderer2.setStyle(this.ele.nativeElement, 'width', this.ele.nativeElement.clientWidth - 20 + 'px');

    // }
  }

  selectBackground() {
    // this.createTemplateService.active_template.next(null);
  }

}
