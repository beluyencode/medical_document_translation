import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ChildComponent } from './child/child.component';
import { StandaloneService } from './standalone.service';

@Component({
  selector: 'app-standalone',
  standalone: true,
  imports: [ChildComponent, CommonModule],
  providers: [StandaloneService],
  templateUrl: './standalone.component.html',
  styleUrls: ['./standalone.component.scss']
})
export class StandaloneComponent implements OnInit {
  @Input() math: any;
  constructor(private service: StandaloneService) {

  }
  ngOnInit(): void {
    console.log(this.math, this.service.math);
  }


}
