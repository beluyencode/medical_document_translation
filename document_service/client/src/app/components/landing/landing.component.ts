import { Component, OnInit, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  test = signal<any>(1);
  test3 = signal<any>([2, 3]);
  test2 = computed(() => this.test());

  constructor() {

  }

  ngOnInit(): void {
    this.test.mutate((v) => {
      v = 23
    })
  }


}
