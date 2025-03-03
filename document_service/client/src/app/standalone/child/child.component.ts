import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { StandaloneService } from '../standalone.service';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss']
})
export class ChildComponent implements OnInit {
  @Input() math: any;
  constructor(private service: StandaloneService) { }
  ngOnInit(): void {
    console.log(this.math, this.service.math);
  }

}